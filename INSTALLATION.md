# Installation Guide

## Prerequisites

This package requires the following peer dependencies to be installed in your project:

```bash
npm install react react-native @expo/vector-icons
# or
yarn add react react-native @expo/vector-icons
```

## Installation

```bash
npm install react-native-langflow-chat
# or
yarn add react-native-langflow-chat
```

## Expo Projects

If you're using Expo, make sure you have `@expo/vector-icons` installed:

```bash
npx expo install @expo/vector-icons
```

## Metro/Build Issues

If you encounter Metro bundler issues after installation, try:

1. Clear Metro cache:

```bash
npx expo start --clear
# or for React Native CLI
npx react-native start --reset-cache
```

2. Clear node_modules and reinstall:

```bash
rm -rf node_modules package-lock.json yarn.lock
npm install
# or
yarn install
```

3. For Expo projects, you might need to clear Expo cache:

```bash
npx expo install --fix
```

## Common Issues

### Metro Module Resolution Errors

If you see errors like `Cannot find module 'metro/src/ModuleGraph/worker/importLocationsPlugin'`, this usually indicates a dependency conflict. Try:

1. Make sure all peer dependencies are correctly installed
2. Update your Metro configuration if needed
3. Clear all caches and reinstall dependencies

### TypeScript Issues

Make sure you have compatible TypeScript types:

```bash
npm install --save-dev @types/react @types/react-native
```

## Verification

To verify the installation works correctly, try importing the component:

```typescript
import { LangFlowChatWidget } from 'react-native-langflow-chat';
```

If you encounter any issues, please check our [troubleshooting guide](README.md#troubleshooting) or open an issue on GitHub.
