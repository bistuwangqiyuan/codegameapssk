/**
 * Save Project Button Component
 * Handles saving projects to the database
 */

import { useState } from 'react';
import { useEditorStore } from '@/stores/editorStore';

export default function SaveButton() {
  const { currentProjectId, projectTitle, htmlCode, cssCode, jsCode, markSaved, setProjectTitle } = useEditorStore();
  const [isSaving, setIsSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [tempTitle, setTempTitle] = useState(projectTitle);

  const handleSave = async () => {
    // If no title or untitled, show dialog
    if (!currentProjectId && (projectTitle === 'Untitled Project' || !projectTitle.trim())) {
      setShowDialog(true);
      return;
    }

    await saveProject(projectTitle);
  };

  const saveProject = async (title: string) => {
    setIsSaving(true);

    try {
      const response = await fetch('/api/projects/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProjectId,
          title,
          htmlCode,
          cssCode,
          jsCode,
          isPublic: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save project');
      }

      const data = await response.json();

      if (data.success) {
        markSaved();
        setProjectTitle(title);
        setShowDialog(false);

        // Show success toast (you could use a toast library)
        alert('Project saved successfully!');
      } else {
        throw new Error(data.error || 'Save failed');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      alert(`Failed to save project: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold rounded-lg transition-colors shadow-md"
      >
        {isSaving ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            <span>Save Project</span>
          </>
        )}
      </button>

      {/* Save Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDialog(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Save Project</h3>

            <label className="block mb-4">
              <span className="text-sm font-semibold text-gray-700 mb-2 block">Project Name</span>
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                placeholder="My Awesome Project"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                autoFocus
              />
            </label>

            <div className="flex items-center gap-3">
              <button
                onClick={() => saveProject(tempTitle)}
                disabled={!tempTitle.trim() || isSaving}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold rounded-lg transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

