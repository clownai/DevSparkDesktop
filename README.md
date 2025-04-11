# DevSpark Desktop Application

This is the desktop application version of the DevSpark IDE, built using Electron to provide a native desktop experience while leveraging the web-based IDE implementation.

## Features

- **Modern Code Editor**: Based on Monaco Editor with syntax highlighting, code completion, and more
- **AI Integration**: Context-aware code suggestions and AI assistant for development help
- **Git Integration**: Built-in source control and project management
- **Deployment Tools**: Streamlined deployment capabilities with "Pull to Deploy" feature
- **Application Scaffolding**: "1ClickApp" for quick project creation
- **Native Experience**: File system access, terminal integration, and native menus

## Getting Started

### Prerequisites

- Node.js 14.x or later
- npm 6.x or later

### Installation

1. Clone the repository:
```bash
git clone https://github.com/clownai/DevSpark.git
cd DevSpark/desktop
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

### Building from Source

To build the application for your platform:

```bash
# For all platforms
npm run build

# For specific platforms
npm run build:win
npm run build:mac
npm run build:linux
```

## Architecture

The DevSpark Desktop application follows a standard Electron architecture:

- **Main Process**: Handles application lifecycle, native integrations, and IPC
- **Renderer Process**: Runs the DevSpark IDE web application
- **Preload Scripts**: Securely expose APIs between processes

## Development

### Project Structure

```
DevSparkDesktop/
├── src/
│   ├── main/
│   │   ├── main.js             # Main process entry point
│   │   ├── menu.js             # Application menu configuration
│   │   └── preload.js          # Preload script for secure IPC
│   ├── renderer/
│   │   ├── index.html          # Main HTML entry point
│   │   ├── styles.css          # Application styles
│   │   └── renderer.js         # Renderer process logic
│   └── common/
│       └── constants.js        # Shared constants
├── assets/
│   └── icons/                  # Application icons
├── build/                      # Build output directory
├── package.json                # Project configuration
└── README.md                   # This file
```

### Running in Development Mode

To run the application in development mode with hot reloading:

```bash
npm run dev
```

## Distribution

The application can be distributed as:

- Windows: `.exe` installer or portable `.exe`
- macOS: `.dmg` installer or `.app` bundle
- Linux: `.deb`, `.rpm`, or `.AppImage`

## Related Projects

- [DevSpark IDE](https://github.com/clownai/DevSpark) - The main DevSpark IDE repository
- [DevSpark Website](https://github.com/clownai/DevSparkWebsite) - The DevSpark website

## License

MIT License
