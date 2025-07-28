# React Native LangFlow Chat Widget

A **native React Native component** for integrating LangFlow chat functionality with cross-platform support for iOS, Android, and Expo applications.

## ✨ Key Features

- 🚀 **100% Native React Native** - No WebView dependencies, pure native components
- 📱 **Modal Overlay System** - Chat opens above all content with proper z-index handling
- 🎨 **Fully Customizable** - All styles and components can be customized
- 🔧 **Custom Trigger Button** - Support for custom icon components
- 🌐 **Direct LangFlow API Integration** - Native fetch-based communication
- ⌨️ **Keyboard Handling** - Proper keyboard avoidance and input management
- 💬 **Message History** - Persistent conversation within session
- ⚡ **Loading States** - Visual feedback during API calls
- 📍 **9 Position Options** - Flexible button positioning
- 🎯 **TypeScript Support** - Full type safety and IntelliSense

## 🆚 Comparison with Original

| Feature | Original (WebView) | This Package (Native) |
|---------|-------------------|----------------------|
| **Performance** | Heavy WebView | ⚡ Lightweight native |
| **Positioning** | Z-index issues | ✅ Perfect modal overlay |
| **Customization** | Limited CSS | 🎨 Full React Native styling |
| **Keyboard** | WebView limitations | ⌨️ Native keyboard handling |
| **Dependencies** | WebView + CDN | 📦 Zero external deps |
| **Bundle Size** | Large | 🪶 Minimal footprint |
| **Offline** | Requires CDN | ✅ Works offline |

## 🚀 Installation

```bash
npm install react-native-langflow-chat @expo/vector-icons expo-clipboard react-native-marked react-native-svg
# or
yarn add react-native-langflow-chat @expo/vector-icons expo-clipboard react-native-marked react-native-svg
```

### Required Dependencies

- **`@expo/vector-icons`**: For UI icons (chat button, close button, etc.)
- **`expo-clipboard`**: For copy-to-clipboard functionality (cross-platform)
- **`react-native-marked`**: For markdown rendering in bot messages
- **`react-native-svg`**: Required by react-native-marked for SVG elements

> **Note**: All dependencies are required for the widget to function properly.

## 🚀 Quick Start

### Basic Usage

```jsx
import React from 'react';
import { View } from 'react-native';
import LangFlowChatWidget from 'react-native-langflow-chat';

const App = () => {
  return (
    <View style={{ flex: 1 }}>
      {/* Your app content */}
      
      <LangFlowChatWidget
        flowId="your-flow-id"
        hostUrl="https://your-langflow-host.com"
        apiKey="your-api-key"
      />
    </View>
  );
};

export default App;
```

### Advanced Configuration

```jsx
import LangFlowChatWidget from 'react-native-langflow-chat';

const CustomChatIcon = () => (
  <View style={{ width: 60, height: 60, backgroundColor: '#FF6B6B', borderRadius: 30, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 28 }}>🤖</Text>
  </View>
);

<LangFlowChatWidget
  // Required
  flowId="dcbed533-859f-4b99-b1f5-16fce884f28f"
  hostUrl="https://your-langflow-server.com"
  apiKey="sk-your-api-key"
  
  // Customization
  windowTitle="AI Assistant"
  placeholder="Ask me anything..."
  placeholderSending="AI is thinking..."
  
  // Positioning & Size
  chatPosition="bottom-right"
  height={600}
  width={350}
  
  // Custom Trigger
  triggerComponent={<CustomChatIcon />}
  
  // Styling
  chatWindowStyle={{
    borderRadius: 16,
    shadowOpacity: 0.4,
  }}
  botMessageStyle={{
    backgroundColor: "#f0f8ff",
    borderRadius: 16,
  }}
  userMessageStyle={{
    backgroundColor: "#007AFF",
    borderRadius: 16,
  }}
  
  // Development debugging
  debugEnabled={__DEV__} // Enable logs in development only
  
  // Markdown rendering & Typography
  enableMarkdown={true} // Enable markdown for bot messages
  fontSize={14} // Unified font size for all text (default: 12)
  
  // Event Handlers
  onMessage={(message) => console.log('Message:', message)}
  onError={(error) => console.error('Error:', error)}
  onLoad={() => console.log('Widget loaded')}
  debugEnabled={__DEV__} // Enable logs in development only
/>
```

### Localization

The component supports full localization with customizable text strings:

```jsx
<LangFlowChatWidget
  flowId="your-flow-id"
  hostUrl="https://your-host.com"
  // Italian localization
  windowTitle="Chat Assistente"
  placeholder="Scrivi il tuo messaggio..."
  placeholderSending="Invio in corso..."
  loadingText="Sto scrivendo..."
  errorMessage="Si è verificato un errore. Riprova."
  fallbackMessage="Ho ricevuto il tuo messaggio ma non riesco a generare una risposta."
  sourceTooltipTitle="Fonte"
  pageText="Pagina"
  ofText="di"
  closeButtonAriaLabel="Chiudi"
/>
```

#### Available Localization Props

| Prop | Default (English) | Description |
|------|------------------|-------------|
| `windowTitle` | "Chat" | Modal header title |
| `placeholder` | "Type your message..." | Input placeholder |
| `placeholderSending` | "Sending..." | Input placeholder while sending |
| `loadingText` | "Typing..." | Loading indicator text |
| `errorMessage` | "Sorry, there was an error..." | Error message text |
| `fallbackMessage` | "I received your message but..." | Fallback response text |
| `sourceTooltipTitle` | "Source" | Citation tooltip title |
| `pageText` | "Page" | Citation page text |
| `ofText` | "of" | Citation "of" text |
| `closeButtonAriaLabel` | "Close" | Close button accessibility label |

## 📋 Complete Props Reference

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `flowId` | `string` | Your LangFlow flow identifier |
| `hostUrl` | `string` | Your LangFlow server URL (e.g., "https://your-server.com") |

### Authentication & Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiKey` | `string` | `undefined` | LangFlow API key for authentication |
| `sessionId` | `string` | auto-generated | Custom session ID for conversation continuity |
| `additionalHeaders` | `Record<string, any>` | `{}` | Additional HTTP headers for API requests |

### Chat Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `chatInputs` | `Record<string, any>` | `undefined` | Additional inputs to send with each message |
| `chatInputField` | `string` | `undefined` | Specific input field name for chat |
| `tweaks` | `Record<string, any>` | `undefined` | LangFlow tweaks/parameters |
| `inputType` | `string` | `"chat"` | Input type for LangFlow API |
| `outputType` | `string` | `"chat"` | Output type for LangFlow API |
| `outputComponent` | `string` | `undefined` | Specific output component name |

### UI Content & Localization

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `windowTitle` | `string` | `"Chat"` | Title displayed in chat header |
| `placeholder` | `string` | `"Type your message..."` | Input field placeholder text |
| `placeholderSending` | `string` | `"Sending..."` | Placeholder text while sending message |
| `loadingText` | `string` | `"Typing..."` | Text shown during bot response loading |
| `errorMessage` | `string` | `"Sorry, there was an error..."` | Default error message text |
| `fallbackMessage` | `string` | `"I received your message but..."` | Fallback message when no response |
| `sourceTooltipTitle` | `string` | `"Source"` | Title for citation source tooltips |
| `pageText` | `string` | `"Page"` | Text for page numbers in citations |
| `ofText` | `string` | `"of"` | Text for "X of Y" in citations |
| `closeButtonAriaLabel` | `string` | `"Close"` | Accessibility label for close button |

### Behavior Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `chatPosition` | `ChatPosition` | `"bottom-right"` | Position of the chat trigger button |
| `height` | `number` | `screenHeight * 0.9` | Chat modal height in pixels |
| `width` | `number` | `screenWidth * 0.9` | Chat modal width in pixels |
| `startOpen` | `boolean` | `false` | Whether to start with chat modal open |
| `debugEnabled` | `boolean` | `false` | Enable debug console logs for development |
| `enableMarkdown` | `boolean` | `true` | Enable markdown rendering for bot messages |
| `fontSize` | `number` | `12` | Unified font size for all text (messages, citations, markdown) |

### Custom Trigger Button

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `triggerComponent` | `React.ReactNode` | `undefined` | Custom component to replace default trigger button |
| `triggerButtonStyle` | `ViewStyle` | default styles | Style overrides for trigger button container |

### Message Styling

| Prop | Type | Description |
|------|------|-------------|
| `botMessageStyle` | `ViewStyle & TextStyle` | Styling for bot message bubbles and text |
| `userMessageStyle` | `ViewStyle & TextStyle` | Styling for user message bubbles and text |
| `errorMessageStyle` | `ViewStyle & TextStyle` | Styling for error message bubbles and text |

> **Note**: Don't use `fontSize` in individual message styles. Use the global `fontSize` prop instead for consistent typography across all messages.

### UI Component Styling

| Prop | Type | Description |
|------|------|-------------|
| `chatWindowStyle` | `ViewStyle` | Styling for the main chat modal container |
| `inputContainerStyle` | `ViewStyle` | Styling for the input area container |
| `inputStyle` | `ViewStyle & TextStyle` | Styling for the text input field |
| `sendButtonStyle` | `ViewStyle & TextStyle` | Styling for the send message button |
| `citationBubbleColor` | `string` | Background color for citation number bubbles (default: "#4a4a4a") |

### Event Callbacks

| Prop | Type | Description |
|------|------|-------------|
| `onMessage` | `(message: LangFlowMessage) => void` | Called when messages are sent or received |
| `onError` | `(error: LangFlowError) => void` | Called when API or other errors occur |
| `onLoad` | `() => void` | Called when the widget finishes loading |

### Chat Positions

The `chatPosition` prop accepts one of these 9 values:

```txt
"top-left"      "top-center"      "top-right"
"center-left"                     "center-right"  
"bottom-left"   "bottom-center"   "bottom-right"
```

### Type Definitions

```typescript
interface LangFlowMessage {
  type: "user_message" | "bot_message" | "system" | "error";
  text: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}

interface LangFlowError {
  message: string;
  code?: string;
  details?: any;
}

type ChatPosition = 
  | "top-left" | "top-center" | "top-right"
  | "center-left" | "center-right" 
  | "bottom-left" | "bottom-center" | "bottom-right";
```

## 🧪 Try it Out

We've included a complete Expo example project:

```bash
cd example
npm install
npm start
```

Update the `flowId`, `hostUrl`, and `apiKey` in `example/App.tsx` with your LangFlow configuration.

## 🔧 LangFlow Setup

To use this component, you need:

1. **A running LangFlow server** (local or hosted)
2. **A published flow** with Chat Input and Chat Output components
3. **API key** (if your server requires authentication)

### API Endpoint

The component communicates with LangFlow using the standard REST API:

```bash
POST /api/v1/run/{flow_id}
Headers: {
  "Content-Type": "application/json",
  "x-api-key": "your-api-key"
}
Body: {
  "input_value": "user message",
  "output_type": "chat",
  "input_type": "chat",
  "session_id": "session_id"
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Connection Error**
   - Verify `hostUrl` is correct and reachable
   - Ensure LangFlow server is running
   - Use HTTPS in production

2. **Flow Not Found**
   - Check `flowId` is correct
   - Ensure flow is published and active

3. **Authentication Error**
   - Verify `apiKey` is valid
   - Check server authentication settings

### Debug Mode

Enable debugging by monitoring console logs for:

- API requests and responses
- Error messages
- Widget state changes

## 📱 Platform Support

- ✅ **iOS** - Native iOS components
- ✅ **Android** - Native Android components  
- ✅ **Expo** - Full Expo compatibility
- ✅ **React Native CLI** - Standard RN projects

## Troubleshooting

### Installation Issues

If you encounter Metro bundler errors after installing this package, it's usually due to dependency conflicts. Follow these steps:

1. **Check peer dependencies**: Make sure you have all required peer dependencies installed:

   ```bash
   npm install react react-native @expo/vector-icons
   ```

2. **Clear caches**: Clear all Metro and Node caches:

   ```bash
   # For Expo
   npx expo start --clear
   
   # For React Native CLI
   npx react-native start --reset-cache
   
   # Clear node_modules
   rm -rf node_modules package-lock.json yarn.lock
   npm install
   ```

3. **Check versions**: Ensure compatible versions of React Native (>=0.70.0) and React (>=18.0.0)

### Common Errors

- **`Cannot find module 'metro/src/ModuleGraph/worker/importLocationsPlugin'`**: This indicates a Metro version conflict. Clear caches and reinstall dependencies.
- **`@expo/vector-icons not found`**: Install the required peer dependency with `npx expo install @expo/vector-icons`

  For more detailed installation instructions, see [INSTALLATION.md](INSTALLATION.md).

## 📝 Markdown Support

The widget has **built-in markdown rendering** for bot messages using [react-native-marked](https://www.npmjs.com/package/react-native-marked), making responses more readable and well-formatted.

### Features

- ✅ **Headings** (H1, H2, H3)
- ✅ **Bold** and *italic* text
- ✅ `Inline code` and code blocks
- ✅ Lists (bulleted and numbered)
- ✅ Links (displayed with underline)
- ✅ Blockquotes
- ✅ **Native React Native rendering** - optimized for mobile
- ✅ **Built-in support** - no additional configuration needed

### Usage

Markdown rendering is enabled by default:

```jsx
<LangFlowChatWidget
  flowId="your-flow-id"
  hostUrl="https://your-langflow-host.com"
  enableMarkdown={true} // Default: true
/>
```

### Disable Markdown

If you prefer plain text rendering:

```jsx
<LangFlowChatWidget
  enableMarkdown={false} // Disable markdown rendering
/>
```

## 🔧 Troubleshooting

### Metro bundler errors with react-markdown

If you encounter Metro bundler errors like:

```txt
Metro has encountered an error: While trying to resolve module `devlop` from file...
```

This is because `react-markdown` is designed for web and has dependencies incompatible with React Native. **Solution**: Use `react-native-marked` instead:

```bash
# Remove react-markdown
npm uninstall react-markdown

# Install react-native-marked
npm install react-native-marked react-native-svg
```

The widget automatically detects and uses `react-native-marked` when available.

### Other common issues

1. **Missing react-native-svg**: Install it with `npm install react-native-svg`
2. **iOS build issues**: Run `cd ios && pod install` after installing dependencies
3. **Android build issues**: Clean and rebuild with `cd android && ./gradlew clean`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [LangFlow](https://github.com/langflow-ai/langflow) - The amazing visual LLM framework
- [LangFlow Embedded Chat](https://github.com/langflow-ai/langflow-embedded-chat) - Original web component inspiration

## 🎨 Typography & Font Size Control

The widget provides **unified font size control** across all text elements, ensuring consistent typography throughout the chat interface.

### Unified Font Size System

The `fontSize` prop controls the size of **all text elements** in the chat:

- ✅ **User messages** - Text in user chat bubbles
- ✅ **Bot messages** - All markdown and plain text
- ✅ **Citations** - Citation bubbles and numbers (scaled proportionally)
- ✅ **Headings** - Scaled proportionally to the base fontSize
- ✅ **Code blocks** - Slightly smaller than base fontSize

```jsx
<LangFlowChatWidget
  fontSize={14} // Controls ALL text in the chat
  // No need to set fontSize in individual styles
  botMessageStyle={{
    color: "#333",
    backgroundColor: "#f0f8ff", // Only styling, not font size
  }}
  userMessageStyle={{
    backgroundColor: "#007AFF", // Only styling, not font size
  }}
/>
```

### Font Size Scaling

| Element | Size Calculation | Example (fontSize=14) |
|---------|------------------|----------------------|
| **Normal text** | `fontSize` | 14px |
| **Headings H1** | `fontSize + 8` | 22px |
| **Headings H2** | `fontSize + 5` | 19px |
| **Headings H3** | `fontSize + 3` | 17px |
| **Code blocks** | `fontSize - 1` | 13px |
| **Citation bubbles** | `fontSize + 2` | 16px |
| **Citation text** | `fontSize - 4` | 10px |

## 📝 Markdown Support

The widget supports **automatic markdown rendering** for bot messages using [react-native-marked](https://www.npmjs.com/package/react-native-marked), making responses more readable and well-formatted.

### Features

- ✅ **Headings** (H1, H2, H3)
- ✅ **Bold** and *italic* text
- ✅ `Inline code` and code blocks
- ✅ Lists (bulleted and numbered)
- ✅ Links (displayed with underline)
- ✅ Blockquotes
- ✅ **Native React Native rendering** - optimized for mobile
- ✅ **Graceful fallback** when react-native-marked is not available

### Installation

To enable markdown rendering, install the required dependencies:

```bash
npm install react-native-marked react-native-svg
# or
yarn add react-native-marked react-native-svg
```

> **Note**: `react-native-svg` is required by `react-native-marked` for rendering certain elements.

### Usage

```jsx
<LangFlowChatWidget
  flowId="your-flow-id"
  hostUrl="https://your-langflow-host.com"
  enableMarkdown={true} // Enable markdown (default: true)
  fontSize={14} // Set unified font size for all text
/>
```

### Styling

Markdown elements are automatically styled to match your message theme:

```jsx
<LangFlowChatWidget
  botMessageStyle={{
    color: "#333",
    backgroundColor: "#f0f8ff",
    borderRadius: 16,
  }}
  fontSize={16} // Controls font size for all text uniformly
  enableMarkdown={true}
/>
```

### Without Markdown

If you prefer plain text or don't want to install the dependencies:

```jsx
<LangFlowChatWidget
  enableMarkdown={false} // Disable markdown rendering
/>
```

## �� Citation Bubbles
