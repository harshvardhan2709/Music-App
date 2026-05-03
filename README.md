# Msick

<p align="center">
  <img src="assets/demo1.jpeg" alt="Home Screen" width="250" />
  <img src="assets/demo2.jpeg" alt="Library Screen" width="250" />
  <img src="assets/demo3.jpeg" alt="Features Screen" width="250" />
  <img src="assets/demo4.jpeg" alt="Genre Classification" width="250" />
  <img src="assets/demo5.jpeg" alt="Smart Filter" width="250" />
  <img src="assets/demo6.jpeg" alt="Genre Screen" width="250" />
  <img src="assets/demo7.jpeg" alt="AI Models" width="250" />
</p>

> [!NOTE]
> Msick is currently in development. While functional, it is undergoing continuous performance optimizations for large music libraries.

Msick is a high-performance, local-first music application built with **React Native** and **Expo**. It transforms your local music library into an intelligent, AI-powered experience with natural language searching, automated genre classification, and robust relational storage.

## ✨ Core Features

- **💿 Local Music Powerhouse:** High-fidelity playback of local audio files with full support for background audio, lock screen controls, and dynamic queue management.
- **🤖 AI-Driven Genre Classification:** Automatically organizes your library into custom genres (e.g., Phonk, Chill, Party, Funk) using the **Groq API (Llama 3.3 70B)**. Includes an instant, offline keyword-based fallback.
- **🔍 AI Smart Filter:** Search your library using natural language. Instead of just searching by filename, ask for "upbeat workout tracks" or "relaxing evening vibes," and the AI will build a custom playlist from your local files.
- **🗄️ Relational SQLite Storage:** Migrated from AsyncStorage to a professional **SQLite** architecture for lightning-fast lookups, complex relationships (playlists, genres), and rock-solid data persistence.
- **🖼️ Smart Metadata & Artwork Caching:** Extracts ID3 tags and album art using `music-metadata-browser`. Employs a unique **FileSystem caching** strategy to store high-res artwork locally without bloating the database.
- **🎨 Modern UI/UX:** A beautiful, responsive interface designed with **TailwindCSS (NativeWind v4)** and **React Native Reanimated**, featuring smooth transitions, glassmorphism, and a neon-purple aesthetic.
- **🌐 Peer-to-Peer (P2P) Sharing (WIP):** Share music directly with peers on your local network using an integrated TCP socket server.

## 🛠️ Technology Stack

- **Core:** React Native & Expo (Development Build)
- **Navigation:** Expo Router (Tabs Architecture)
- **Database:** SQLite (expo-sqlite)
- **AI Engine:** Groq API / Llama 3.3 70B & 8B
- **Styling:** TailwindCSS (NativeWind v4)
- **Animations:** React Native Reanimated
- **Metadata:** music-metadata-browser

## 🚀 Getting Started

### Prerequisites

Msick uses custom native modules for advanced audio and networking. Therefore, it runs as an **Expo Development Build**.

- [Node.js](https://nodejs.org/) (LTS recommended)
- Android Studio (for Emulator) or a physical Android device.
- Groq API Key (Sign up at [console.groq.com](https://console.groq.com/))

### Installation

1. **Clone & Navigate:**
   ```bash
   git clone <repository-url>
   cd Msick
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_GROQ_API_KEY=your_actual_key_here
   ```

### Running the App

Since the app uses custom native code, you must build the development client first:

```bash
# Build and run on Android
npx expo run:android
```

Once the initial build is installed on your device, you can start the development server for future sessions:

```bash
npm start
```

## 📜 Documentation

For a deeper dive into the technical architecture, AI prompt engineering, and database schema, please refer to the [DOCUMENTATION.md](./DOCUMENTATION.md).
