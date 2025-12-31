/**
 * Application-wide constants
 */

export const APP_NAME = 'Bolt Llama';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'AI-powered web development with local LLM inference';

export const DEFAULT_CONFIG = {
  theme: 'dark' as const,
  autoSave: true,
  autoSaveInterval: 5000,
  defaultTemplate: 'react-ts',
  modelPath: '~/.bolt-llama/models',
  projectsPath: '~/.bolt-llama/projects',
};

export const LLM_DEFAULTS = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxTokens: 2048,
  contextSize: 4096,
  gpuLayers: 33,
};

export const SUPPORTED_MODELS = [
  {
    name: 'CodeLlama 7B',
    file: 'codellama-7b-instruct.Q4_K_M.gguf',
    size: '3.5GB',
    recommended: true,
  },
  {
    name: 'Mistral 7B Instruct',
    file: 'mistral-7b-instruct-v0.2.Q4_K_M.gguf',
    size: '4.4GB',
    recommended: true,
  },
  {
    name: 'Llama 2 13B',
    file: 'llama-2-13b-chat.Q4_K_M.gguf',
    size: '7.4GB',
    recommended: false,
  },
  {
    name: 'DeepSeek Coder 6.7B',
    file: 'deepseek-coder-6.7b-instruct.Q4_K_M.gguf',
    size: '3.8GB',
    recommended: true,
  },
];

export const PROJECT_TEMPLATES = {
  'react-ts': {
    name: 'React + TypeScript',
    description: 'Modern React app with TypeScript',
    files: {
      'package.json': JSON.stringify({
        name: 'bolt-project',
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
        },
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        },
        devDependencies: {
          vite: '^5.0.0',
          '@vitejs/plugin-react': '^4.0.0',
          typescript: '^5.0.0',
        },
      }, null, 2),
      'src/index.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`,
      'src/App.tsx': `export default function App() {
  return (
    <div className="app">
      <h1>Welcome to Bolt Llama</h1>
      <p>Start editing to see changes</p>
    </div>
  );
}`,
      'src/index.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}`,
      'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bolt Llama Project</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>`,
    },
  },
  'html-css-js': {
    name: 'Vanilla HTML/CSS/JS',
    description: 'Simple HTML, CSS, and JavaScript project',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bolt Llama Project</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to Bolt Llama</h1>
        <p>Start editing to see changes</p>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
      'styles.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 1rem;
}

p {
  color: #666;
}`,
      'script.js': `console.log('Bolt Llama app loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready');
});`,
    },
  },
};

export const CODE_LANGUAGES = [
  'javascript',
  'typescript',
  'html',
  'css',
  'json',
  'markdown',
  'python',
  'java',
  'cpp',
  'csharp',
  'sql',
  'yaml',
];

export const SYSTEM_PROMPTS = {
  codeGeneration: `You are an expert web developer. When asked to generate code, provide clean, well-structured, and production-ready code. Include comments where necessary. Return only the code without any explanation unless specifically asked.`,
  
  codeExplanation: `You are an expert web developer. Explain the code clearly and concisely, breaking down complex concepts into understandable parts. Use examples when helpful.`,
  
  bugFix: `You are an expert web developer and debugger. Analyze the provided code, identify bugs, and provide fixes with explanations of what was wrong and why the fix works.`,
  
  codeReview: `You are an expert code reviewer. Review the provided code for quality, performance, security, and best practices. Provide constructive feedback and suggestions for improvement.`,
};

export const ERROR_MESSAGES = {
  MODEL_NOT_FOUND: 'Model not found. Please ensure the model file exists at the specified path.',
  MODEL_LOAD_FAILED: 'Failed to load model. Check the model path and ensure sufficient memory.',
  GENERATION_FAILED: 'Code generation failed. Please try again with a different prompt.',
  FILE_NOT_FOUND: 'File not found.',
  FILE_OPERATION_FAILED: 'File operation failed.',
  PROJECT_NOT_FOUND: 'Project not found.',
  INVALID_PROJECT: 'Invalid project structure.',
};

export const SUCCESS_MESSAGES = {
  PROJECT_CREATED: 'Project created successfully.',
  FILE_SAVED: 'File saved successfully.',
  CODE_GENERATED: 'Code generated successfully.',
  MODEL_LOADED: 'Model loaded successfully.',
};
