# How to Integrate Tailwind CSS (NativeWind v4)

## 1. Install Dependencies
Run this in your terminal to install NativeWind and TailwindCSS:
```bash
npm install nativewind@^4.0.1 tailwindcss
```

## 2. Configure Tailwind
Create `tailwind.config.js` in the root (or update it):
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 3. Configure Metro Bundler
Create or update `metro.config.js` in the root:
```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

## 4. Configure Babel
Create or update `babel.config.js` in the root. **This is crucial.**
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

## 5. Create Global CSS
Create `global.css` in the root:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 6. Import CSS
In `app/_layout.tsx`, import the CSS file at the very top:
```tsx
import '../global.css'; // <--- Add this line
import { Tabs } from 'expo-router';
// ...
```

## 7. TypeScript Support
Create `nativewind-env.d.ts` in the root:
```typescript
/// <reference types="nativewind/types" />
```

## 8. Usage
Now you can use the `className` prop:
```tsx
<Text className="text-red-500 font-bold">Hello Tailwind!</Text>
```
