# react-native-langflow-chat

A React Native component for integrating LangFlow chat widget using WebView with cross-platform support for Electron and iOS applications.

[![npm version](https://badge.fury.io/js/react-native-langflow-chat.svg)](https://badge.fury.io/js/react-native-langflow-chat)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Cross-platform**: Works on React Native, Electron, and iOS with the same codebase
- 🎨 **Highly Customizable**: Full control over styling and behavior
- 🔒 **Secure**: Built-in security features and API key support
- 📱 **Mobile Optimized**: Responsive design optimized for mobile devices
- 🔄 **Event Handling**: Comprehensive event system for message handling
- 📦 **TypeScript**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
# Install the package and required peer dependency
npm install react-native-langflow-chat react-native-webview
# or
yarn add react-native-langflow-chat react-native-webview
```

**Note**: `react-native-webview` is a peer dependency, so you must install it separately. This ensures compatibility with your existing WebView version and prevents conflicts.

### Platform Setup

#### iOS

```bash
cd ios && pod install
```

#### Android

No additional setup required for React Native 0.60+.

## Quick Start

```javascript
import React from 'react';
import { View } from 'react-native';
import { LangFlowChatWidget } from 'react-native-langflow-chat';

const App = () => {
  return (
    <View style={{ flex: 1 }}>
      <LangFlowChatWidget
        flowId="your-flow-id"
        hostUrl="https://your-langflow-server.com"
        apiKey="your-api-key"
      />
    </View>
  );
};
```

## Props

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `flowId` | `string` | Your LangFlow flow identifier |
| `hostUrl` | `string` | Your LangFlow server URL (must be HTTPS) |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiKey` | `string` | - | LangFlow API key for authentication |
| `windowTitle` | `string` | - | Title for the chat window |
| `chatPosition` | `ChatPosition` | `'bottom-right'` | Position of chat widget |
| `height` | `number` | - | Chat window height in pixels |
| `width` | `number` | - | Chat window width in pixels |
| `online` | `boolean` | - | Online status indicator |
| `startOpen` | `boolean` | - | Whether chat starts open |
| `placeholder` | `string` | - | Input placeholder text |
| `placeholderSending` | `string` | - | Placeholder while sending |
| `onlineMessage` | `string` | - | Message shown when online |
| `sessionId` | `string` | - | Custom session identifier |

### Styling Props

All styling props accept JSON objects for customization:

| Prop | Description |
|------|-------------|
| `botMessageStyle` | Bot message bubble styling |
| `userMessageStyle` | User message bubble styling |
| `chatWindowStyle` | Overall chat window styling |
| `chatTriggerStyle` | Chat trigger button styling |
| `inputStyle` | Input field styling |
| `sendButtonStyle` | Send button styling |
| `errorMessageStyle` | Error message styling |
| `inputContainerStyle` | Input container styling |
| `sendIconStyle` | Send icon styling |

### Event Handlers

| Prop | Type | Description |
|------|------|-------------|
| `onMessage` | `(message: LangFlowMessage) => void` | Called when messages are sent/received |
| `onError` | `(error: LangFlowError) => void` | Called when errors occur |
| `onLoad` | `() => void` | Called when widget loads successfully |

## Usage Examples

### Basic Implementation

```javascript
import React from 'react';
import { View } from 'react-native';
import { LangFlowChatWidget } from 'react-native-langflow-chat';

const ChatScreen = () => {
  const handleMessage = (message) => {
    console.log('New message:', message);
  };

  const handleError = (error) => {
    console.error('Chat error:', error);
  };

  return (
    <View style={{ flex: 1 }}>
      <LangFlowChatWidget
        flowId="your-flow-id"
        hostUrl="https://your-langflow-server.com"
        apiKey="your-api-key"
        windowTitle="AI Assistant"
        onMessage={handleMessage}
        onError={handleError}
        onLoad={() => console.log('Chat loaded!')}
      />
    </View>
  );
};
```

### Customized Styling

```javascript
import { LangFlowChatWidget } from 'react-native-langflow-chat';

const CustomizedChat = () => {
  return (
    <LangFlowChatWidget
      flowId="your-flow-id"
      hostUrl="https://your-server.com"
      botMessageStyle={{
        backgroundColor: "#f3f4f6",
        color: "#374151",
        borderRadius: "16px 16px 16px 4px",
        padding: "12px 16px",
        marginBottom: "8px"
      }}
      userMessageStyle={{
        backgroundColor: "#3b82f6",
        color: "#ffffff",
        borderRadius: "16px 16px 4px 16px",
        padding: "12px 16px",
        marginBottom: "8px"
      }}
      chatWindowStyle={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)"
      }}
      inputStyle={{
        borderRadius: "24px",
        border: "1px solid #d1d5db",
        padding: "12px 16px",
        fontSize: "16px"
      }}
    />
  );
};
```

### Floating Chat Widget

```javascript
const FloatingChat = () => {
  return (
    <LangFlowChatWidget
      flowId="your-flow-id"
      hostUrl="https://your-server.com"
      chatPosition="bottom-right"
      height={500}
      width={350}
      startOpen={false}
      chatTriggerStyle={{
        backgroundColor: "#3b82f6",
        borderRadius: "50%",
        width: "60px",
        height: "60px",
        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)"
      }}
    />
  );
};
```

### With Session Management

```javascript
const SessionManagedChat = () => {
  const userId = 'user123';
  
  return (
    <LangFlowChatWidget
      flowId="your-flow-id"
      hostUrl="https://your-server.com"
      sessionId={`user_${userId}_${Date.now()}`}
      additionalHeaders={{
        'X-User-ID': userId,
        'X-App-Version': '1.0.0'
      }}
      chatInputs={{
        user_name: 'John Doe',
        context: 'mobile_app'
      }}
    />
  );
};
```

## Types

The package exports the following TypeScript types:

```typescript
import type { 
  LangFlowChatWidgetProps,
  LangFlowMessage,
  LangFlowError,
  ChatPosition 
} from 'react-native-langflow-chat';
```

### LangFlowMessage

```typescript
interface LangFlowMessage {
  type: 'user_message' | 'bot_message' | 'system' | 'error';
  text: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}
```

### LangFlowError

```typescript
interface LangFlowError {
  message: string;
  code?: string;
  details?: any;
}
```

### ChatPosition

```typescript
type ChatPosition = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right' 
  | 'center-left' 
  | 'center-right' 
  | 'bottom-right' 
  | 'bottom-center' 
  | 'bottom-left';
```

## Requirements

- React Native >= 0.60.0
- react-native-webview >= 11.0.0
- React >= 16.8.0

## Cross-Platform Support

This component is designed to work seamlessly across:

- **React Native**: iOS and Android apps
- **Electron**: Desktop applications using React Native Web
- **Web**: Web applications (with react-native-web)

## Security Considerations

- Always use HTTPS for your `hostUrl`
- Keep your API keys secure and never commit them to version control
- Use environment variables for sensitive configuration
- Implement proper session management for production applications

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/yourusername/react-native-langflow-chat.git
cd react-native-langflow-chat

# Install dependencies
npm install

# Build the package
npm run build

# Watch for changes during development
npm run build:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Testing Locally

To test the package locally before publishing:

```bash
# In the package directory
npm pack

# In your test project
npm install /path/to/react-native-langflow-chat-1.0.0.tgz
```

Or use npm link:

```bash
# In the package directory
npm link

# In your test project
npm link react-native-langflow-chat
```

## Troubleshooting

### Common Issues

#### WebView not loading

- Ensure your `hostUrl` uses HTTPS protocol
- Check that your LangFlow server is accessible
- Verify your `flowId` is correct

#### TypeScript errors

- Make sure you have `@types/react` and `@types/react-native` installed
- Update to the latest version of the package

#### Styling not applying

- Verify JSON objects are properly formatted
- Check console for JavaScript errors in WebView
- Ensure CSS properties are valid web CSS

#### Cross-platform issues

- Test on both iOS and Android devices
- Verify react-native-webview is properly installed
- Check platform-specific WebView properties

### Debug Mode

Enable debug mode by adding console logging:

```javascript
<LangFlowChatWidget
  // ... other props
  onMessage={(message) => {
    console.log('Debug - Message received:', message);
  }}
  onError={(error) => {
    console.log('Debug - Error occurred:', error);
  }}
  onLoad={() => {
    console.log('Debug - Widget loaded successfully');
  }}
/>
```

## Changelog

### v1.0.0

- Initial release
- Full TypeScript support
- Cross-platform compatibility
- Comprehensive styling options
- Event handling system

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://github.com/yourusername/react-native-langflow-chat#readme)
- 🐛 [Report Issues](https://github.com/yourusername/react-native-langflow-chat/issues)
- 💬 [Discussions](https://github.com/yourusername/react-native-langflow-chat/discussions)

## Related Projects

- [LangFlow](https://github.com/langflow-ai/langflow) - The original LangFlow project
- [LangFlow Embedded Chat](https://github.com/langflow-ai/langflow-embedded-chat) - Web component this package wraps
- [React Native WebView](https://github.com/react-native-webview/react-native-webview) - WebView component used internally
