# Bolt + Llama Electron App - Architecture Document

## Project Overview

This is a desktop application that combines Bolt.new's AI-powered web development capabilities with node-llama-cpp for local LLM inference. The app allows users to generate, edit, and preview full-stack web applications using a locally-running language model, without requiring cloud API keys or internet connectivity.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Main Process                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  LLM Engine (node-llama-cpp)                         │   │
│  │  - Model loading and initialization                  │   │
│  │  - Chat session management                           │   │
│  │  - Code generation inference                         │   │
│  │  - JSON schema enforcement                           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  File System Manager                                 │   │
│  │  - Project file operations (CRUD)                    │   │
│  │  - Directory structure management                    │   │
│  │  - File watching and sync                            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  IPC Message Handler                                 │   │
│  │  - Route messages from renderer                      │   │
│  │  - Manage async operations                           │   │
│  │  - Stream responses                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↕ IPC
┌─────────────────────────────────────────────────────────────┐
│                  Electron Renderer Process                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Application (TypeScript)                      │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  UI Components                                 │  │   │
│  │  │  - Chat Interface                              │  │   │
│  │  │  - Code Editor (Monaco)                        │  │   │
│  │  │  - File Browser                                │  │   │
│  │  │  - Live Preview Panel                          │  │   │
│  │  │  - Project Settings                            │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  State Management (Zustand)                    │  │   │
│  │  │  - Project state                               │  │   │
│  │  │  - Chat history                                │  │   │
│  │  │  - Editor state                                │  │   │
│  │  │  - UI state                                    │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  IPC Client                                    │  │   │
│  │  │  - Send prompts to LLM                         │  │   │
│  │  │  - Request file operations                     │  │   │
│  │  │  - Stream response handling                    │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
bolt-llama-electron/
├── src/
│   ├── main/                          # Electron main process
│   │   ├── index.ts                   # Entry point
│   │   ├── ipc-handlers.ts            # IPC message handlers
│   │   ├── llm-engine.ts              # node-llama-cpp integration
│   │   ├── file-manager.ts            # File system operations
│   │   └── preload.ts                 # Preload script for security
│   │
│   ├── renderer/                      # Electron renderer process
│   │   ├── index.tsx                  # React entry point
│   │   ├── App.tsx                    # Main app component
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx      # Chat UI component
│   │   │   ├── CodeEditor.tsx         # Monaco editor wrapper
│   │   │   ├── FileExplorer.tsx       # Project file browser
│   │   │   ├── PreviewPanel.tsx       # Live code preview
│   │   │   └── ProjectSettings.tsx    # Settings panel
│   │   ├── stores/
│   │   │   ├── projectStore.ts        # Project state management
│   │   │   ├── chatStore.ts           # Chat history state
│   │   │   └── editorStore.ts         # Editor state
│   │   ├── utils/
│   │   │   ├── ipc-client.ts          # IPC communication client
│   │   │   ├── code-formatter.ts      # Code formatting utilities
│   │   │   └── file-utils.ts          # File handling utilities
│   │   └── styles/
│   │       └── main.scss              # Global styles
│   │
│   └── shared/                        # Shared types and utilities
│       ├── types.ts                   # TypeScript interfaces
│       ├── ipc-channels.ts            # IPC channel definitions
│       └── constants.ts               # App constants
│
├── public/
│   ├── index.html                     # Renderer HTML template
│   └── assets/                        # Static assets
│
├── vite.config.ts                     # Vite configuration
├── tsconfig.json                      # TypeScript configuration
├── electron-builder.yml               # Electron Builder config
├── package.json                       # Dependencies and scripts
└── README.md                          # Project documentation
```

## Key Technologies

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Desktop Framework | Electron 28+ | Cross-platform desktop app |
| UI Framework | React 18+ | Component-based UI |
| Language | TypeScript | Type-safe development |
| Build Tool | Vite | Fast development and bundling |
| Code Editor | Monaco Editor | Professional code editing |
| State Management | Zustand | Lightweight state store |
| LLM Backend | node-llama-cpp | Local model inference |
| Styling | SCSS | Advanced CSS features |
| Bundler | Electron Builder | App distribution |

## IPC Communication Protocol

### Main Process → Renderer Process

**Channel: `llm:response`**
- Sends generated code from LLM
- Includes metadata (tokens used, generation time)

**Channel: `file:updated`**
- Notifies when files are modified
- Includes file path and new content

### Renderer Process → Main Process

**Channel: `llm:generate`**
- Request: `{ prompt: string; context?: string; model?: string }`
- Response: `{ code: string; explanation: string; tokens: number }`

**Channel: `file:read`**
- Request: `{ path: string }`
- Response: `{ content: string; encoding: string }`

**Channel: `file:write`**
- Request: `{ path: string; content: string }`
- Response: `{ success: boolean; error?: string }`

**Channel: `project:create`**
- Request: `{ name: string; template: string }`
- Response: `{ projectPath: string; files: FileInfo[] }`

## LLM Integration Details

### Model Management

The application supports GGUF format models. Recommended models for code generation:

- **CodeLlama 7B**: Specialized for code, good speed/quality balance
- **Mistral 7B Instruct**: Fast, versatile instruction-following
- **Llama 2 13B**: Larger model for complex tasks
- **DeepSeek Coder**: Excellent code generation capabilities

### Code Generation Flow

1. User enters prompt in chat interface
2. Renderer sends prompt via IPC to main process
3. Main process routes to LLM engine
4. LLM engine loads model and creates chat session
5. Model generates code based on prompt
6. Response streamed back to renderer
7. Renderer displays code and updates preview

### JSON Schema Enforcement

For structured outputs, the app can enforce JSON schemas to ensure valid output format:

```typescript
const schema = {
  type: "object",
  properties: {
    html: { type: "string" },
    css: { type: "string" },
    javascript: { type: "string" }
  },
  required: ["html", "css", "javascript"]
};
```

## File System Architecture

### Project Structure

Each project contains:

```
my-project/
├── src/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── package.json
├── .bolt-config.json          # Project metadata
└── .chat-history.json         # Conversation history
```

### File Operations

- **Create**: Generate new files from templates or LLM output
- **Read**: Load files for editing or preview
- **Update**: Modify existing files
- **Delete**: Remove files from project
- **Watch**: Monitor file changes for live preview

## State Management

### Project Store (Zustand)

```typescript
interface ProjectState {
  projectName: string;
  projectPath: string;
  files: Map<string, FileContent>;
  currentFile: string;
  isDirty: boolean;
  // Actions
  setProjectName: (name: string) => void;
  addFile: (path: string, content: string) => void;
  updateFile: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
}
```

### Chat Store (Zustand)

```typescript
interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  currentModel: string;
  // Actions
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  clearHistory: () => void;
}
```

## Security Considerations

1. **IPC Security**: Use preload script to expose only necessary APIs
2. **Model Isolation**: LLM runs in main process, isolated from renderer
3. **File Access**: Restrict file operations to project directory
4. **Input Validation**: Validate all IPC messages
5. **No Remote Code Execution**: Generated code runs in preview context only

## Performance Optimization

1. **Model Caching**: Keep loaded model in memory between requests
2. **Lazy Loading**: Load UI components on demand
3. **Code Splitting**: Split large components for faster initial load
4. **Streaming Responses**: Stream LLM output for perceived speed
5. **Hardware Acceleration**: Leverage GPU/Metal/CUDA when available

## Development Workflow

### Development Mode

```bash
npm run dev
```

Runs Vite dev server for renderer and Electron in development mode with hot reload.

### Production Build

```bash
npm run build
```

Builds optimized bundle and creates distributable app package.

### Testing

```bash
npm run test
```

Runs unit and integration tests.

## Deployment

The application is packaged using Electron Builder, supporting:

- macOS (DMG, ZIP)
- Windows (NSIS installer, portable EXE)
- Linux (AppImage, DEB)

## Future Enhancements

1. **Model Management UI**: Download and manage models from within app
2. **Template Library**: Pre-built project templates
3. **Collaboration**: Multi-user project support
4. **Version Control**: Built-in Git integration
5. **Plugin System**: Extensible architecture for custom tools
6. **Advanced Debugging**: Integrated debugger for generated code
7. **Performance Profiling**: Monitor LLM and code execution performance
