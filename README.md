# Bolt Llama - AI-Powered Web Development with Local LLM

A desktop application that combines Bolt.new's AI-powered web development capabilities with node-llama-cpp for **local LLM inference**. Build full-stack web applications using a locally-running language model, without requiring cloud API keys or internet connectivity.

## Features

- **Local LLM Inference**: Run language models locally using node-llama-cpp with hardware acceleration (Metal, CUDA, Vulkan)
- **AI Code Generation**: Generate HTML, CSS, and JavaScript code from natural language prompts
- **Full-Stack Development**: Support for React, Vue, Svelte, and vanilla HTML/CSS/JS projects
- **Live Preview**: Real-time preview of generated code
- **Project Management**: Create, organize, and manage multiple projects
- **Chat Interface**: Interactive chat for iterative development
- **Code Editor**: Professional code editing with Monaco Editor
- **Cross-Platform**: Works on macOS, Windows, and Linux
- **Privacy-First**: All processing happens locally on your machine

## System Requirements

- **Node.js**: 18.0 or higher
- **RAM**: Minimum 8GB (16GB+ recommended for larger models)
- **Disk Space**: 10GB+ for models and dependencies
- **GPU** (Optional): NVIDIA (CUDA), AMD (Vulkan), or Apple Silicon (Metal) for faster inference

## Installation

### Prerequisites

1. Install Node.js 18+ from [nodejs.org](https://nodejs.org/)
2. Clone or download this repository

### Setup

```bash
# Navigate to project directory
cd bolt-llama-electron

# Install dependencies
npm install

# Build TypeScript and prepare assets
npm run build:vite
```

## Quick Start

### Development Mode

```bash
# Start development server with hot reload
npm run dev
```

This will:
1. Start the Vite dev server on `http://localhost:5173`
2. Launch the Electron app
3. Enable DevTools for debugging

### Production Build

```bash
# Build for production
npm run build

# Run the built application
npm start
```

## Model Setup

### Downloading Models

Before using the app, you need to download a GGUF format model:

**Recommended Models:**

1. **CodeLlama 7B** (Best for code generation)
   ```bash
   # Download to ~/.bolt-llama/models/
   mkdir -p ~/.bolt-llama/models
   cd ~/.bolt-llama/models
   wget https://huggingface.co/TheBloke/CodeLlama-7B-Instruct-GGUF/resolve/main/codellama-7b-instruct.Q4_K_M.gguf
   ```

2. **Mistral 7B Instruct** (Fast and versatile)
   ```bash
   wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf
   ```

3. **DeepSeek Coder 6.7B** (Specialized for coding)
   ```bash
   wget https://huggingface.co/TheBloke/deepseek-coder-6.7B-instruct-GGUF/resolve/main/deepseek-coder-6.7b-instruct.Q4_K_M.gguf
   ```

### Model Selection

When you first run the app:
1. Go to Settings
2. Select your model path (e.g., `~/.bolt-llama/models/codellama-7b-instruct.Q4_K_M.gguf`)
3. Click "Load Model"
4. Wait for the model to load (this may take a minute)

## Usage

### Creating a New Project

1. Click "New Project" in the File menu
2. Enter a project name
3. Select a template (React + TypeScript, Vanilla HTML/CSS/JS, etc.)
4. Click "Create"

### Generating Code

1. Open the Chat panel
2. Describe what you want to build (e.g., "Create a todo list app with add and delete buttons")
3. Press Enter or click "Generate"
4. The AI will generate code and display it in the editor
5. Review and edit the code as needed
6. The preview panel will update in real-time

### Editing Code

1. Click on a file in the File Explorer to open it
2. Edit the code in the Monaco Editor
3. Changes are auto-saved (configurable)
4. The preview updates automatically

### Exporting Projects

1. Right-click on a project in the Project List
2. Select "Export"
3. Choose export location
4. The project will be exported as a ZIP file

## Configuration

### Settings File

Configuration is stored in `~/.bolt-llama/config.json`:

```json
{
  "modelPath": "~/.bolt-llama/models/codellama-7b-instruct.Q4_K_M.gguf",
  "projectsPath": "~/.bolt-llama/projects",
  "theme": "dark",
  "autoSave": true,
  "autoSaveInterval": 5000,
  "defaultTemplate": "react-ts"
}
```

### LLM Parameters

Adjust LLM behavior in the Settings panel:

- **Temperature** (0.0-2.0): Higher = more creative, Lower = more deterministic
- **Top P** (0.0-1.0): Nucleus sampling parameter
- **Top K** (0-100): Number of top tokens to consider
- **Max Tokens**: Maximum length of generated response
- **GPU Layers**: Number of layers to offload to GPU (if available)

## Architecture

### Project Structure

```
bolt-llama-electron/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Entry point
│   │   ├── ipc-handlers.ts # IPC message handlers
│   │   ├── llm-engine.ts  # node-llama-cpp integration
│   │   ├── file-manager.ts # File operations
│   │   └── preload.ts     # Security preload script
│   │
│   ├── renderer/          # React UI
│   │   ├── App.tsx        # Main component
│   │   ├── components/    # UI components
│   │   ├── stores/        # Zustand state management
│   │   ├── utils/         # Utilities
│   │   └── styles/        # SCSS styles
│   │
│   └── shared/            # Shared types and constants
│
├── public/                # Static assets
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript config
└── package.json           # Dependencies
```

### Technology Stack

| Component | Technology |
|-----------|-----------|
| Desktop Framework | Electron 39+ |
| UI Framework | React 19+ |
| Language | TypeScript 5+ |
| Build Tool | Vite 7+ |
| Code Editor | Monaco Editor |
| State Management | Zustand 5+ |
| LLM Backend | node-llama-cpp 3+ |
| Styling | SCSS |

### IPC Communication

The app uses Electron's IPC (Inter-Process Communication) for secure communication between the main process (LLM engine, file system) and renderer process (UI):

**Main Process:**
- Runs node-llama-cpp for LLM inference
- Manages file system operations
- Handles project management

**Renderer Process:**
- React UI components
- User interactions
- Real-time preview

## Troubleshooting

### Model Loading Issues

**Error: "Model not found"**
- Ensure the model file exists at the specified path
- Check file permissions
- Try downloading the model again

**Error: "Insufficient memory"**
- Close other applications
- Try a smaller model (Q4 quantization instead of Q5)
- Increase system swap space

### Generation Issues

**Error: "Generation failed"**
- Check model is loaded (Settings → Model Status)
- Try a simpler prompt
- Increase max tokens in settings
- Restart the application

**Slow Generation**
- Use GPU acceleration if available
- Try a smaller model
- Reduce max tokens
- Close other applications

### UI Issues

**App won't start**
- Delete `~/.bolt-llama` and start fresh
- Check Node.js version: `node --version` (should be 18+)
- Try: `npm install` and `npm run build`

**Preview not updating**
- Check browser console for errors (DevTools)
- Ensure file is saved
- Try refreshing the preview

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Type checking
npm run type-check

# Build for production
npm run build

# Create distributable packages
npm run build:electron
```

### Debugging

1. **Main Process**: Use `console.log()` - output appears in terminal
2. **Renderer Process**: Use DevTools (Ctrl+Shift+I or Cmd+Option+I)
3. **IPC Communication**: Check DevTools Console and terminal

### Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Performance Tips

1. **Use GPU Acceleration**: Set `gpuLayers` to a high value in settings
2. **Optimize Model Selection**: Use smaller quantizations (Q4) for faster inference
3. **Reduce Context Size**: Smaller context = faster generation
4. **Close Unused Projects**: Each open project consumes memory
5. **Monitor System Resources**: Use Activity Monitor (macOS) or Task Manager (Windows)

## Known Limitations

1. **Model Size**: Limited by available RAM (typically 7B-13B models work best)
2. **Generation Speed**: Depends on hardware (CPU/GPU)
3. **Context Length**: Limited by model training (typically 4K-8K tokens)
4. **No Cloud Sync**: Projects are stored locally only
5. **No Collaboration**: Single-user application

## Future Enhancements

- [ ] Model management UI (download/delete models)
- [ ] Template library with pre-built components
- [ ] Git integration for version control
- [ ] Advanced debugging tools
- [ ] Performance profiling
- [ ] Plugin system for extensions
- [ ] Multi-file generation
- [ ] Code refactoring suggestions

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or suggestions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review existing issues on GitHub
3. Create a new issue with detailed information
4. Include system specs and error messages

## Acknowledgments

- [Bolt.new](https://bolt.new/) - AI-powered web development platform
- [node-llama-cpp](https://github.com/withcatai/node-llama-cpp) - Node.js bindings for llama.cpp
- [Electron](https://www.electronjs.org/) - Cross-platform desktop framework
- [React](https://react.dev/) - UI library
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor

## Disclaimer

This application runs language models locally on your machine. The quality and accuracy of generated code depends on the model used and the prompts provided. Always review and test generated code before using it in production.

---

**Happy coding! 🚀**
