/**
 * File Explorer Component - Project file tree navigation
 */

import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useEditorStore } from '../stores/editorStore';
import { IPCClient } from '../utils/ipc-client';
import '../styles/file-explorer.scss';

interface FileTreeNode {
  path: string;
  name: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
  expanded?: boolean;
}

export const FileExplorer: React.FC = () => {
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  const projectPath = useProjectStore((state) => state.projectPath);
  const projectName = useProjectStore((state) => state.projectName);
  const currentFile = useEditorStore((state) => state.selectedFile);
  const setCurrentFile = useEditorStore((state) => state.setSelectedFile);
  // const files = useProjectStore((state) => state.files); // Unused for now
  const deleteFile = useProjectStore((state) => state.deleteFile);

  // Load project files
  useEffect(() => {
    const loadFiles = async () => {
      if (!projectPath) return;

      setLoading(true);
      try {
        const fileList = await IPCClient.listFiles(projectPath, true);

        // Build tree structure
        const tree = buildFileTree(fileList);
        setFileTree(tree);

        // Auto-expand src directory
        setExpandedDirs(new Set(['src']));
      } catch (err) {
        console.error('Failed to load files:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [projectPath]);

  const handleFileClick = (path: string, type: string) => {
    if (type === 'file') {
      setCurrentFile(path);
    }
  };

  const handleDirToggle = (path: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  const handleDeleteFile = async (path: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!window.confirm(`Delete ${path}?`)) {
      return;
    }

    try {
      await IPCClient.deleteFile(`${projectPath}/${path}`);
      deleteFile(path);

      // Reload file tree
      const fileList = await IPCClient.listFiles(projectPath, true);
      const tree = buildFileTree(fileList);
      setFileTree(tree);
    } catch (err) {
      console.error('Failed to delete file:', err);
    }
  };

  const handleCreateFile = async () => {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;

    try {
      const filePath = `${projectPath}/${fileName}`;
      await IPCClient.createFile(filePath, '');

      // Reload file tree
      const fileList = await IPCClient.listFiles(projectPath, true);
      const tree = buildFileTree(fileList);
      setFileTree(tree);
    } catch (err) {
      console.error('Failed to create file:', err);
    }
  };

  if (!projectName) {
    return (
      <div className="file-explorer empty">
        <p>No project loaded</p>
      </div>
    );
  }

  return (
    <div className="file-explorer">
      <div className="explorer-header">
        <h3>{projectName}</h3>
        <button className="btn-add-file" onClick={handleCreateFile} title="Create new file">
          ➕
        </button>
      </div>

      <div className="explorer-tree">
        {loading ? (
          <div className="loading">Loading files...</div>
        ) : fileTree.length === 0 ? (
          <div className="empty">No files</div>
        ) : (
          <FileTreeView
            nodes={fileTree}
            expandedDirs={expandedDirs}
            currentFile={currentFile}
            onFileClick={handleFileClick}
            onDirToggle={handleDirToggle}
            onDeleteFile={handleDeleteFile}
          />
        )}
      </div>
    </div>
  );
};

interface FileTreeViewProps {
  nodes: FileTreeNode[];
  expandedDirs: Set<string>;
  currentFile: string | null;
  onFileClick: (path: string, type: string) => void;
  onDirToggle: (path: string) => void;
  onDeleteFile: (path: string, e: React.MouseEvent) => void;
}

const FileTreeView: React.FC<FileTreeViewProps> = ({
  nodes,
  expandedDirs,
  currentFile,
  onFileClick,
  onDirToggle,
  onDeleteFile,
}) => {
  return (
    <ul className="tree-list">
      {nodes.map((node) => (
        <li key={node.path} className={`tree-item ${node.type}`}>
          {node.type === 'directory' ? (
            <>
              <div
                className={`tree-item-label ${expandedDirs.has(node.path) ? 'expanded' : ''}`}
                onClick={() => onDirToggle(node.path)}
              >
                <span className="tree-icon">
                  {expandedDirs.has(node.path) ? '📂' : '📁'}
                </span>
                <span className="tree-name">{node.name}</span>
              </div>

              {expandedDirs.has(node.path) && node.children && node.children.length > 0 && (
                <FileTreeView
                  nodes={node.children}
                  expandedDirs={expandedDirs}
                  currentFile={currentFile}
                  onFileClick={onFileClick}
                  onDirToggle={onDirToggle}
                  onDeleteFile={onDeleteFile}
                />
              )}
            </>
          ) : (
            <div
              className={`tree-item-label file ${currentFile === node.path ? 'active' : ''}`}
              onClick={() => onFileClick(node.path, node.type)}
            >
              <span className="tree-icon">{getFileIcon(node.name)}</span>
              <span className="tree-name">{node.name}</span>
              <button
                className="btn-delete"
                onClick={(e) => onDeleteFile(node.path, e)}
                title="Delete file"
              >
                ✕
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

function buildFileTree(fileList: any[]): FileTreeNode[] {
  const tree: Record<string, FileTreeNode> = {};
  const roots: FileTreeNode[] = [];

  // Sort files by path
  const sorted = [...fileList].sort((a, b) => a.path.localeCompare(b.path));

  for (const file of sorted) {
    const parts = file.path.split('/');
    let current = tree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const path = parts.slice(0, i + 1).join('/');

      if (!current[part]) {
        const isDir = i < parts.length - 1 || file.type === 'directory';
        current[part] = {
          path,
          name: part,
          type: isDir ? 'directory' : 'file',
          children: isDir ? [] : undefined,
        };

        if (i === 0) {
          roots.push(current[part]);
        }
      }

      if (current[part].children && i < parts.length - 1) {
        current = (current[part].children as any).reduce(
          (acc: any, child: FileTreeNode) => {
            acc[child.name] = child;
            return acc;
          },
          {},
        );
      }
    }
  }

  return roots;
}

function getFileIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  const iconMap: Record<string, string> = {
    js: '📜',
    jsx: '⚛️',
    ts: '📘',
    tsx: '⚛️',
    html: '🌐',
    css: '🎨',
    scss: '🎨',
    json: '📋',
    md: '📝',
    py: '🐍',
    java: '☕',
    cpp: '⚙️',
    sql: '🗄️',
    yaml: '⚙️',
    yml: '⚙️',
    xml: '📦',
    sh: '🔧',
    bash: '🔧',
  };

  return iconMap[ext] || '📄';
}

export default FileExplorer;
