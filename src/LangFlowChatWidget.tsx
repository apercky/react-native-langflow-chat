import React, { useMemo } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { WebView } from "react-native-webview";

// Define types directly in this file to avoid circular dependency
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

  // Optional props with comprehensive typing
  apiKey?: string;
  windowTitle?: string;
  chatInputs?: Record<string, any>;
  chatInputField?: string;
  tweaks?: Record<string, any>;

  // Styling props (JSON objects)
  botMessageStyle?: Record<string, any>;
  chatTriggerStyle?: Record<string, any>;
  chatWindowStyle?: Record<string, any>;
  errorMessageStyle?: Record<string, any>;
  inputContainerStyle?: Record<string, any>;
  inputStyle?: Record<string, any>;
  sendButtonStyle?: Record<string, any>;
  sendIconStyle?: Record<string, any>;
  userMessageStyle?: Record<string, any>;

  // Layout and behavior props
  chatPosition?: ChatPosition;
  height?: number;
  width?: number;
  online?: boolean;
  startOpen?: boolean;

  // Text content props
  onlineMessage?: string;
  placeholder?: string;
  placeholderSending?: string;

  // Input/Output configuration
  inputType?: string;
  outputType?: string;
  outputComponent?: string;

  // Session and headers
  sessionId?: string;
  additionalHeaders?: Record<string, any>;

  // WebView specific props
  webViewStyle?: ViewStyle;
  containerStyle?: ViewStyle;

  // Events
  onMessage?: (message: LangFlowMessage) => void;
  onError?: (error: LangFlowError) => void;
  onLoad?: () => void;
}

const LangFlowChatWidget: React.FC<LangFlowChatWidgetProps> = ({
  flowId,
  hostUrl,
  apiKey,
  windowTitle,
  chatInputs,
  chatInputField,
  tweaks,
  botMessageStyle,
  chatTriggerStyle,
  chatWindowStyle,
  errorMessageStyle,
  inputContainerStyle,
  inputStyle,
  sendButtonStyle,
  sendIconStyle,
  userMessageStyle,
  chatPosition = "bottom-right",
  height,
  width,
  online,
  startOpen,
  onlineMessage,
  placeholder,
  placeholderSending,
  inputType,
  outputType,
  outputComponent,
  sessionId,
  additionalHeaders,
  webViewStyle,
  containerStyle,
  onMessage,
  onError,
  onLoad,
}) => {
  const htmlContent = useMemo(() => {
    // Helper function to safely stringify JSON props
    const safeJsonStringify = (obj: any): string | undefined => {
      if (!obj) return undefined;
      try {
        return JSON.stringify(obj).replace(/"/g, "&quot;");
      } catch {
        return undefined;
      }
    };

    // Build the langflow-chat attributes
    const attributes: string[] = [];

    // Required attributes
    attributes.push(`flow_id="${flowId}"`);
    attributes.push(`host_url="${hostUrl}"`);

    // Optional string attributes
    if (apiKey) attributes.push(`api_key="${apiKey}"`);
    if (windowTitle) attributes.push(`window_title="${windowTitle}"`);
    if (chatInputField) attributes.push(`chat_input_field="${chatInputField}"`);
    if (chatPosition) attributes.push(`chat_position="${chatPosition}"`);
    if (onlineMessage) attributes.push(`online_message="${onlineMessage}"`);
    if (placeholder) attributes.push(`placeholder="${placeholder}"`);
    if (placeholderSending)
      attributes.push(`placeholder_sending="${placeholderSending}"`);
    if (inputType) attributes.push(`input_type="${inputType}"`);
    if (outputType) attributes.push(`output_type="${outputType}"`);
    if (outputComponent)
      attributes.push(`output_component="${outputComponent}"`);
    if (sessionId) attributes.push(`session_id="${sessionId}"`);

    // Boolean attributes
    if (online !== undefined) attributes.push(`online="${online}"`);
    if (startOpen !== undefined) attributes.push(`start_open="${startOpen}"`);

    // Number attributes
    if (height) attributes.push(`height="${height}"`);
    if (width) attributes.push(`width="${width}"`);

    // JSON object attributes
    if (chatInputs) {
      const jsonStr = safeJsonStringify(chatInputs);
      if (jsonStr) attributes.push(`chat_inputs='${jsonStr}'`);
    }
    if (tweaks) {
      const jsonStr = safeJsonStringify(tweaks);
      if (jsonStr) attributes.push(`tweaks='${jsonStr}'`);
    }
    if (botMessageStyle) {
      const jsonStr = safeJsonStringify(botMessageStyle);
      if (jsonStr) attributes.push(`bot_message_style='${jsonStr}'`);
    }
    if (chatTriggerStyle) {
      const jsonStr = safeJsonStringify(chatTriggerStyle);
      if (jsonStr) attributes.push(`chat_trigger_style='${jsonStr}'`);
    }
    if (chatWindowStyle) {
      const jsonStr = safeJsonStringify(chatWindowStyle);
      if (jsonStr) attributes.push(`chat_window_style='${jsonStr}'`);
    }
    if (errorMessageStyle) {
      const jsonStr = safeJsonStringify(errorMessageStyle);
      if (jsonStr) attributes.push(`error_message_style='${jsonStr}'`);
    }
    if (inputContainerStyle) {
      const jsonStr = safeJsonStringify(inputContainerStyle);
      if (jsonStr) attributes.push(`input_container_style='${jsonStr}'`);
    }
    if (inputStyle) {
      const jsonStr = safeJsonStringify(inputStyle);
      if (jsonStr) attributes.push(`input_style='${jsonStr}'`);
    }
    if (sendButtonStyle) {
      const jsonStr = safeJsonStringify(sendButtonStyle);
      if (jsonStr) attributes.push(`send_button_style='${jsonStr}'`);
    }
    if (sendIconStyle) {
      const jsonStr = safeJsonStringify(sendIconStyle);
      if (jsonStr) attributes.push(`send_icon_style='${jsonStr}'`);
    }
    if (userMessageStyle) {
      const jsonStr = safeJsonStringify(userMessageStyle);
      if (jsonStr) attributes.push(`user_message_style='${jsonStr}'`);
    }
    if (additionalHeaders) {
      const jsonStr = safeJsonStringify(additionalHeaders);
      if (jsonStr) attributes.push(`additional_headers='${jsonStr}'`);
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LangFlow Chat</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: transparent;
            overflow: hidden;
        }
        
        /* Ensure the chat widget fills the container */
        langflow-chat {
            display: block;
            width: 100%;
            height: 100vh;
        }
        
        /* Custom scrollbar for better mobile experience */
        ::-webkit-scrollbar {
            width: 6px;
        }
        
        ::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/gh/langflow-ai/langflow-embedded-chat@v1.0.7/dist/build/static/js/bundle.min.js"></script>
    <script>
        // Post messages to React Native for communication
        function postMessageToRN(type, data) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type, data }));
            }
        }
        
        // Listen for chat events and forward to React Native
        document.addEventListener('DOMContentLoaded', function() {
            const chatElement = document.querySelector('langflow-chat');
            
            if (chatElement) {
                // Monitor for chat events
                chatElement.addEventListener('message', function(event) {
                    postMessageToRN('message', event.detail);
                });
                
                chatElement.addEventListener('error', function(event) {
                    postMessageToRN('error', event.detail);
                });
                
                chatElement.addEventListener('ready', function(event) {
                    postMessageToRN('ready', event.detail);
                });
                
                postMessageToRN('load', { status: 'loaded' });
            }
        });
        
        // Handle errors
        window.addEventListener('error', function(event) {
            postMessageToRN('error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
    </script>
</head>
<body>
    <langflow-chat
        ${attributes.join("\n        ")}
    ></langflow-chat>
</body>
</html>`;
  }, [
    flowId,
    hostUrl,
    apiKey,
    windowTitle,
    chatInputs,
    chatInputField,
    tweaks,
    botMessageStyle,
    chatTriggerStyle,
    chatWindowStyle,
    errorMessageStyle,
    inputContainerStyle,
    inputStyle,
    sendButtonStyle,
    sendIconStyle,
    userMessageStyle,
    chatPosition,
    height,
    width,
    online,
    startOpen,
    onlineMessage,
    placeholder,
    placeholderSending,
    inputType,
    outputType,
    outputComponent,
    sessionId,
    additionalHeaders,
  ]);

  const handleWebViewMessage = (event: any) => {
    try {
      const { type, data } = JSON.parse(event.nativeEvent.data);

      switch (type) {
        case "message":
          onMessage?.(data);
          break;
        case "error":
          onError?.(data);
          break;
        case "load":
          onLoad?.();
          break;
        default:
          console.log("Unknown message type:", type, data);
      }
    } catch (error) {
      console.error("Failed to parse WebView message:", error);
      onError?.({
        message: "Failed to parse WebView message",
        details: error,
      });
    }
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error("WebView error:", nativeEvent);
    onError?.({
      message: "WebView error occurred",
      details: nativeEvent,
    });
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <WebView
        source={{ html: htmlContent }}
        style={[styles.webView, webViewStyle]}
        onMessage={handleWebViewMessage}
        onError={handleWebViewError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        scrollEnabled={true}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        // Security settings
        allowsBackForwardNavigationGestures={false}
        allowsLinkPreview={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
});

export default LangFlowChatWidget;
