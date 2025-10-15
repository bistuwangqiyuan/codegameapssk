/**
 * Three-Panel Editor Layout
 * HTML, CSS, and JavaScript editors with resizable panels
 */

import { useState } from 'react';
import MonacoEditor from '../CodeEditor/MonacoEditor';
import { useEditorStore } from '@/stores/editorStore';
import type { PanelType } from '@/stores/editorStore';

interface EditorPanelsProps {
  className?: string;
}

export default function EditorPanels({ className = '' }: EditorPanelsProps) {
  const {
    htmlCode,
    cssCode,
    jsCode,
    setHtmlCode,
    setCssCode,
    setJsCode,
    theme,
    fontSize,
    layoutMode,
    activePanel,
    setActivePanel,
  } = useEditorStore();

  const panels: Array<{ id: PanelType; label: string; language: 'html' | 'css' | 'javascript'; icon: string }> = [
    { id: 'html', label: 'HTML', language: 'html', icon: '🌐' },
    { id: 'css', label: 'CSS', language: 'css', icon: '🎨' },
    { id: 'js', label: 'JavaScript', language: 'javascript', icon: '⚡' },
  ];

  const getCode = (panel: PanelType) => {
    switch (panel) {
      case 'html':
        return htmlCode;
      case 'css':
        return cssCode;
      case 'js':
        return jsCode;
    }
  };

  const setCode = (panel: PanelType, code: string) => {
    switch (panel) {
      case 'html':
        setHtmlCode(code);
        break;
      case 'css':
        setCssCode(code);
        break;
      case 'js':
        setJsCode(code);
        break;
    }
  };

  // Tab mode - single panel at a time
  if (layoutMode === 'tabs') {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        {/* Tab Headers */}
        <div className="flex bg-gray-800 border-b border-gray-700">
          {panels.map((panel) => (
            <button
              key={panel.id}
              onClick={() => setActivePanel(panel.id)}
              className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 ${
                activePanel === panel.id
                  ? 'bg-gray-900 text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span>{panel.icon}</span>
              <span>{panel.label}</span>
            </button>
          ))}
        </div>

        {/* Active Panel */}
        <div className="flex-1">
          {panels.map((panel) => (
            <div key={panel.id} className={`h-full ${activePanel === panel.id ? 'block' : 'hidden'}`}>
              <MonacoEditor
                value={getCode(panel.id)}
                language={panel.language}
                onChange={(code) => setCode(panel.id, code)}
                theme={theme}
                fontSize={fontSize}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Horizontal/Vertical split mode
  const flexDirection = layoutMode === 'horizontal' ? 'flex-row' : 'flex-col';
  const panelSize = layoutMode === 'horizontal' ? 'w-1/3' : 'h-1/3';

  return (
    <div className={`flex ${flexDirection} h-full ${className}`}>
      {panels.map((panel, index) => (
        <div key={panel.id} className={`${panelSize} flex flex-col ${index < panels.length - 1 ? 'border-r border-gray-700' : ''}`}>
          {/* Panel Header */}
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center gap-2">
            <span className="text-lg">{panel.icon}</span>
            <span className="font-semibold text-gray-200">{panel.label}</span>
            <span className="ml-auto text-xs text-gray-500">{panel.language}</span>
          </div>

          {/* Editor */}
          <div className="flex-1">
            <MonacoEditor
              value={getCode(panel.id)}
              language={panel.language}
              onChange={(code) => setCode(panel.id, code)}
              theme={theme}
              fontSize={fontSize}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

