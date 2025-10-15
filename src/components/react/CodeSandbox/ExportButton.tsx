/**
 * Export Project Button Component
 * Handles exporting projects as HTML files
 */

import { useState } from 'react';
import { useEditorStore } from '@/stores/editorStore';

export default function ExportButton() {
  const { currentProjectId, projectTitle, htmlCode, cssCode, jsCode } = useEditorStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // If project is saved, use the export API
      if (currentProjectId) {
        const response = await fetch(`/api/projects/${currentProjectId}/export`);

        if (!response.ok) {
          throw new Error('Failed to export project');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // Export unsaved project directly
        const html = generateCompleteHTML(htmlCode, cssCode, jsCode, projectTitle);
        const blob = new Blob([html], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error: any) {
      console.error('Export error:', error);
      alert(`Failed to export project: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
      title="Export as HTML file"
    >
      {isExporting ? (
        <>
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>Export</span>
        </>
      )}
    </button>
  );
}

/**
 * Generate complete standalone HTML file
 */
function generateCompleteHTML(html: string, css: string, js: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'My Project'}</title>
  <style>
${css}
  </style>
</head>
<body>
${html}
  <script>
${js}
  </script>
</body>
</html>`;
}

