import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

// Optional markdown support - only import if available
let ReactNativeMarked: any = null;
let useMarkdown: any = null;
try {
  const marked = require("react-native-marked");
  ReactNativeMarked = marked.default;
  useMarkdown = marked.useMarkdown;
} catch (error) {
  // react-native-marked not available, will use plain text
}

// Types
export interface LangFlowMessage {
  type: "user_message" | "bot_message" | "system" | "error";
  text: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}

export interface LangFlowError {
  message: string;
  code?: string;
  details?: any;
}

export type ChatPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center-right"
  | "bottom-right"
  | "bottom-center"
  | "bottom-left";

export interface LangFlowChatWidgetProps {
  // Required props
  flowId: string;
  hostUrl: string;
  apiKey?: string;

  // Optional configuration
  windowTitle?: string;
  chatInputs?: Record<string, any>;
  chatInputField?: string;
  tweaks?: Record<string, any>;
  sessionId?: string;
  additionalHeaders?: Record<string, any>;

  // Content props
  placeholder?: string;
  placeholderSending?: string;
  inputType?: string;
  outputType?: string;
  outputComponent?: string;

  // Localization props
  loadingText?: string;
  errorMessage?: string;
  fallbackMessage?: string;
  sourceTooltipTitle?: string;
  pageText?: string;
  ofText?: string;
  closeButtonAriaLabel?: string;

  // Behavior props
  chatPosition?: ChatPosition;
  height?: number;
  width?: number;
  online?: boolean;
  startOpen?: boolean;
  debugEnabled?: boolean;
  enableMarkdown?: boolean;

  // Styling props - converted to React Native styles
  botMessageStyle?: ViewStyle & TextStyle;
  chatWindowStyle?: ViewStyle;
  errorMessageStyle?: ViewStyle & TextStyle;
  inputContainerStyle?: ViewStyle;
  inputStyle?: ViewStyle & TextStyle;
  sendButtonStyle?: ViewStyle & TextStyle;
  userMessageStyle?: ViewStyle & TextStyle;
  citationBubbleColor?: string;

  // Custom trigger button
  triggerComponent?: React.ReactNode;
  triggerButtonStyle?: ViewStyle;

  // Events
  onMessage?: (message: LangFlowMessage) => void;
  onError?: (error: LangFlowError) => void;
  onLoad?: () => void;
}

interface ChatMessage {
  id: string;
  type: "user" | "bot" | "system" | "error";
  text: string;
  timestamp: number;
}

// Aggiungiamo le interfacce per le citazioni
interface Citation {
  id: number;
  src: string;
  page: string;
  total_pages: string;
  displayText: string;
}

interface ParsedMessage {
  text: string;
  citations: Citation[];
}

// Funzione per parsare i messaggi e estrarre le citazioni
const parseMessageWithCitations = (text: string): ParsedMessage => {
  const citationRegex =
    /\[src name="([^"]+)" page="([^"]+)" total_pages="([^"]+)"\]/g;
  const citations: Citation[] = [];
  let citationCounter = 1;

  // Sostituiamo ogni citazione con un placeholder numerato
  const parsedText = text.replace(
    citationRegex,
    (match, src, page, total_pages) => {
      const citation: Citation = {
        id: citationCounter,
        src,
        page,
        total_pages,
        displayText: `${src} - Page ${page}/${total_pages}`,
      };
      citations.push(citation);
      return `◐${citationCounter++}◑`; // Placeholder temporaneo
    }
  );

  return { text: parsedText, citations };
};

// Componente per il pallino della citazione
const CitationBubble: React.FC<{
  citation: Citation;
  onPress: () => void;
  citationBubbleColor: string;
}> = ({ citation, onPress, citationBubbleColor }) => (
  <TouchableOpacity
    style={[styles.citationBubble, { backgroundColor: citationBubbleColor }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.citationNumber}>{citation.id}</Text>
  </TouchableOpacity>
);

// Componente per il tooltip della citazione
const CitationTooltip: React.FC<{
  citation: Citation;
  visible: boolean;
  onClose: () => void;
  sourceTitle: string;
  pageText: string;
  ofText: string;
}> = ({ citation, visible, onClose, sourceTitle, pageText, ofText }) => {
  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.tooltipOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.tooltipContainer}>
          <Text style={styles.tooltipTitle}>{sourceTitle}</Text>
          <Text style={styles.tooltipText}>{citation.src}</Text>
          <Text style={styles.tooltipPage}>
            {pageText} {citation.page} {ofText} {citation.total_pages}
          </Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// Componente per renderizzare il testo con citazioni
const MessageWithCitations: React.FC<{
  text: string;
  messageStyle: any;
  sourceTooltipTitle: string;
  pageText: string;
  ofText: string;
  citationBubbleColor: string;
  enableMarkdown: boolean;
}> = ({
  text,
  messageStyle,
  sourceTooltipTitle,
  pageText,
  ofText,
  citationBubbleColor,
  enableMarkdown,
}) => {
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(
    null
  );
  const parsedMessage = parseMessageWithCitations(text);

  // Componente per renderizzare markdown in React Native
  const MarkdownRenderer: React.FC<{ content: string; style: any }> = ({
    content,
    style,
  }) => {
    if (!enableMarkdown || !ReactNativeMarked) {
      return <Text style={style}>{content}</Text>;
    }

    try {
      // Usa useMarkdown hook invece del componente per evitare VirtualizedLists nested
      const elements = useMarkdown
        ? useMarkdown(content, {
            styles: {
              heading1: {
                fontSize: 24,
                fontWeight: "bold",
                marginVertical: 4,
                color: style.color || "#000",
              },
              heading2: {
                fontSize: 20,
                fontWeight: "bold",
                marginVertical: 3,
                color: style.color || "#000",
              },
              heading3: {
                fontSize: 18,
                fontWeight: "bold",
                marginVertical: 2,
                color: style.color || "#000",
              },
              paragraph: {
                ...style,
                marginVertical: 2,
              },
              strong: {
                ...style,
                fontWeight: "bold",
              },
              em: {
                ...style,
                fontStyle: "italic",
              },
              codespan: {
                ...style,
                fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
                backgroundColor: "rgba(0,0,0,0.1)",
                paddingHorizontal: 4,
                paddingVertical: 2,
                borderRadius: 4,
              },
              code: {
                ...style,
                fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
                backgroundColor: "rgba(0,0,0,0.1)",
                padding: 8,
                borderRadius: 6,
                marginVertical: 4,
              },
              listItem: {
                ...style,
                marginVertical: 1,
              },
              link: {
                ...style,
                color: "#007AFF",
                textDecorationLine: "underline",
              },
              blockquote: {
                ...style,
                fontStyle: "italic",
                borderLeftWidth: 3,
                borderLeftColor: "#ccc",
                paddingLeft: 8,
                marginVertical: 4,
                backgroundColor: "rgba(0,0,0,0.05)",
                paddingVertical: 4,
              },
            },
          })
        : null;

      if (elements && elements.length > 0) {
        return (
          <View
            style={{
              width: "100%",
              flexShrink: 1,
            }}
          >
            {elements.map((element: React.ReactNode, index: number) => (
              <View
                key={`markdown-${index}`}
                style={{
                  width: "100%",
                }}
              >
                {element}
              </View>
            ))}
          </View>
        );
      }
    } catch (error) {
      // Fallback to plain text if markdown rendering fails
    }

    return <Text style={style}>{content}</Text>;
  };

  // Dividiamo il testo in parti e citazioni
  const renderTextWithCitations = () => {
    const parts: React.ReactNode[] = [];
    let currentText = parsedMessage.text;
    let keyCounter = 0;

    parsedMessage.citations.forEach((citation) => {
      const placeholder = `◐${citation.id}◑`;
      const splitIndex = currentText.indexOf(placeholder);

      if (splitIndex !== -1) {
        // Aggiungiamo il testo prima della citazione
        if (splitIndex > 0) {
          parts.push(
            <MarkdownRenderer
              key={`text-${keyCounter++}`}
              content={currentText.substring(0, splitIndex)}
              style={messageStyle}
            />
          );
        }

        // Aggiungiamo la citazione
        parts.push(
          <CitationBubble
            key={`citation-${citation.id}`}
            citation={citation}
            onPress={() => setSelectedCitation(citation)}
            citationBubbleColor={citationBubbleColor}
          />
        );

        // Continuiamo con il resto del testo
        currentText = currentText.substring(splitIndex + placeholder.length);
      }
    });

    // Aggiungiamo il testo rimanente
    if (currentText) {
      parts.push(
        <MarkdownRenderer
          key={`text-final`}
          content={currentText}
          style={messageStyle}
        />
      );
    }

    return parts;
  };

  return (
    <View style={styles.messageWithCitations}>
      <View style={styles.citationTextContainer}>
        {renderTextWithCitations()}
      </View>

      <CitationTooltip
        citation={selectedCitation!}
        visible={!!selectedCitation}
        onClose={() => setSelectedCitation(null)}
        sourceTitle={sourceTooltipTitle}
        pageText={pageText}
        ofText={ofText}
      />
    </View>
  );
};

// Componente per la bubble di loading con three dots
const LoadingBubble: React.FC<{
  botMessageStyle?: ViewStyle & TextStyle;
}> = ({ botMessageStyle }) => {
  return (
    <View style={styles.messageContainer}>
      <View style={styles.botMessageContainer}>
        <View
          style={[
            styles.messageBubble,
            styles.botMessageBubble,
            styles.loadingBubble,
            botMessageStyle, // Usa lo stesso stile delle bubble bot
          ]}
        >
          <LoadingDots
            style={styles.bubbleLoadingDots}
            dotStyle={[
              styles.bubbleLoadingDot,
              { color: botMessageStyle?.color || "#666" }, // Usa il colore del testo bot
            ]}
          />
        </View>
      </View>
    </View>
  );
};

// Componente per l'animazione loading dots
const LoadingDots: React.FC<{ style?: any; dotStyle?: any }> = ({
  style,
  dotStyle,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.loadingDotsContainer, style]}>
      {[0, 1, 2].map((index) => (
        <Text
          key={index}
          style={[
            styles.loadingDot,
            dotStyle,
            {
              opacity: index <= activeIndex ? 1 : 0.3,
            },
          ]}
        >
          •
        </Text>
      ))}
    </View>
  );
};

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
  loadingText = "Thinking...",
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

  // Helper functions for conditional logging
  const debugLog = (...args: any[]) => {
    if (debugEnabled) {
      console.log(...args);
    }
  };

  const debugError = (...args: any[]) => {
    if (debugEnabled) {
      console.error(...args);
    }
  };

  useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

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

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller?.signal, // Add abort signal
      });

      debugLog("📡 LangFlow Response Status:", response.status);

      if (!response.ok) {
        // Try to get more details from the error response
        let errorDetails = {};
        try {
          const errorText = await response.text();
          debugLog("❌ LangFlow Error Response Body:", errorText);

          try {
            errorDetails = JSON.parse(errorText);
            debugLog("❌ LangFlow Error Details (JSON):", errorDetails);
          } catch {
            debugLog("❌ LangFlow Error Details (Text):", errorText);
            errorDetails = { error: errorText };
          }
        } catch (textError) {
          debugLog("❌ Could not read error response body:", textError);
        }

        throw new Error(
          `HTTP error! status: ${response.status}, details: ${JSON.stringify(
            errorDetails
          )}`
        );
      }

      // Check if streaming is available
      if (!response.body) {
        debugLog("⚠️ Response body is null, falling back to text response");
        debugLog("🔄 Using FALLBACK mode - but processing streaming events");

        // Fallback to non-streaming response but process streaming events
        const responseText = await response.text();
        debugLog("✅ LangFlow Fallback Response:", responseText);

        // Process streaming events from the text response
        const lines = responseText.split("\n").filter((line) => line.trim());
        let fullResponse = "";
        const tokens: string[] = [];

        // First, collect all tokens
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            debugLog("📨 Parsed event:", JSON.stringify(data, null, 2));

            // Handle "token" events with streaming chunks
            if (data.event === "token" && data.data && data.data.chunk) {
              const chunkText = data.data.chunk;
              debugLog("💬 Token chunk:", chunkText);

              if (chunkText) {
                tokens.push(chunkText);
              }
            }
          } catch (parseError) {
            debugLog("⚠️ Could not parse line as JSON:", line, parseError);
          }
        }

        // Then, simulate streaming by sending tokens with delay
        let accumulatedText = "";
        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          accumulatedText += token;
          const textToSend = accumulatedText;

          // Use setTimeout to simulate streaming delay
          setTimeout(() => {
            if (onChunk) {
              onChunk(textToSend);
            }
          }, i * 50); // 50ms delay between tokens
        }

        // Set fullResponse for return value
        fullResponse = tokens.join("");

        if (fullResponse) {
          debugLog("💬 Fallback streaming response:", fullResponse);
          return fullResponse;
        } else {
          return fallbackMessage;
        }
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      debugLog("🚀 Using STREAMING mode - processing chunks");

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            debugLog("✅ Stream completed");
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          debugLog("📦 Raw chunk:", chunk);

          // Split by lines since each JSON event is on a separate line
          const lines = chunk.split("\n").filter((line) => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              debugLog("📨 Parsed event:", JSON.stringify(data, null, 2));

              // Handle "token" events with streaming chunks
              if (data.event === "token" && data.data && data.data.chunk) {
                const chunkText = data.data.chunk;
                debugLog("💬 Token chunk:", chunkText);

                if (chunkText) {
                  fullResponse += chunkText;

                  // Call the chunk callback to update UI in real-time with accumulated text
                  if (onChunk) {
                    onChunk(fullResponse);
                  }
                }
              }
              // Handle "end" event with final result
              else if (data.event === "end" && data.data && data.data.result) {
                debugLog("🏁 Stream ended with final result");
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
      } finally {
        reader.releaseLock();
      }

      if (!fullResponse) {
        debugLog("⚠️ No response content found, using fallback");
        debugLog("⚠️ fullResponse length:", fullResponse.length);
        debugLog("⚠️ fullResponse value:", JSON.stringify(fullResponse));
        fullResponse = fallbackMessage;
      }

      debugLog("💬 Final complete response:", fullResponse);
      debugLog("💬 Final response length:", fullResponse.length);
      return fullResponse;
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
    // L'animazione è ora gestita dal useEffect

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

    try {
      const response = await sendMessageToLangFlow(
        userMessage.text,
        // Streaming callback to update the bot message in real-time
        (chunk: string) => {
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
              return [...prev, botMessage];
            } else {
              // Update existing bot message
              return prev.map((msg) =>
                msg.id === botMessageId ? { ...msg, text: chunk } : msg
              );
            }
          });
        },
        controller // Pass the AbortController
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
        // Don't log as error or show error message for user-initiated abort
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
      // L'animazione è ora gestita dal useEffect
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 50;
    setShowScrollToBottom(!isAtBottom && messages.length > 0);
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getTriggerButtonPosition = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      position: "absolute",
      zIndex: 1000,
    };

    switch (chatPosition) {
      case "top-left":
        return { ...baseStyle, top: 50, left: 20 };
      case "top-center":
        return { ...baseStyle, top: 50, left: screenWidth / 2 - 30 };
      case "top-right":
        return { ...baseStyle, top: 50, right: 20 };
      case "center-left":
        return { ...baseStyle, top: screenHeight / 2 - 30, left: 20 };
      case "center-right":
        return { ...baseStyle, top: screenHeight / 2 - 30, right: 20 };
      case "bottom-left":
        return { ...baseStyle, bottom: 50, left: 20 };
      case "bottom-center":
        return { ...baseStyle, bottom: 50, left: screenWidth / 2 - 30 };
      case "bottom-right":
      default:
        return { ...baseStyle, bottom: 50, right: 20 };
    }
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.type === "user";
    const isError = message.type === "error";

    const messageContainerStyle = [
      styles.messageContainer,
      isUser ? styles.userMessageContainer : styles.botMessageContainer,
    ];

    const messageStyle = [
      styles.messageText,
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
          {isUser ? (
            // Per i messaggi utente, usa solo testo normale senza markdown
            <Text style={messageStyle}>{message.text}</Text>
          ) : (
            // Per i messaggi bot ed errori, usa il componente con citazioni e markdown
            <MessageWithCitations
              text={message.text}
              messageStyle={messageStyle}
              sourceTooltipTitle={sourceTooltipTitle}
              pageText={pageText}
              ofText={ofText}
              citationBubbleColor={citationBubbleColor}
              enableMarkdown={enableMarkdown && !isError} // Disabilita markdown per errori
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
          style={[getTriggerButtonPosition(), triggerButtonStyle]}
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
          getTriggerButtonPosition(),
          triggerButtonStyle,
        ]}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.triggerButtonContent}>
          {/* Chat Icon */}
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
                  width: modalWidth,
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

              {/* Removed status bar for cleaner look */}

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
                {/* Spacer per permettere scroll completo */}
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
                    isLoading && styles.sendButtonLoading, // Nuovo stile per loading
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
  triggerButtonText: {
    fontSize: 28,
    color: "white",
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
    maxWidth: 500,
    flex: 1,
    maxHeight: "90%",
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
  statusContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#e8f5e8",
  },
  statusText: {
    fontSize: 12,
    color: "#4caf50",
    textAlign: "center",
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#fafbfc",
  },
  messageContainer: {
    marginVertical: 4, // Ridotto da 6 a 4
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  botMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16, // Ridotto da 18 a 16
    paddingVertical: 12, // Ridotto da 14 a 12
    borderRadius: 20, // Ridotto da 24 a 20
    marginVertical: 2,
  },
  userMessageBubble: {
    backgroundColor: "#000000",
    borderBottomRightRadius: 6, // Ridotto da 8 a 6
  },
  botMessageBubble: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 6, // Ridotto da 8 a 6
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  errorMessageBubble: {
    backgroundColor: "#ffebee",
    borderColor: "#ffcdd2",
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14, // Ridotto da 16 a 14
    lineHeight: 19, // Ridotto da 22 a 19
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
    backgroundColor: "#4a4a4a", // Dark gray instead of red
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
  // Aggiungiamo gli stili per le citazioni
  citationBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
    marginRight: 4,
  },
  citationNumber: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  messageWithCitations: {
    flexDirection: "row",
    alignItems: "center",
  },
  citationTextContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  tooltipOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  tooltipContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    maxWidth: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  tooltipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  tooltipText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },
  tooltipPage: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  scrollSpacer: {
    height: 100, // Adjust as needed to ensure enough space for the last message
  },
  loadingDotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: 20,
    height: 20,
  },
  loadingDot: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
    marginHorizontal: 1,
    lineHeight: 16,
  },
  loadingBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    // Rimuovo background e border fissi - userà quelli di botMessageBubble
  },
  bubbleLoadingDots: {
    marginLeft: 4,
  },
  bubbleLoadingDot: {
    fontSize: 16,
    color: "#666",
    fontWeight: "bold",
    marginHorizontal: 1,
    lineHeight: 16,
  },
  scrollToBottomButton: {
    position: "absolute",
    bottom: 90, // Sopra l'input container (che ha circa 80px di altezza)
    right: 20,
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
});

export default LangFlowChatWidget;
