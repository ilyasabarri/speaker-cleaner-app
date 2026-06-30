const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add web-specific module resolution
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    if (moduleName === 'react-native-webview') {
      return {
        filePath: path.resolve(__dirname, 'src/stubs/WebViewStub.js'),
        type: 'sourceFile',
      };
    }
    if (moduleName === 'expo-av') {
      return {
        filePath: path.resolve(__dirname, 'src/stubs/ExpoAVStub.js'),
        type: 'sourceFile',
      };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Ensure react-dom/client resolves from node_modules
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
};

module.exports = config;
