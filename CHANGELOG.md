# Changelog

All notable changes to Bolt Llama Electron will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release preparation

## [1.0.0] - 2025-12-31

### Added
- Initial release of Bolt Llama Electron
- AI-powered code generation with local LLM inference using node-llama-cpp
- Monaco code editor with syntax highlighting and auto-save
- Live HTML/CSS/JS preview panel
- Project file management with file tree navigation
- Chat interface for AI interactions with streaming responses
- Support for multiple LLM models (CodeLlama, Mistral, DeepSeek Coder)
- Dark and light theme support
- Cross-platform support (macOS, Windows, Linux)
- Project templates (React + TypeScript, Vanilla HTML/CSS/JS)
- File operations (create, edit, delete, save)
- IPC communication between main and renderer processes
- Secure context isolation and preload script
- Comprehensive documentation (README, ARCHITECTURE, IMPLEMENTATION_STATUS)

### Technical Details
- Electron 39.2.7
- React 19.2.3
- TypeScript 5.9.3
- node-llama-cpp 3.14.5
- Monaco Editor 0.55.1
- Zustand 5.0.9 for state management
- Vite 7.3.0 for build tooling
- SCSS for styling

### Known Issues
- Model download must be done manually
- Chat history not persisted to disk
- No code signing for installers
- Auto-update not implemented

### Requirements
- Node.js 18+
- 8GB RAM minimum (16GB+ recommended)
- 10GB+ disk space for models
- Optional: GPU for hardware acceleration

---

## Release Notes Template

When creating a new release, copy this template:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes to existing functionality

### Deprecated
- Features that will be removed in future versions

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security improvements
```

---

[Unreleased]: https://github.com/drzo/bolt-llama-electron/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/drzo/bolt-llama-electron/releases/tag/v1.0.0
