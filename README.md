# Gemini Chat Desktop

A modern, feature-rich desktop application for interacting with Google's Gemini AI models through the Gemini CLI. Built with Next.js, Electron, and TypeScript, providing a seamless native desktop experience for AI conversations and file analysis.

![Gemini Chat Desktop](https://img.shields.io/badge/Gemini-Chat%20Desktop-blue?style=for-the-badge&logo=google)
![Built with Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=flat-square&logo=next.js)
![Built with Electron](https://img.shields.io/badge/Electron-Latest-blue?style=flat-square&logo=electron)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)

## Features

### **AI Conversations**
- **Multiple Model Support**: Switch between Gemini 2.5 Flash and Gemini 2.5 Pro
- **Real-time Streaming**: Live responses with typing indicators
- **Conversation Management**: Create, pin, delete, and organize conversations
- **Smart Suggestions**: AI-powered prompt suggestions

### **Advanced File Upload System**
- **Universal File Support**: Drag & drop from anywhere or use file dialogs
- **Automatic File Copying**: Files are copied to your CLI working directory
- **Intelligent File Analysis**: Automatically analyze uploaded files with Gemini
- **Multiple Input Methods**: 
  - Drag files from Windows Explorer
  - Use "Choose Files" button for file dialog
  - Drag files from browser or other applications
- **Real-time Progress**: Visual feedback for file copying and processing

### **Professional Desktop Experience**
- **Native Window Controls**: Minimize, maximize, close with custom styling
- **Responsive Design**: Optimized for desktop with collapsible sidebars
- **Dark/Light Themes**: Auto-switching based on system preferences
- **CLI Integration**: Built-in terminal panel for direct Gemini CLI access
- **Export Options**: Save conversations as Markdown, PDF, or JSON

### **Advanced CLI Features**
- **Smart Autocompletion**: Context-aware command suggestions
- **Working Directory Management**: Visual working directory indicator
- **Command History**: Navigate through previous commands
- **Model-specific Commands**: Pre-configured commands for different models

### **Data Persistence**
- **Local Storage**: All conversations saved locally
- **Session Recovery**: Restore your work after app restarts
- **Export/Import**: Backup your conversations

## Prerequisites

Before installing and using Gemini Chat Desktop, ensure you have the following installed:

### 1. **Node.js and npm**
- **Node.js** version 18.0 or higher
- **npm** (comes with Node.js)

Download from: [nodejs.org](https://nodejs.org/)

Verify installation:
```bash
node --version
npm --version
```

### 2. **Gemini CLI** (Required)
The Gemini CLI is essential for this application to function. Install it globally:

```bash
npm install -g @google/generative-ai-cli
```

Verify installation:
```bash
gemini --version
```

### 3. **Google AI Studio API Key**
You need a Google AI Studio API key to authenticate with Gemini.

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create or select a project
3. Generate an API key
4. **Important**: Keep your API key secure and never share it publicly

## Installation & Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/gemini-chat-desktop.git
cd gemini-chat-desktop
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: **Authenticate Gemini CLI** (Critical Step)
Before using the application, you **must** authenticate the Gemini CLI with your API key:

```bash
gemini auth
```

This command will:
- Prompt you to enter your Google AI Studio API key
- Store the authentication credentials securely
- Enable the application to communicate with Gemini models

**Note**: This authentication step is required every time you set up the application on a new machine or if your credentials expire.

### Step 4: Run the Application

#### Development Mode
```bash
npm run dev
```
The web version will be available at `http://localhost:3000`

#### Electron Desktop App
```bash
npm run electron
```
This will launch the native desktop application.

#### Production Build
```bash
npm run build
npm run electron-pack
```

## Usage Guide

### First Launch
1. **Start the application** using `npm run electron`
2. **Verify authentication** - the app will show connection status in the header
3. **Select your preferred model** from the dropdown (Gemini 2.5 Flash recommended for daily use)
4. **Start chatting** - type your message or use suggested prompts

### File Upload Workflow
1. **Open the file panel** by clicking the folder icon in the header
2. **Upload files** using one of these methods:
   - Drag & drop files from Windows Explorer
   - Click "Choose Files" to use file dialog
   - Drag files from browser or other applications
3. **Monitor copying progress** - files are automatically copied to your CLI working directory
4. **Process files** - click "Process Files" when ready for analysis
5. **Review analysis** - Gemini will automatically analyze and discuss the uploaded files

### CLI Panel
- **Access**: Click the terminal icon in the header
- **Features**: 
  - Direct Gemini CLI commands
  - Autocompletion for commands
  - Working directory management
  - Command suggestions

### Model Selection
- **Gemini 2.5 Flash**: Fast, efficient, higher daily quota (recommended)
- **Gemini 2.5 Pro**: Advanced reasoning, limited daily quota

## Configuration

### Working Directory
The application automatically manages your working directory for CLI operations. Files uploaded through the interface are copied to this directory for seamless integration.

### Theme Settings
Access theme settings through the right panel:
- **Light Mode**: Clean, professional appearance
- **Dark Mode**: Easy on the eyes for extended use
- **Auto**: Follows your system preferences

### Export Options
Export your conversations in multiple formats:
- **Markdown**: For documentation and sharing
- **PDF**: For presentations and reports  
- **JSON**: For data backup and analysis

## Development

### Project Structure
```
gemini-chat-desktop/
├── app/                    # Next.js app directory
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── public/               # Static assets & Electron files
├── types/                # TypeScript type definitions
└── styles/               # Global styles
```

### Key Technologies
- **Frontend**: Next.js 15.2.4, React, TypeScript
- **Desktop**: Electron with IPC communication
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **State Management**: React hooks with localStorage persistence

### Build Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run electron     # Launch Electron app
npm run electron-dev # Electron in development mode
```

## Troubleshooting

### Common Issues

#### "Authentication failed" Error
**Solution**: Re-authenticate the Gemini CLI
```bash
gemini auth
```

#### "Command not found: gemini"
**Solution**: Install or reinstall Gemini CLI
```bash
npm install -g @google/generative-ai-cli
```

#### "Daily quota limit reached"
**Solution**: 
- Switch to Gemini 2.5 Flash model (higher quota)
- Wait for daily quota reset (typically 24 hours)
- Consider upgrading your Google AI Studio plan

#### File Upload Not Working
**Solution**:
- Ensure you're running the Electron version (not web browser)
- Try using "Choose Files" button instead of drag & drop
- Check console for specific error messages

#### Connection Issues
**Solution**:
- Verify internet connection
- Check Gemini CLI authentication: `gemini auth`
- Restart the application

### Debug Mode
Run with debug logging:
```bash
DEBUG=* npm run electron
```

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (especially file upload functionality)
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Google AI Studio** for providing the Gemini AI models
- **Gemini CLI Team** for the command-line interface
- **Next.js Team** for the excellent React framework
- **Electron Team** for enabling desktop app development

## Support

If you encounter issues:

1. **Check Prerequisites**: Ensure Gemini CLI is installed and authenticated
2. **Review Troubleshooting**: Common solutions above
3. **GitHub Issues**: Report bugs or request features
4. **Documentation**: Refer to [Gemini CLI docs](https://github.com/google/generative-ai-js/tree/main/packages/main/cli)

---

**Made with ❤️ for the AI community**

*Gemini Chat Desktop - Bringing the power of Google's Gemini AI to your desktop with a professional, feature-rich interface.*
