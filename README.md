# Desktop Celebrator

Desktop Celebrator is a lightweight "emotional feedback engine" for your desktop. It provides visual rewards (confetti) to boost dopamine and enhance the sense of achievement during work or presentations.

## Features

### 🎉 Visual Effects
- **Small Celebration**: A burst of confetti from the bottom of the screen. Perfect for small wins.
- **Big Celebration**: A massive confetti shower from both sides. Ideal for major milestones.
- **Transparent Overlay**: The effects play on a transparent layer that sits on top of all windows but allows mouse clicks to pass through, so it never interrupts your workflow.

### 🚀 Triggers
- **Global Shortcuts**:
    - `Alt + C`: Trigger Small Celebration.
    - `Alt + Shift + C`: Trigger Big Celebration.
- **Git Integration**:
    - Automatically trigger a celebration when you commit code.
    - Includes a one-click installer for Git Hooks.
- **HTTP API**:
    - Trigger effects programmatically via a local HTTP server.

## Installation

### Prerequisites
- macOS (tested on macOS 14+) or Windows 10/11.

### Building from Source
1.  Ensure you have [Rust](https://www.rust-lang.org/tools/install) and [Node.js](https://nodejs.org/) installed.
2.  Clone the repository.
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Run in development mode:
    ```bash
    npm run tauri dev
    ```
5.  Build for production:
    ```bash
    npm run tauri build
    ```
    The executable will be in `src-tauri/target/release/bundle/macos/` (or `nsis` on Windows).

## Usage Guide

### Settings
Launch the application to open the Settings window.
- **Test Triggers**: Use the buttons to preview the effects.
- **Git Integration**: Click "Install Git Hooks" to set up the automatic commit celebration.

### Git Hook Integration
The app installs a global `post-commit` hook. When you run `git commit` in any repository, it sends a signal to the running Desktop Celebrator instance to fire the confetti.

### HTTP API
You can trigger effects by sending a POST request to `http://127.0.0.1:23333/trigger`:

```bash
# Trigger Small Celebration
curl -X POST http://127.0.0.1:23333/trigger -d '{"type": "success"}'

# Trigger Big Celebration
curl -X POST http://127.0.0.1:23333/trigger -d '{"type": "big"}'
```

## Development

### Architecture
- **Frontend**: React + TypeScript + TailwindCSS.
    - `ConfettiOverlay.tsx`: Handles the canvas and animation logic using `canvas-confetti`.
    - `Settings.tsx`: The configuration UI.
- **Backend**: Rust (Tauri v2).
    - `lib.rs`: Main entry point, registers plugins and commands.
    - `server.rs`: Lightweight HTTP server (`tiny_http`) running on a separate thread.
    - `git_utils.rs`: Logic for installing/managing git hooks.

### Key Technologies
- [Tauri v2](https://v2.tauri.app/): For building the cross-platform desktop app.
- [canvas-confetti](https://github.com/catdad/canvas-confetti): For the high-performance particle effects.
- [tiny_http](https://github.com/tiny-http/tiny-http): For the embedded HTTP server.

## License
MIT
