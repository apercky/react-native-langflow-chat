import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Clipboard,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Import components
import { LoadingBubble } from "./components/Loading";
import { MessageWithCitations } from "./components/MessageWithCitations";
import { ChatMessage, LangFlowChatWidgetProps } from "./types";
import { createDebugLogger, getTriggerButtonPosition } from "./utils";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const LangFlowChatWidget: React.FC<LangFlowChatWidgetProps> = ({
  flowId,
  hostUrl,
  apiKey,
  windowTitle = "Chat",
  chatInputs,
  chatInputField,
  tweaks,
  sessionId,
  additionalHeaders,
  placeholder = "Type your message...",
  placeholderSending = "Sending...",
  inputType = "chat",
  outputType = "chat",
  outputComponent,
  // Localization props with English defaults
  errorMessage = "Sorry, there was an error processing your message. Please try again.",
  fallbackMessage = "I received your message but couldn't generate a proper response.",
  sourceTooltipTitle = "Source",
  pageText = "Page",
  ofText = "of",
  closeButtonAriaLabel = "Close",
  chatPosition = "bottom-right",
  height,
  width,
  startOpen = false,
  debugEnabled = false,
  enableMarkdown = true,
  fontSize = 12,
  botMessageStyle,
  chatWindowStyle,
  errorMessageStyle,
  inputContainerStyle,
  inputStyle,
  sendButtonStyle,
  userMessageStyle,
  citationBubbleColor = "#4a4a4a", // Dark gray default
  triggerComponent,
  triggerButtonStyle,
  onMessage,
  onError,
  onLoad,
  onModalVisibilityChange,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(startOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const currentSessionId = useRef(
    sessionId ||
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create debug loggers
  const { debugLog, debugError } = createDebugLogger(debugEnabled);

  useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  // Notifica i cambiamenti di visibilità della modale
  useEffect(() => {
    if (onModalVisibilityChange) {
      onModalVisibilityChange(isModalVisible);
    }
  }, [isModalVisible, onModalVisibilityChange]);

  // Anima il pulsante quando cambia lo stato di loading
  useEffect(() => {
    debugLog("🎬 isLoading changed:", isLoading);
    animateButtonIcon(isLoading);

    // Se è in loading, aggiungi un pulse continuo
    if (isLoading) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(buttonScale, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(buttonScale, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );

      // Inizia il pulse dopo l'animazione iniziale
      setTimeout(() => {
        if (isLoading) {
          // Controlla se è ancora in loading
          pulseAnimation.start();
        }
      }, 500);

      return () => {
        pulseAnimation.stop();
      };
    }

    // Return esplicito quando non è in loading
    return undefined;
  }, [isLoading]);

  const handleCloseModal = () => {
    setIsModalVisible(false);
    // Pulisce lo storico dei messaggi quando si chiude la chat
    setMessages([]);
    // Reset del testo di input se presente
    setInputText("");
    // Reset dello stato di loading
    setIsLoading(false);
    // Reset del pulsante scroll to bottom
    setShowScrollToBottom(false);
    // Pulisce il timeout dello scroll
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
    // Annulla eventuali richieste in corso
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    // Genera un nuovo sessionId per la prossima conversazione
    currentSessionId.current =
      sessionId ||
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      // L'animazione è ora gestita dal useEffect
      debugLog("🛑 Generation stopped by user");
    }
  };

  const sendMessageToLangFlow = async (
    message: string,
    onChunk?: (chunk: string) => void,
    controller?: AbortController
  ): Promise<string> => {
    try {
      const url = `${hostUrl.replace(
        /\/$/,
        ""
      )}/api/v1/run/${flowId}?stream=true`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(apiKey && { "x-api-key": apiKey }),
        ...additionalHeaders,
      };

      const body = {
        input_value: message,
        output_type: outputType,
        input_type: inputType,
        ...(outputComponent && { output_component: outputComponent }),
        ...(tweaks && { tweaks }),
        ...(chatInputs && { chat_inputs: chatInputs }),
        ...(chatInputField && { chat_input_field: chatInputField }),
        session_id: currentSessionId.current,
      };

      // Debug logging
      debugLog("🚀 LangFlow Streaming Request:", {
        url,
        method: "POST",
        headers,
        body: JSON.stringify(body, null, 2),
      });

      // Use XMLHttpRequest for true real-time streaming
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let fullResponse = "";
        let lastProcessedLength = 0;

        // Set up abort handling
        if (controller) {
          controller.signal.addEventListener("abort", () => {
            debugLog("🛑 Aborting XMLHttpRequest...");
            xhr.abort();
            reject(new Error("AbortError"));
          });
        }

        xhr.open("POST", url, true);

        // Set headers
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });

        // Process chunks as they arrive
        xhr.onprogress = (event) => {
          // Get only the new data
          const newData = xhr.responseText.substring(lastProcessedLength);
          lastProcessedLength = xhr.responseText.length;

          if (newData) {
            debugLog("📦 New streaming chunk received:", newData);

            // Process each line (each line is a complete JSON event)
            const lines = newData.split("\n");

            for (const line of lines) {
              if (!line.trim()) continue;

              try {
                const data = JSON.parse(line.trim());
                debugLog("📨 Parsed event:", JSON.stringify(data, null, 2));

                // Handle "token" events with streaming chunks
                if (data.event === "token" && data.data && data.data.chunk) {
                  const chunkText = data.data.chunk;
                  debugLog("💬 REAL-TIME token chunk:", chunkText);

                  if (chunkText) {
                    fullResponse += chunkText;

                    // Call the chunk callback to update UI in REAL-TIME
                    if (onChunk) {
                      debugLog(
                        `🔥 REAL-TIME UI update with text (${fullResponse.length} chars)`
                      );
                      onChunk(fullResponse);

                      // Trigger more frequent scrolls during streaming
                      if (scrollViewRef.current) {
                        const isAtBottom = isScrolledToBottom();
                        if (isAtBottom) {
                          scrollToBottom(true);
                        }
                      }
                    }
                  }
                }
                // Handle "end" event
                else if (
                  data.event === "end" &&
                  data.data &&
                  data.data.result
                ) {
                  debugLog("🏁 Stream ended with final result");
                  // Final message handling if needed
                  const result = data.data.result;

                  // Extract final message from the end event
                  if (result.outputs && result.outputs.length > 0) {
                    const output = result.outputs[0];
                    if (output.outputs && output.outputs.length > 0) {
                      const firstOutput = output.outputs[0];
                      if (firstOutput.results && firstOutput.results.message) {
                        const finalMessage =
                          firstOutput.results.message.text ||
                          firstOutput.results.message;
                        debugLog(
                          "📝 Final message from end event:",
                          finalMessage
                        );
                        // Use final message as fallback if streaming didn't capture everything
                        if (
                          finalMessage &&
                          finalMessage.length > fullResponse.length
                        ) {
                          fullResponse = finalMessage;
                          // Update UI with complete message if needed
                          if (onChunk) {
                            onChunk(fullResponse);
                          }
                        }
                      }
                    }
                  }
                }
                // Handle "add_message" events (optional, mainly for logging)
                else if (data.event === "add_message") {
                  debugLog("📨 Message added:", data.data.text);
                }
              } catch (parseError) {
                debugLog("⚠️ Could not parse line as JSON:", line, parseError);
              }
            }
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            debugLog("✅ XMLHttpRequest completed successfully");
            resolve(fullResponse || fallbackMessage);
          } else {
            debugError("❌ HTTP error:", xhr.status, xhr.statusText);
            reject(new Error(`HTTP error: ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          debugError("💥 XMLHttpRequest network error");
          reject(new Error("Network error"));
        };

        xhr.onabort = () => {
          debugLog("🛑 XMLHttpRequest aborted");
          reject(new Error("AbortError"));
        };

        // Send the request
        xhr.send(JSON.stringify(body));
      });
    } catch (error) {
      // Handle AbortError separately to avoid logging as error
      if (error instanceof Error && error.name === "AbortError") {
        debugLog("🛑 Stream request was aborted");
        throw error; // Re-throw to be handled by caller
      }

      debugError("💥 LangFlow Streaming API Error:", error);
      debugError(
        "💥 Error Stack:",
        error instanceof Error ? error.stack : "No stack trace"
      );
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: "user",
      text: inputText.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    // Create AbortController for this request
    const controller = new AbortController();
    setAbortController(controller);

    // Notify parent component
    if (onMessage) {
      onMessage({
        type: "user_message",
        text: userMessage.text,
        timestamp: userMessage.timestamp,
      });
    }

    let botMessageId: string | null = null;
    let isAtBottomBeforeResponse = true;
    let lastScrollTime = 0;

    // Check if we're at bottom before starting response
    setTimeout(() => {
      isAtBottomBeforeResponse = isScrolledToBottom();
    }, 100);

    try {
      const response = await sendMessageToLangFlow(
        userMessage.text,
        // Streaming callback to update the bot message in real-time
        (chunk: string) => {
          const now = Date.now();
          const shouldScroll =
            isAtBottomBeforeResponse && now - lastScrollTime > 100;

          setMessages((prev) => {
            // If we don't have a bot message ID yet, create the first bot message
            if (!botMessageId) {
              botMessageId = `bot_${Date.now()}`;
              const botMessage: ChatMessage = {
                id: botMessageId,
                type: "bot",
                text: chunk,
                timestamp: Date.now(),
              };

              // Scroll to bottom on first chunk - immediate
              setTimeout(() => scrollToBottom(true), 10);
              lastScrollTime = now;

              return [...prev, botMessage];
            } else {
              // Update existing bot message
              const updatedMessages = prev.map((msg) =>
                msg.id === botMessageId ? { ...msg, text: chunk } : msg
              );

              // Scroll to bottom on each chunk update if user was already at bottom
              // Limita la frequenza di scroll a max 10 volte al secondo
              if (shouldScroll) {
                setTimeout(() => scrollToBottom(!showScrollToBottom), 10);
                lastScrollTime = now;
              }

              return updatedMessages;
            }
          });
        },
        controller
      );

      // Final update with complete response (in case streaming missed something)
      if (botMessageId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId ? { ...msg, text: response } : msg
          )
        );
      }

      // Notify parent component with final message
      if (onMessage) {
        onMessage({
          type: "bot_message",
          text: response,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      // Check if it was aborted by user
      if (error instanceof Error && error.name === "AbortError") {
        debugLog("🛑 Request was aborted by user");
        // Remove the bot message if it was created
        if (botMessageId) {
          setMessages((prev) => prev.filter((msg) => msg.id !== botMessageId));
        }
        return;
      }

      // Remove the bot message and add error message for real errors
      if (botMessageId) {
        setMessages((prev) => prev.filter((msg) => msg.id !== botMessageId));
      }

      const errorMessageObj: ChatMessage = {
        id: `error_${Date.now()}`,
        type: "error",
        text: errorMessage,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessageObj]);

      // Log and notify parent component only for real errors
      debugError("💥 LangFlow Streaming API Error:", error);
      debugError(
        "💥 Error Stack:",
        error instanceof Error ? error.stack : "No stack trace"
      );

      if (onError) {
        onError({
          message: error instanceof Error ? error.message : "Unknown error",
          details: error,
        });
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const scrollToBottom = (immediate: boolean = false) => {
    if (immediate) {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    } else {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  };

  // Funzione per verificare se siamo già in fondo alla chat
  const isScrolledToBottom = () => {
    if (!scrollViewRef.current) return true;

    // Accediamo alle proprietà in modo sicuro
    const contentOffset = scrollViewRef.current as any;
    const contentOffsetY = contentOffset?.contentOffset?.y || 0;
    const contentHeight = contentOffset?.contentSize?.height || 0;
    const scrollViewHeight = contentOffset?.layoutMeasurement?.height || 0;

    // Considera "in fondo" se siamo a meno di 100px dal fondo
    return contentHeight - (contentOffsetY + scrollViewHeight) <= 100;
  };

  const handleScroll = (event: any) => {
    // Estrai i valori dall'evento PRIMA del setTimeout per evitare event pooling issues
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollPosition = contentOffset.y;
    const contentHeight = contentSize.height;
    const containerHeight = layoutMeasurement.height;

    // Clear previous timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Debounce scroll handling
    scrollTimeoutRef.current = setTimeout(() => {
      // Calcola se siamo vicini al fondo (threshold più generoso)
      const distanceFromBottom =
        contentHeight - (scrollPosition + containerHeight);
      const isNearBottom = distanceFromBottom <= 100;

      // Mostra il pulsante solo se:
      // 1. Non siamo vicini al fondo
      // 2. Ci sono messaggi da mostrare
      // 3. Il contenuto è più alto del container (c'è qualcosa da scrollare)
      const shouldShow =
        !isNearBottom &&
        messages.length > 0 &&
        contentHeight > containerHeight + 50;

      setShowScrollToBottom(shouldShow);
    }, 100);
  };

  const scrollToBottomPressed = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
    setShowScrollToBottom(false);
  };

  const animateButtonIcon = (toLoading: boolean) => {
    debugLog("🎬 Starting button animation, toLoading:", toLoading);

    // Reset dei valori prima dell'animazione
    buttonOpacity.setValue(1);
    buttonScale.setValue(1);

    Animated.sequence([
      // Fase 1: Fade out e scale down drastici
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 0.6,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      // Fase 2: Fade in e scale up
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      debugLog("🎬 Button animation completed");
    });
  };

  const handleCopyMessage = (text: string) => {
    Clipboard.setString(text);
    debugLog("📋 Message copied to clipboard:", text.substring(0, 50) + "...");
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.type === "user";
    const isError = message.type === "error";

    const messageContainerStyle = [
      styles.messageContainer,
      isUser ? styles.userMessageContainer : styles.botMessageContainer,
    ];

    const messageStyle = [
      styles.messageText,
      {
        fontSize: fontSize,
        lineHeight: Math.round(fontSize * 1.4), // lineHeight proporzionale (1.4x fontSize)
      },
      isUser
        ? { ...styles.userMessageText, ...userMessageStyle }
        : isError
        ? { ...styles.errorMessageText, ...errorMessageStyle }
        : { ...styles.botMessageText, ...botMessageStyle },
    ];

    return (
      <View key={message.id} style={messageContainerStyle}>
        <View
          style={[
            styles.messageBubble,
            isUser
              ? { ...styles.userMessageBubble, ...userMessageStyle }
              : isError
              ? { ...styles.errorMessageBubble, ...errorMessageStyle }
              : { ...styles.botMessageBubble, ...botMessageStyle },
          ]}
        >
          {/* Copy button */}
          <TouchableOpacity
            style={[
              styles.copyButton,
              isUser ? styles.copyButtonUser : styles.copyButtonBot,
            ]}
            onPress={() => handleCopyMessage(message.text)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="content-copy"
              size={16}
              color={isUser ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)"}
            />
          </TouchableOpacity>

          {/* Message content */}
          {isUser ? (
            <View style={styles.userMessageContent}>
              <Text style={messageStyle}>{message.text}</Text>
            </View>
          ) : (
            <MessageWithCitations
              text={message.text}
              messageStyle={messageStyle}
              sourceTooltipTitle={sourceTooltipTitle}
              pageText={pageText}
              ofText={ofText}
              citationBubbleColor={citationBubbleColor}
              enableMarkdown={enableMarkdown && !isError}
              fontSize={fontSize}
            />
          )}
        </View>
      </View>
    );
  };

  const renderTriggerButton = () => {
    if (triggerComponent) {
      return (
        <TouchableOpacity
          style={[getTriggerButtonPosition(chatPosition), triggerButtonStyle]}
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.7}
        >
          {triggerComponent}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.triggerButton,
          getTriggerButtonPosition(chatPosition),
          triggerButtonStyle,
        ]}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.triggerButtonContent}>
          <View style={styles.chatIconContainer}>
            <MaterialCommunityIcons
              name="message-text-outline"
              size={24}
              color="#000000"
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const modalWidth = width || screenWidth * 0.9;
  const modalHeight = height || screenHeight * 0.9;

  return (
    <>
      {renderTriggerButton()}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
          >
            <View
              style={[
                styles.chatContainer,
                {
                  maxWidth: modalWidth,
                  width: modalWidth,
                  maxHeight: modalHeight,
                  height: modalHeight,
                },
                chatWindowStyle,
              ]}
            >
              {/* Header */}
              <View style={styles.chatHeader}>
                <Text style={styles.chatTitle}>{windowTitle}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseModal}
                  accessibilityLabel={closeButtonAriaLabel}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={18}
                    color="#6c757d"
                  />
                </TouchableOpacity>
              </View>

              {/* Messages */}
              <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              >
                {messages.map(renderMessage)}
                {isLoading && (
                  <LoadingBubble botMessageStyle={botMessageStyle} />
                )}
                <View style={styles.scrollSpacer} />
              </ScrollView>

              {/* Scroll to Bottom Button */}
              {showScrollToBottom && (
                <TouchableOpacity
                  style={styles.scrollToBottomButton}
                  onPress={scrollToBottomPressed}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              )}

              {/* Input */}
              <View style={[styles.inputContainer, inputContainerStyle]}>
                <TextInput
                  style={[styles.textInput, inputStyle]}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder={isLoading ? placeholderSending : placeholder}
                  placeholderTextColor="#999"
                  multiline
                  maxLength={1000}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    sendButtonStyle,
                    !inputText.trim() &&
                      !isLoading &&
                      styles.sendButtonDisabled,
                    isLoading && styles.sendButtonLoading,
                  ]}
                  onPress={isLoading ? handleStopGeneration : handleSendMessage}
                  disabled={!inputText.trim() && !isLoading}
                >
                  <Animated.View
                    style={{
                      opacity: buttonOpacity,
                      transform: [{ scale: buttonScale }],
                    }}
                  >
                    {isLoading ? (
                      <MaterialCommunityIcons
                        name="stop"
                        size={20}
                        color="white"
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="send"
                        size={20}
                        color="white"
                      />
                    )}
                  </Animated.View>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  triggerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  keyboardAvoidingView: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  chatContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    overflow: "hidden",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    width: "100%",
    maxWidth: "98%",
    flex: 1,
    maxHeight: "98%",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
  },
  chatTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#000000",
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#fafbfc",
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessageContent: {
    paddingRight: 20,
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  botMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginVertical: 2,
  },
  userMessageBubble: {
    backgroundColor: "#000000",
    borderBottomRightRadius: 6,
  },
  botMessageBubble: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  errorMessageBubble: {
    backgroundColor: "#ffebee",
    borderColor: "#ffcdd2",
    borderWidth: 1,
  },
  messageText: {
    // fontSize e lineHeight sono ora controllati dinamicamente dal prop fontSize
    fontWeight: "400",
  },
  userMessageText: {
    color: "white",
    fontWeight: "500",
  },
  botMessageText: {
    color: "#2c2c2c",
  },
  errorMessageText: {
    color: "#d32f2f",
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.06)",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    maxHeight: 120,
    backgroundColor: "#f8f9fa",
    color: "#000000",
    fontWeight: "400",
  },
  sendButton: {
    marginLeft: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#e9ecef",
  },
  sendButtonLoading: {
    backgroundColor: "#4a4a4a",
  },
  triggerButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  chatIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollSpacer: {
    height: 100,
  },
  scrollToBottomButton: {
    position: "absolute",
    bottom: 110,
    left: "50%",
    marginLeft: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  copyButton: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  copyButtonUser: {
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  copyButtonBot: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
});

export default LangFlowChatWidget;
