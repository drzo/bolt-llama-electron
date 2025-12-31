/**
 * Main App Component - Full application layout
 */

import { useEffect, useState } from 'react';
import { useProjectStore } from './stores/projectStore';
import { useEditorStore } from './stores/editorStore';
import { IPCClient } from './utils/ipc-client';
import ChatInterface from './components/ChatInterface';
import CodeEditor from './components/CodeEditor';
import FileExplorer from './components/FileExplorer';
import PreviewPanel from './components/PreviewPanel';
import './styles/main.scss';
import './styles/layout.scss';

export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [projectInput, setProjectInput] = useState('');

  const theme = useEditorStore((state) => state.theme);
  const projectName = useProjectStore((state) => state.projectName);
  const setProjectName = useProjectStore((state) => state.setProjectName);
  const setProjectPath = useProjectStore((state) => state.setProjectPath);
  const setFiles = useProjectStore((state) => state.setFiles);
  const setCurrentFile = useEditorStore((state) => state.setSelectedFile);

  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      try {
        // Get available models
        const models = await IPCClient.getModels();
        console.log('Available models:', models);

        // Subscribe to app events
        const unsubscribeError = IPCClient.onError((error) => {
          console.error('App error:', error);
          setError(error);
        });

        const unsubscribeNotification = IPCClient.onNotification((data) => {
          console.log('Notification:', data);
        });

        setInitialized(true);

        // Cleanup on unmount
        return () => {
          unsubscribeError();
          unsubscribeNotification();
        };
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError(err instanceof Error ? err.message : String(err));
        return () => {}; // Return empty cleanup function on error
      }
    };

    initializeApp();
  }, []);

  const handleCreateProject = async () => {
    if (!projectInput.trim()) return;

    try {
      const result = await IPCClient.createProject(projectInput, 'react-ts');

      if (result.success) {
        setProjectName(projectInput);
        setProjectPath(result.projectPath);

        // Load files
        const fileMap = new Map<string, string>();
        for (const file of result.files) {
          if (file.type === 'file' && file.content) {
            fileMap.set(file.path, file.content);
          }
        }
        setFiles(fileMap);

        // Select first file
        if (result.files.length > 0) {
          const firstFile = result.files.find((f: any) => f.type === 'file');
          if (firstFile) {
            setCurrentFile(firstFile.path);
          }
        }

        setShowProjectDialog(false);
        setProjectInput('');
      } else {
        setError(result.error || 'Failed to create project');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleLoadProjects = async () => {
    try {
      const projects = await IPCClient.listProjects();
      if (projects.length > 0) {
        // Load first project
        const project = projects[0];
        setProjectName(project.name);
        setProjectPath(project.path);

        // Load files from project
        const fileList = await IPCClient.listFiles(project.path, true);
        const fileMap = new Map<string, string>();

        for (const file of fileList) {
          if (file.type === 'file') {
            try {
              const content = await IPCClient.readFile(`${project.path}/${file.path}`);
              fileMap.set(file.path, content);
            } catch (err) {
              console.warn(`Failed to read file ${file.path}:`, err);
            }
          }
        }
        setFiles(fileMap);

        // Select first file
        const firstFile = fileList.find((f) => f.type === 'file');
        if (firstFile) {
          setCurrentFile(firstFile.path);
        }
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  if (!initialized) {
    return (
      <div className={`app loading ${theme}`}>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Initializing Bolt Llama...</p>
        </div>
      </div>
    );
  }

  if (error && !projectName) {
    return (
      <div className={`app error ${theme}`}>
        <div className="error-container">
          <h1>Error</h1>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${theme}`}>
      <header className="app-header">
        <div className="header-left">
          <h1>Bolt Llama</h1>
          {projectName && <span className="project-name">{projectName}</span>}
        </div>

        <div className="header-right">
          {!projectName ? (
            <>
              <button className="btn-primary" onClick={() => setShowProjectDialog(true)}>
                New Project
              </button>
              <button className="btn-secondary" onClick={handleLoadProjects}>
                Load Project
              </button>
            </>
          ) : (
            <button className="btn-secondary" onClick={() => window.location.reload()}>
              New Project
            </button>
          )}
        </div>
      </header>

      {showProjectDialog && (
        <div className="modal-overlay" onClick={() => setShowProjectDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Project</h2>
            <input
              type="text"
              value={projectInput}
              onChange={(e) => setProjectInput(e.target.value)}
              placeholder="Project name"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
            />
            <div className="modal-actions">
              <button className="btn-primary" onClick={handleCreateProject}>
                Create
              </button>
              <button className="btn-secondary" onClick={() => setShowProjectDialog(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {projectName ? (
        <main className="app-main">
          <div className="layout-container">
            <aside className="sidebar-left">
              <FileExplorer />
            </aside>

            <section className="editor-section">
              <CodeEditor />
            </section>

            <aside className="sidebar-right">
              <div className="sidebar-tabs">
                <div className="tab-content">
                  <ChatInterface />
                </div>
              </div>
            </aside>
          </div>

          <aside className="preview-section">
            <PreviewPanel />
          </aside>
        </main>
      ) : (
        <main className="app-main">
          <div className="placeholder">
            <h2>Welcome to Bolt Llama</h2>
            <p>AI-powered web development with local LLM inference</p>

            <div className="actions">
              <button className="btn-primary btn-large" onClick={() => setShowProjectDialog(true)}>
                Create New Project
              </button>
              <button className="btn-secondary btn-large" onClick={handleLoadProjects}>
                Load Existing Project
              </button>
            </div>

            <div className="features">
              <h3>Features</h3>
              <ul>
                <li>✨ AI-powered code generation</li>
                <li>💻 Live code preview</li>
                <li>📁 Project file management</li>
                <li>🤖 Local LLM inference</li>
                <li>🎨 Professional code editor</li>
                <li>🔄 Real-time updates</li>
              </ul>
            </div>
          </div>
        </main>
      )}

      <footer className="app-footer">
        <p>Bolt Llama • Local AI-powered development</p>
      </footer>
    </div>
  );
}
