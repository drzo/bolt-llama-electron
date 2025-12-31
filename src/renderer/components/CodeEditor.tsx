/**
 * Code Editor Component - Monaco Editor integration
 */

import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import { useProjectStore } from '../stores/projectStore';
import { useEditorStore } from '../stores/editorStore';
import { IPCClient } from '../utils/ipc-client';
import '../styles/editor.scss';

export const CodeEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isEditing, setIsEditing] = useState(false);

  const currentFile = useProjectStore((state) => state.currentFile);
  const files = useProjectStore((state) => state.files);
  const updateFile = useProjectStore((state) => state.updateFile);
  const setDirty = useProjectStore((state) => state.setDirty);

  const fontSize = useEditorStore((state) => state.fontSize);
  const theme = useEditorStore((state) => state.theme);
  const language = useEditorStore((state) => state.language);
  const wordWrap = useEditorStore((state) => state.wordWrap);
  const minimap = useEditorStore((state) => state.minimap);
  const autoSave = useEditorStore((state) => state.autoSave);
  const autoSaveInterval = useEditorStore((state) => state.autoSaveInterval);

  const setFontSize = useEditorStore((state) => state.setFontSize);
  const setTheme = useEditorStore((state) => state.setTheme);
  const setLanguage = useEditorStore((state) => state.setLanguage);

  // Initialize Monaco Editor
  useEffect(() => {
    if (!editorRef.current) return;

    monacoEditorRef.current = monaco.editor.create(editorRef.current, {
      value: currentFile ? files.get(currentFile) || '' : '',
      language: getLanguageFromFile(currentFile || ''),
      theme: theme === 'dark' ? 'vs-dark' : 'vs',
      fontSize,
      wordWrap: wordWrap ? 'on' : 'off',
      minimap: { enabled: minimap },
      automaticLayout: true,
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      formatOnPaste: true,
      formatOnType: true,
    });

    // Handle editor changes
    monacoEditorRef.current.onDidChangeModelContent(() => {
      if (!currentFile) return;

      const content = monacoEditorRef.current?.getValue() || '';
      updateFile(currentFile, content);
      setDirty(true);

      // Auto-save with debounce
      if (autoSave) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
          try {
            await IPCClient.writeFile(currentFile, content);
            setDirty(false);
          } catch (err) {
            console.error('Failed to save file:', err);
          }
        }, autoSaveInterval);
      }
    });

    return () => {
      monacoEditorRef.current?.dispose();
    };
  }, []);

  // Update editor content when file changes
  useEffect(() => {
    if (!monacoEditorRef.current || !currentFile) return;

    const content = files.get(currentFile) || '';
    const model = monacoEditorRef.current.getModel();

    if (model && model.getValue() !== content) {
      monacoEditorRef.current.setValue(content);
    }

    // Update language
    const newLanguage = getLanguageFromFile(currentFile);
    if (model) {
      monaco.editor.setModelLanguage(model, newLanguage);
    }
    setLanguage(newLanguage);
  }, [currentFile, files, setLanguage]);

  // Update editor options
  useEffect(() => {
    if (!monacoEditorRef.current) return;

    monacoEditorRef.current.updateOptions({
      fontSize,
      theme: theme === 'dark' ? 'vs-dark' : 'vs',
      wordWrap: wordWrap ? 'on' : 'off',
      minimap: { enabled: minimap },
    });
  }, [fontSize, theme, wordWrap, minimap]);

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value);
    setFontSize(size);
  };

  const handleThemeChange = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleFormatCode = () => {
    monacoEditorRef.current?.getAction('editor.action.formatDocument')?.run();
  };

  const handleSaveFile = async () => {
    if (!currentFile) return;

    try {
      const content = monacoEditorRef.current?.getValue() || '';
      await IPCClient.writeFile(currentFile, content);
      setDirty(false);
    } catch (err) {
      console.error('Failed to save file:', err);
    }
  };

  if (!currentFile) {
    return (
      <div className="code-editor empty">
        <div className="empty-state">
          <p>No file selected</p>
          <p className="hint">Select a file from the file explorer to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="code-editor">
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <span className="file-name">{currentFile}</span>
        </div>

        <div className="toolbar-right">
          <div className="toolbar-group">
            <label htmlFor="font-size">Font:</label>
            <input
              id="font-size"
              type="range"
              min="10"
              max="32"
              value={fontSize}
              onChange={handleFontSizeChange}
              title="Font size"
            />
            <span className="font-size-value">{fontSize}px</span>
          </div>

          <button
            className="toolbar-btn"
            onClick={handleThemeChange}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button className="toolbar-btn" onClick={handleFormatCode} title="Format code">
            ⚙️
          </button>

          <button className="toolbar-btn save" onClick={handleSaveFile} title="Save file">
            💾 Save
          </button>
        </div>
      </div>

      <div ref={editorRef} className="editor-container" />
    </div>
  );
};

function getLanguageFromFile(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';

  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',
    json: 'json',
    md: 'markdown',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    sql: 'sql',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    sh: 'shell',
    bash: 'shell',
  };

  return languageMap[ext] || 'plaintext';
}

export default CodeEditor;
