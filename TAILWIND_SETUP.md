# NativeWind v4 (Tailwind CSS) Integration Guide

This document outlines the steps taken to integrate **NativeWind v4** into the Msick project. Use this as a reference if you need to troubleshoot styling or recreate the environment.

---

## 📦 1. Installation

NativeWind v4 requires specific versions for compatibility with React Native and TailwindCSS.

```bash
npm install nativewind@^4.0.1 tailwindcss
```

---

## ⚙️ 2. Configuration

### Tailwind Configuration
The `tailwind.config.js` file defines which files Tailwind should scan for class names.

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Custom theme colors can be added here
      }
    },
  },
  plugins: [],
}
```

### Metro Bundler
Metro needs to be wrapped with the NativeWind plugin to handle CSS transformations.

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

### Babel Setup
Babel must be configured to use the `nativewind/babel` plugin.

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

---

## 🎨 3. Styling Foundation

### Global CSS
Create `global.css` at the root to initialize Tailwind directives.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Entry Point
Import the CSS file at the absolute top of your root layout (`app/_layout.tsx`).

```tsx
import '../global.css';
import { Stack } from 'expo-router';
// ...
```

---

## ⌨️ 4. TypeScript Environment

To enable full IntelliSense for the `className` prop, ensure `nativewind-env.d.ts` exists in your root:

```typescript
/// <reference types="nativewind/types" />
```

---

## 🚀 5. Usage Example

You can now use standard Tailwind classes directly on React Native components.

```tsx
<View className="flex-1 bg-slate-900 justify-center items-center">
  <Text className="text-white text-2xl font-bold tracking-tight">
    Msick x NativeWind
  </Text>
</View>
```
