import { TextStyle, ViewStyle } from "react-native";

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
  fontSize?: number;

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

export interface ChatMessage {
  id: string;
  type: "user" | "bot" | "system" | "error";
  text: string;
  timestamp: number;
}
