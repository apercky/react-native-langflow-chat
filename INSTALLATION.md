# Installation Guide

## 📦 Required Dependencies

Install the main package and all required dependencies:

```bash
npm install react-native-langflow-chat @expo/vector-icons expo-clipboard react-native-marked react-native-svg
# or
yarn add react-native-langflow-chat @expo/vector-icons expo-clipboard react-native-marked react-native-svg
```

### Dependencies Explained

- **`@expo/vector-icons`**: Material Community Icons for UI elements (chat button, close button, etc.)
- **`expo-clipboard`**: Cross-platform clipboard functionality for copy-to-clipboard feature
- **`react-native-marked`**: Native markdown rendering optimized for React Native
- **`react-native-svg`**: SVG support required by react-native-marked

> **Note**: All dependencies are required. The widget uses markdown rendering as a core feature.

## 📝 Markdown Support (Built-in)

The widget supports markdown rendering out of the box. You don't need to install any additional packages for this.

### Example with Markdown

```jsx
import LangFlowChatWidget from 'react-native-langflow-chat';

<LangFlowChatWidget
  flowId="your-flow-id"
  hostUrl="https://your-server.com"
  enableMarkdown={true} // Default: true
  botMessageStyle={{
    color: "#333",
    fontSize: 16,
    lineHeight: 22
  }}
/>
```

Bot messages like this:

```txt
# Welcome!
This is **bold** and *italic* text.
- List item 1
- List item 2

`Code example` and:

```

Will render as properly formatted markdown optimized for React Native!

