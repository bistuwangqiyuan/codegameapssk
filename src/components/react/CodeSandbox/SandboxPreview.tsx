/**
 * Sandbox Preview Component
 * Displays live preview of HTML/CSS/JS code in a sandboxed iframe
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { IframeManager } from '@/lib/sandbox/iframe-manager';
import { debounce } from '@/lib/utils';

interface ConsoleMessage {
  id: string;
  level: 'log' | 'error' | 'warn' | 'info';
  messages: string[];
  timestamp: Date;
}

export default function SandboxPreview() {
  const { htmlCode, cssCode, jsCode, autoRefresh, refreshDelay } = useEditorStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeManagerRef = useRef<IframeManager | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [showConsole, setShowConsole] = useState(false);

  // Initialize iframe manager
  useEffect(() => {
    if (containerRef.current && !iframeManagerRef.current) {
      const manager = new IframeManager(containerRef.current);
      manager.create();

      // Listen for console messages
      manager.on('console', (data) => {
        setConsoleMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            level: data.level,
            messages: data.data,
            timestamp: new Date(),
          },
        ]);
      });

      iframeManagerRef.current = manager;
    }

    return () => {
      if (iframeManagerRef.current) {
        iframeManagerRef.current.destroy();
        iframeManagerRef.current = null;
      }
    };
  }, []);

  // Execute code
  const executeCode = useCallback(async () => {
    if (!iframeManagerRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      await iframeManagerRef.current.execute(htmlCode, cssCode, jsCode);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [htmlCode, cssCode, jsCode]);

  // Debounced execution
  const debouncedExecute = useCallback(
    debounce(() => {
      executeCode();
    }, refreshDelay),
    [executeCode, refreshDelay]
  );

  // Auto-refresh on code changes
  useEffect(() => {
    if (autoRefresh) {
      debouncedExecute();
    }
  }, [htmlCode, cssCode, jsCode, autoRefresh, debouncedExecute]);

  // Manual refresh
  const handleRefresh = () => {
    executeCode();
  };

  // Clear console
  const clearConsole = () => {
    setConsoleMessages([]);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span className="font-semibold text-gray-200">Preview</span>
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full" />
              <span>Executing...</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            title="Refresh preview"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`p-2 rounded-lg transition-colors ${
              showConsole ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            title="Toggle console"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {consoleMessages.length > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {consoleMessages.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-red-800 font-semibold mb-1">Execution Error</h4>
              <p className="text-red-700 text-sm font-mono">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Preview Iframe Container */}
      <div className="flex-1 relative">
        <div ref={containerRef} className="absolute inset-0" />
      </div>

      {/* Console Panel */}
      {showConsole && (
        <div className="h-48 border-t border-gray-300 bg-gray-900 text-gray-100 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <span className="font-semibold text-sm">Console</span>
            <button
              onClick={clearConsole}
              className="text-xs px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-sm">
            {consoleMessages.length === 0 ? (
              <div className="text-gray-500 text-center py-4">No console messages</div>
            ) : (
              consoleMessages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-2 ${msg.level === 'error' ? 'text-red-400' : msg.level === 'warn' ? 'text-yellow-400' : 'text-gray-300'}`}>
                  <span className="text-gray-500 text-xs">{msg.timestamp.toLocaleTimeString()}</span>
                  <span className="flex-1">{msg.messages.join(' ')}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

