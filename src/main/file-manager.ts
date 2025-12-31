/**
 * File Manager - Handles all file system operations
 */

import fs from 'fs/promises';
import path from 'path';
import { watch } from 'fs';
import { FileInfo, ProjectMetadata } from '@shared/types';
import { PROJECT_TEMPLATES } from '@shared/constants';

export class FileManager {
  private watchers: Map<string, ReturnType<typeof watch>> = new Map();
  private projectsPath: string;

  constructor(projectsPath: string = path.join(process.env.HOME || '', '.bolt-llama/projects')) {
    this.projectsPath = projectsPath;
  }

  /**
   * Initialize projects directory
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.projectsPath, { recursive: true });
      console.log(`Projects directory initialized at: ${this.projectsPath}`);
    } catch (error) {
      console.error('Failed to initialize projects directory:', error);
      throw error;
    }
  }

  /**
   * Create a new project from template
   */
  async createProject(
    projectName: string,
    template: string = 'react-ts',
  ): Promise<{ projectPath: string; files: FileInfo[] }> {
    try {
      const projectPath = path.join(this.projectsPath, projectName);

      // Check if project already exists
      try {
        await fs.access(projectPath);
        throw new Error(`Project "${projectName}" already exists`);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error;
        }
      }

      // Get template
      const templateData = (PROJECT_TEMPLATES as Record<string, any>)[template];
      if (!templateData) {
        throw new Error(`Template "${template}" not found`);
      }

      // Create project directory
      await fs.mkdir(projectPath, { recursive: true });

      // Create project metadata
      const metadata: ProjectMetadata = {
        name: projectName,
        version: '1.0.0',
        path: projectPath,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        template,
      };

      // Create files from template
      const files: FileInfo[] = [];
      for (const [filePath, content] of Object.entries(templateData.files)) {
        const fullPath = path.join(projectPath, filePath);
        const dir = path.dirname(fullPath);

        // Create directory if needed
        await fs.mkdir(dir, { recursive: true });

        // Write file
        await fs.writeFile(fullPath, content as string, 'utf-8');

        files.push({
          path: filePath,
          name: path.basename(filePath),
          type: 'file',
          content: content as string,
        });
      }

      // Save metadata
      const metadataPath = path.join(projectPath, '.bolt-config.json');
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');

      console.log(`Project "${projectName}" created successfully`);
      return { projectPath, files };
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }

  /**
   * Read file content
   */
  async readFile(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      console.error(`Failed to read file ${filePath}:`, error);
      throw new Error(`Failed to read file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Write file content
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`File written: ${filePath}`);
    } catch (error) {
      console.error(`Failed to write file ${filePath}:`, error);
      throw new Error(`Failed to write file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      console.log(`File deleted: ${filePath}`);
    } catch (error) {
      console.error(`Failed to delete file ${filePath}:`, error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * List files in directory
   */
  async listFiles(dirPath: string, recursive: boolean = false): Promise<FileInfo[]> {
    try {
      const files: FileInfo[] = [];

      const processDir = async (currentPath: string, relativePath: string = '') => {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });

        for (const entry of entries) {
          // Skip hidden files and node_modules
          if (entry.name.startsWith('.') || entry.name === 'node_modules') {
            continue;
          }

          const fullPath = path.join(currentPath, entry.name);
          const relPath = path.join(relativePath, entry.name);

          if (entry.isDirectory()) {
            files.push({
              path: relPath,
              name: entry.name,
              type: 'directory',
            });

            if (recursive) {
              await processDir(fullPath, relPath);
            }
          } else {
            const stat = await fs.stat(fullPath);
            files.push({
              path: relPath,
              name: entry.name,
              type: 'file',
              size: stat.size,
              lastModified: stat.mtime.getTime(),
            });
          }
        }
      };

      await processDir(dirPath);
      return files;
    } catch (error) {
      console.error(`Failed to list files in ${dirPath}:`, error);
      throw new Error(`Failed to list files: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Watch file for changes
   */
  watchFile(filePath: string, callback: (event: string, filename: string) => void): void {
    try {
      if (this.watchers.has(filePath)) {
        return; // Already watching
      }

      const watcher = watch(filePath, (event, filename) => {
        callback(event, filename || filePath);
      });

      this.watchers.set(filePath, watcher);
      console.log(`Watching file: ${filePath}`);
    } catch (error) {
      console.error(`Failed to watch file ${filePath}:`, error);
    }
  }

  /**
   * Stop watching file
   */
  unwatchFile(filePath: string): void {
    const watcher = this.watchers.get(filePath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(filePath);
      console.log(`Stopped watching file: ${filePath}`);
    }
  }

  /**
   * Stop watching all files
   */
  unwatchAll(): void {
    for (const [filePath, watcher] of this.watchers.entries()) {
      watcher.close();
      this.watchers.delete(filePath);
    }
    console.log('Stopped watching all files');
  }

  /**
   * Get project metadata
   */
  async getProjectMetadata(projectPath: string): Promise<ProjectMetadata> {
    try {
      const metadataPath = path.join(projectPath, '.bolt-config.json');
      const content = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Failed to get project metadata:`, error);
      throw new Error(`Failed to get project metadata: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Save project metadata
   */
  async saveProjectMetadata(projectPath: string, metadata: ProjectMetadata): Promise<void> {
    try {
      metadata.updatedAt = Date.now();
      const metadataPath = path.join(projectPath, '.bolt-config.json');
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Failed to save project metadata:`, error);
      throw error;
    }
  }

  /**
   * Delete project
   */
  async deleteProject(projectPath: string): Promise<void> {
    try {
      // Recursively delete directory
      await fs.rm(projectPath, { recursive: true, force: true });
      console.log(`Project deleted: ${projectPath}`);
    } catch (error) {
      console.error(`Failed to delete project:`, error);
      throw error;
    }
  }

  /**
   * List all projects
   */
  async listProjects(): Promise<ProjectMetadata[]> {
    try {
      const entries = await fs.readdir(this.projectsPath, { withFileTypes: true });
      const projects: ProjectMetadata[] = [];

      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          try {
            const metadata = await this.getProjectMetadata(path.join(this.projectsPath, entry.name));
            projects.push(metadata);
          } catch (error) {
            console.warn(`Failed to load project metadata for ${entry.name}:`, error);
          }
        }
      }

      return projects;
    } catch (error) {
      console.error('Failed to list projects:', error);
      throw error;
    }
  }

  /**
   * Export project as ZIP (placeholder for now)
   */
  async exportProject(projectPath: string, exportPath: string): Promise<void> {
    try {
      // This would require a ZIP library like 'archiver'
      // For now, just copy the directory
      await fs.cp(projectPath, exportPath, { recursive: true });
      console.log(`Project exported to: ${exportPath}`);
    } catch (error) {
      console.error('Failed to export project:', error);
      throw error;
    }
  }
}

// Singleton instance
let fileManagerInstance: FileManager | null = null;

export function getFileManager(projectsPath?: string): FileManager {
  if (!fileManagerInstance) {
    fileManagerInstance = new FileManager(projectsPath);
  }
  return fileManagerInstance;
}

export function resetFileManager(): void {
  fileManagerInstance = null;
}
