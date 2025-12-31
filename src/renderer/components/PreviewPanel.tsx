/**
 * Preview Panel Component - Live HTML/CSS/JS preview
 */

import React, { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import '../styles/preview.scss';

export const PreviewPanel: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const files = useProjectStore((state) => state.files);
  const projectName = useProjectStore((state) => state.projectName);

  // Update preview when files change
  useEffect(() => {
    updatePreview();
  }, [files]);

  const updatePreview = () => {
    if (!iframeRef.current) return;

    setLoading(true);
    setError(null);

    try {
      // Find HTML, CSS, and JS files
      let htmlContent = '';
      let cssContent = '';
      let jsContent = '';

      for (const [path, content] of files.entries()) {
        if (path.endsWith('.html') || path.endsWith('.htm')) {
          htmlContent = content;
        } else if (path.endsWith('.css') || path.endsWith('.scss')) {
          cssContent = content;
        } else if (path.endsWith('.js') || path.endsWith('.jsx') || path.endsWith('.ts') || path.endsWith('.tsx')) {
          jsContent = content;
        }
      }

      // Build complete HTML document
      const previewHTML = buildPreviewHTML(htmlContent, cssContent, jsContent);

      // Write to iframe
      const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(previewHTML);
        iframeDoc.close();
      }

      setLoading(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      setLoading(false);
      console.error('Preview error:', err);
    }
  };

  const handleRefresh = () => {
    updatePreview();
  };

  const handleOpenDevTools = () => {
    const iframeWindow = iframeRef.current?.contentWindow;
    if (iframeWindow) {
      iframeWindow.open('about:blank', '_blank');
    }
  };

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <h3>Preview</h3>
        <div className="preview-actions">
          {loading && <span className="loading-indicator">Loading...</span>}
          <button className="btn-refresh" onClick={handleRefresh} title="Refresh preview">
            🔄
          </button>
        </div>
      </div>

      {error && (
        <div className="preview-error">
          <p className="error-title">Preview Error</p>
          <p className="error-message">{error}</p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        className="preview-iframe"
        sandbox="allow-scripts allow-same-origin allow-forms"
        title="Code Preview"
      />
    </div>
  );
};

function buildPreviewHTML(html: string, css: string, js: string): string {
  // If no HTML provided, create a basic template
  if (!html) {
    html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
</head>
<body>
    <div id="app"></div>
</body>
</html>`;
  }

  // Parse HTML to inject styles and scripts
  let previewHTML = html;

  // Inject CSS
  if (css) {
    const styleTag = `<style>${css}</style>`;
    if (previewHTML.includes('</head>')) {
      previewHTML = previewHTML.replace('</head>', `${styleTag}</head>`);
    } else {
      previewHTML = styleTag + previewHTML;
    }
  }

  // Inject JavaScript
  if (js) {
    const scriptTag = `<script>${js}</script>`;
    if (previewHTML.includes('</body>')) {
      previewHTML = previewHTML.replace('</body>', `${scriptTag}</body>`);
    } else {
      previewHTML = previewHTML + scriptTag;
    }
  }

  return previewHTML;
}

export default PreviewPanel;
