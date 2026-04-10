# Msick

<p align="center">
  <img src="assets/demo1.jpeg" alt="Home Screen" width="250" />
  <img src="assets/demo2.jpeg" alt="Library Screen" width="250" />
  <img src="assets/demo3.jpeg" alt="Features Screen" width="250" />
  <img src="assets/demo4.jpeg" alt="Genre loading Models
  " width="250" />
  <img src="assets/demo5.jpeg" alt="Genre loading Models
  " width="250" />
  <img src="assets/demo6.jpeg" alt="Genre Screen" width="250" />
  <img src="assets/demo7.jpeg" alt="Other Models" width="250" />
</p>

NOTE: THIS APP IS NOT FULLY OPTIMIZED SO IT MAY SHOW DELAYS IN DEVICES.

Msick is a React Native music application built with Expo that enhances local file management with advanced AI capabilities. It focuses on beautifully playing and intelligently organizing your local music library via custom AI-driven categorization, metadata extraction, and robust caching.

## Features

- **Local Music Playback:** Seamlessly play, manage, and explore local music tracks directly stored on your device.
- **AI-Driven Genre Classification:** Automatically classifies and categorizes songs into custom genres (e.g., Phonk, Chill, Party, Funk) by intelligently analyzing filenames using the Groq API (powered by the Llama 3.3 70B model). Includes a fast, local keyword-based fallback mechanism.
- **Rich Metadata & Album Art Extraction:** Accurately retrieves and elegantly displays embedded artwork and track metadata using `music-metadata-browser` with performance-optimized lazy loading.
- **Efficient Artwork Caching:** Employs a robust FileSystem caching strategy to store artwork locally, preventing database size limits (such as `SQLITE_FULL` errors) and accelerating load times across screens.
- **Modern Interface:** Enjoy a cohesive design across the Home screen, a dynamic MiniPlayer, an immersive FullScreenPlayer, and a smooth SongSelector, styled efficiently with TailwindCSS (NativeWind).
- **Peer-to-Peer (P2P) Sharing _(Work-in-Progress)_:** An upcoming capability designed to allow seamless, local music sharing between peers.

## Tech Stack

- **Framework:** React Native & Expo
- **AI Integration:** Groq API / Llama 3.3 70B
- **Styling:** TailwindCSS & NativeWind
- **Metadata Parsing:** `music-metadata-browser`

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed along with `npm` or `yarn`. Because this project uses custom native modules, it runs as an **Expo Development Build** instead of the standard Expo Go app.
You will need a configured Android Emulator (via Android Studio) or a physical Android device connected via USB with USB debugging enabled.

### Installation

1. Clone the repository and navigate to the project directory:

   ```bash
   git clone <repository-url>
   cd Msick
   ```

2. Install the necessary dependencies:

   ```bash
   npm install
   ```

3. Environment Variables:
   Make sure you define proper environment variables in a `.env` file at the root. You will need your Groq API key here to enable AI functionalities.

### Running the Application

Since this project requires custom native code, you must build the native app and run the development server via:

```bash
npx expo run:android
```

_(This command compiles the custom native code for the music modules and installs the Development Build directly onto your Android emulator or connected device)._

Once the native app is built and installed on your device, for future sessions you can simply start the Metro bundler:

```bash
npm start
```

From the Metro terminal interface, you can press `a` to open the installed development build on your connected device/emulator.
