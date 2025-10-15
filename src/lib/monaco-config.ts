/**
 * Monaco Editor Configuration
 * Configures Monaco Editor with custom themes and settings
 */

import type * as Monaco from 'monaco-editor';

/**
 * Monaco Editor options
 */
export const monacoOptions: Monaco.editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  lineNumbers: 'on',
  roundedSelection: false,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  wordWrap: 'on',
  formatOnPaste: true,
  formatOnType: true,
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: 'on',
  quickSuggestions: true,
  folding: true,
  lineDecorationsWidth: 10,
  lineNumbersMinChars: 3,
  padding: { top: 10, bottom: 10 },
};

/**
 * Custom Monaco theme matching GameCode Lab design (Tailwind palette)
 */
export const gameCodeTheme: Monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
    { token: 'keyword', foreground: '8B5CF6' }, // Purple-500
    { token: 'string', foreground: '10B981' }, // Green-500
    { token: 'number', foreground: 'F59E0B' }, // Amber-500
    { token: 'type', foreground: '3B82F6' }, // Blue-500
    { token: 'function', foreground: 'EC4899' }, // Pink-500
    { token: 'variable', foreground: 'E5E7EB' }, // Gray-200
    { token: 'tag', foreground: 'EF4444' }, // Red-500
    { token: 'attribute.name', foreground: '14B8A6' }, // Teal-500
    { token: 'attribute.value', foreground: '10B981' }, // Green-500
  ],
  colors: {
    'editor.background': '#1F2937', // Gray-800
    'editor.foreground': '#F3F4F6', // Gray-100
    'editor.lineHighlightBackground': '#374151', // Gray-700
    'editor.selectionBackground': '#4B5563', // Gray-600
    'editor.inactiveSelectionBackground': '#374151', // Gray-700
    'editorCursor.foreground': '#8B5CF6', // Purple-500
    'editorLineNumber.foreground': '#6B7280', // Gray-500
    'editorLineNumber.activeForeground': '#D1D5DB', // Gray-300
    'editorWidget.background': '#111827', // Gray-900
    'editorWidget.border': '#4B5563', // Gray-600
    'editorSuggestWidget.background': '#111827', // Gray-900
    'editorSuggestWidget.border': '#4B5563', // Gray-600
    'editorSuggestWidget.selectedBackground': '#374151', // Gray-700
  },
};

/**
 * Light theme variant
 */
export const gameCodeLightTheme: Monaco.editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
    { token: 'keyword', foreground: '7C3AED' }, // Purple-600
    { token: 'string', foreground: '059669' }, // Green-600
    { token: 'number', foreground: 'D97706' }, // Amber-600
    { token: 'type', foreground: '2563EB' }, // Blue-600
    { token: 'function', foreground: 'DB2777' }, // Pink-600
    { token: 'variable', foreground: '1F2937' }, // Gray-800
    { token: 'tag', foreground: 'DC2626' }, // Red-600
    { token: 'attribute.name', foreground: '0D9488' }, // Teal-600
    { token: 'attribute.value', foreground: '059669' }, // Green-600
  ],
  colors: {
    'editor.background': '#FFFFFF',
    'editor.foreground': '#1F2937', // Gray-800
    'editor.lineHighlightBackground': '#F9FAFB', // Gray-50
    'editor.selectionBackground': '#DBEAFE', // Blue-100
    'editorCursor.foreground': '#7C3AED', // Purple-600
    'editorLineNumber.foreground': '#9CA3AF', // Gray-400
    'editorLineNumber.activeForeground': '#4B5563', // Gray-600
  },
};

/**
 * Language-specific configurations
 */
export const languageConfig = {
  html: {
    language: 'html',
    autoClosingPairs: [
      { open: '<', close: '>' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
  },
  css: {
    language: 'css',
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
  },
  javascript: {
    language: 'javascript',
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: '`', close: '`' },
    ],
  },
};

/**
 * Initialize Monaco Editor (called once on app startup)
 */
export function initMonaco(monaco: typeof Monaco) {
  // Define custom themes
  monaco.editor.defineTheme('gamecode-dark', gameCodeTheme);
  monaco.editor.defineTheme('gamecode-light', gameCodeLightTheme);

  // Set default theme
  monaco.editor.setTheme('gamecode-dark');

  // Configure HTML language
  monaco.languages.html.htmlDefaults.setOptions({
    format: {
      tabSize: 2,
      insertSpaces: true,
      wrapLineLength: 120,
      wrapAttributes: 'auto',
      endWithNewline: true,
    },
  });

  // Configure CSS language
  monaco.languages.css.cssDefaults.setOptions({
    validate: true,
    lint: {
      unknownProperties: 'warning',
      unknownAtRules: 'warning',
      duplicateProperties: 'warning',
      emptyRules: 'warning',
      importStatement: 'warning',
      zeroUnits: 'warning',
    },
  });

  // Configure JavaScript/TypeScript language
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ES2015,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    allowJs: true,
    typeRoots: ['node_modules/@types'],
  });

  // Add DOM type definitions
  monaco.languages.typescript.javascriptDefaults.addExtraLib(
    `
    declare interface Window extends EventTarget {
      document: Document;
      console: Console;
      alert: (message: string) => void;
      prompt: (message: string) => string | null;
      confirm: (message: string) => boolean;
    }
    declare const window: Window;
    declare const document: Document;
    declare const console: Console;
    `,
    'ts:dom.d.ts'
  );
}

