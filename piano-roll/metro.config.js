// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;


// Add platform-specific extensions
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'web.ts',
  'web.tsx',
  'native.ts',
  'native.tsx',
];

// Ensure proper resolution order
config.resolver.platforms = ['ios', 'android', 'web'];
module.exports = config;