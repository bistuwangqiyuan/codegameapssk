/**
 * Monaco Editor Wrapper Component
 * Lazy-loaded Monaco Editor with custom configuration
 */

import { useEffect, useRef, useState } from 'react';
import type * as Monaco from 'monaco-editor';
import { initMonaco, monacoOptions } from '@/lib/monaco-config';

interface MonacoEditorProps {
  value: string;
  language: 'html' | 'css' | 'javascript';
  onChange?: (value: string) => void;
  theme?: 'gamecode-dark' | 'gamecode-light';
  fontSize?: number;
  readOnly?: boolean;
  height?: string;
}

export default function MonacoEditor({
  value,
  language,
  onChange,
  theme = 'gamecode-dark',
  fontSize = 14,
  readOnly = false,
  height = '100%',
}: MonacoEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Monaco Editor
  useEffect(() => {
    let mounted = true;

    const initEditor = async () => {
      try {
        if (!containerRef.current) return;

        // Lazy load Monaco Editor
        const monaco = await import('monaco-editor');
        monacoRef.current = monaco;

        // Initialize Monaco with custom config
        initMonaco(monaco);

        if (!mounted) return;

        // Create editor instance
        const editor = monaco.editor.create(containerRef.current, {
          ...monacoOptions,
          value,
          language,
          theme,
          fontSize,
          readOnly,
        });

        editorRef.current = editor;

        // Listen for changes
        editor.onDidChangeModelContent(() => {
          if (onChange) {
            onChange(editor.getValue());
          }
        });

        setIsLoading(false);
      } catch (err: any) {
        console.error('Failed to initialize Monaco Editor:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    initEditor();

    return () => {
      mounted = false;
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []); // Only run once on mount

  // Update value when prop changes
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  // Update theme
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme);
    }
  }, [theme]);

  // Update language
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  // Update font size
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize });
    }
  }, [fontSize]);

  // Update read-only
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly });
    }
  }, [readOnly]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-red-400 p-8">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg font-semibold mb-2">Editor Failed to Load</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-300">Loading Editor...</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

