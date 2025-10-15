/**
 * Editor Store
 * Zustand store for managing code editor state (HTML/CSS/JS)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PanelType = 'html' | 'css' | 'js';
export type LayoutMode = 'horizontal' | 'vertical' | 'tabs';

interface EditorState {
  // Code content
  htmlCode: string;
  cssCode: string;
  jsCode: string;

  // Editor settings
  theme: 'gamecode-dark' | 'gamecode-light';
  fontSize: number;
  layoutMode: LayoutMode;
  activePanel: PanelType;

  // Preview settings
  autoRefresh: boolean;
  refreshDelay: number; // milliseconds
  isPreviewVisible: boolean;

  // Project metadata
  currentProjectId: string | null;
  projectTitle: string;
  hasUnsavedChanges: boolean;

  // Actions
  setHtmlCode: (code: string) => void;
  setCssCode: (code: string) => void;
  setJsCode: (code: string) => void;
  setCode: (panel: PanelType, code: string) => void;

  setTheme: (theme: 'gamecode-dark' | 'gamecode-light') => void;
  setFontSize: (size: number) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setActivePanel: (panel: PanelType) => void;

  setAutoRefresh: (enabled: boolean) => void;
  setRefreshDelay: (delay: number) => void;
  togglePreview: () => void;

  loadProject: (project: {
    id: string;
    title: string;
    html: string;
    css: string;
    js: string;
  }) => void;
  setProjectTitle: (title: string) => void;
  markSaved: () => void;
  resetEditor: () => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      // Initial state
      htmlCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Project</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>',
      cssCode: '/* Add your CSS here */\nbody {\n  font-family: Arial, sans-serif;\n  padding: 20px;\n}',
      jsCode: '// Add your JavaScript here\nconsole.log("Hello, World!");',
      theme: 'gamecode-dark',
      fontSize: 14,
      layoutMode: 'horizontal',
      activePanel: 'html',
      autoRefresh: true,
      refreshDelay: 500,
      isPreviewVisible: true,
      currentProjectId: null,
      projectTitle: 'Untitled Project',
      hasUnsavedChanges: false,

      // Code setters
      setHtmlCode: (code) => set({ htmlCode: code, hasUnsavedChanges: true }),
      setCssCode: (code) => set({ cssCode: code, hasUnsavedChanges: true }),
      setJsCode: (code) => set({ jsCode: code, hasUnsavedChanges: true }),
      setCode: (panel, code) => {
        const updates: Partial<EditorState> = { hasUnsavedChanges: true };
        if (panel === 'html') updates.htmlCode = code;
        else if (panel === 'css') updates.cssCode = code;
        else if (panel === 'js') updates.jsCode = code;
        set(updates);
      },

      // Settings setters
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLayoutMode: (layoutMode) => set({ layoutMode }),
      setActivePanel: (activePanel) => set({ activePanel }),

      // Preview settings
      setAutoRefresh: (autoRefresh) => set({ autoRefresh }),
      setRefreshDelay: (refreshDelay) => set({ refreshDelay }),
      togglePreview: () => set((state) => ({ isPreviewVisible: !state.isPreviewVisible })),

      // Project management
      loadProject: (project) =>
        set({
          currentProjectId: project.id,
          projectTitle: project.title,
          htmlCode: project.html,
          cssCode: project.css,
          jsCode: project.js,
          hasUnsavedChanges: false,
        }),
      setProjectTitle: (projectTitle) => set({ projectTitle, hasUnsavedChanges: true }),
      markSaved: () => set({ hasUnsavedChanges: false }),
      resetEditor: () =>
        set({
          htmlCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Project</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>',
          cssCode: '/* Add your CSS here */\nbody {\n  font-family: Arial, sans-serif;\n  padding: 20px;\n}',
          jsCode: '// Add your JavaScript here\nconsole.log("Hello, World!");',
          currentProjectId: null,
          projectTitle: 'Untitled Project',
          hasUnsavedChanges: false,
        }),
    }),
    {
      name: 'gamecode-editor-storage',
      partialize: (state) => ({
        theme: state.theme,
        fontSize: state.fontSize,
        layoutMode: state.layoutMode,
        autoRefresh: state.autoRefresh,
        refreshDelay: state.refreshDelay,
        isPreviewVisible: state.isPreviewVisible,
      }),
    }
  )
);

