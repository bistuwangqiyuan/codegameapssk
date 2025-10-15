/**
 * Sandbox Iframe Manager
 * Manages iframe creation, destruction, and sandboxed code execution
 */

import { sandboxCSP } from './csp';

export interface IframeMessage {
  type: 'execute' | 'result' | 'error' | 'console';
  data: any;
}

export class IframeManager {
  private iframe: HTMLIFrameElement | null = null;
  private container: HTMLElement | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private executionTimeout: number = 10000; // 10 seconds

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Create a new sandboxed iframe
   */
  create(): void {
    this.destroy(); // Clean up any existing iframe

    if (!this.container) return;

    // Create iframe element
    this.iframe = document.createElement('iframe');
    this.iframe.style.width = '100%';
    this.iframe.style.height = '100%';
    this.iframe.style.border = 'none';
    this.iframe.style.display = 'block';

    // Apply sandbox restrictions
    this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');

    // Set CSP via meta tag in srcdoc
    this.iframe.srcdoc = this.getInitialHTML();

    // Setup message listener
    window.addEventListener('message', this.handleMessage);

    this.container.appendChild(this.iframe);
  }

  /**
   * Initial HTML with CSP and error handling
   */
  private getInitialHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Security-Policy" content="${sandboxCSP}">
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: #fff;
            }
            .error-message {
              background: #fee;
              border: 1px solid #fcc;
              border-radius: 8px;
              padding: 16px;
              margin: 16px 0;
              color: #c33;
            }
            .error-message h3 {
              margin: 0 0 8px 0;
              font-size: 16px;
            }
            .error-message pre {
              margin: 0;
              font-family: 'Courier New', monospace;
              font-size: 13px;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
          </style>
        </head>
        <body>
          <div id="app"></div>
          <script>
            // Override console methods to send to parent
            const originalConsole = {
              log: console.log,
              error: console.error,
              warn: console.warn,
              info: console.info,
            };

            console.log = (...args) => {
              originalConsole.log(...args);
              window.parent.postMessage({
                type: 'console',
                level: 'log',
                data: args.map(String)
              }, '*');
            };

            console.error = (...args) => {
              originalConsole.error(...args);
              window.parent.postMessage({
                type: 'console',
                level: 'error',
                data: args.map(String)
              }, '*');
            };

            console.warn = (...args) => {
              originalConsole.warn(...args);
              window.parent.postMessage({
                type: 'console',
                level: 'warn',
                data: args.map(String)
              }, '*');
            };

            // Global error handler
            window.addEventListener('error', (event) => {
              const errorDiv = document.createElement('div');
              errorDiv.className = 'error-message';
              errorDiv.innerHTML = \`
                <h3>⚠️ JavaScript Error</h3>
                <pre>\${event.message}\\n at \${event.filename}:\${event.lineno}:\${event.colno}</pre>
              \`;
              document.body.insertBefore(errorDiv, document.body.firstChild);

              window.parent.postMessage({
                type: 'error',
                data: {
                  message: event.message,
                  filename: event.filename,
                  lineno: event.lineno,
                  colno: event.colno,
                }
              }, '*');

              event.preventDefault();
            });

            // Listen for code execution messages
            window.addEventListener('message', (event) => {
              if (event.data.type === 'execute') {
                try {
                  // Clear previous content
                  const appDiv = document.getElementById('app');
                  if (appDiv) {
                    appDiv.innerHTML = '';
                  }
                  
                  // Remove previous error messages
                  document.querySelectorAll('.error-message').forEach(el => el.remove());

                  const { html, css, js } = event.data.code;

                  // Inject HTML
                  if (appDiv && html) {
                    appDiv.innerHTML = html;
                  }

                  // Inject CSS
                  const styleEl = document.getElementById('custom-style') || document.createElement('style');
                  styleEl.id = 'custom-style';
                  styleEl.textContent = css || '';
                  if (!document.getElementById('custom-style')) {
                    document.head.appendChild(styleEl);
                  }

                  // Execute JavaScript with timeout
                  if (js) {
                    const timeoutId = setTimeout(() => {
                      throw new Error('Script execution timeout (10 seconds)');
                    }, 10000);

                    try {
                      new Function(js)();
                      clearTimeout(timeoutId);
                    } catch (err) {
                      clearTimeout(timeoutId);
                      throw err;
                    }
                  }

                  window.parent.postMessage({ type: 'result', success: true }, '*');
                } catch (err) {
                  window.parent.postMessage({
                    type: 'error',
                    data: { message: err.message, stack: err.stack }
                  }, '*');
                }
              }
            });
          </script>
        </body>
      </html>
    `;
  }

  /**
   * Execute code in the sandbox
   */
  execute(html: string, css: string, js: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.iframe) {
        reject(new Error('Iframe not initialized'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Execution timeout'));
      }, this.executionTimeout);

      const resultHandler = (data: any) => {
        clearTimeout(timeout);
        this.messageHandlers.delete('result');
        this.messageHandlers.delete('error');
        resolve();
      };

      const errorHandler = (data: any) => {
        clearTimeout(timeout);
        this.messageHandlers.delete('result');
        this.messageHandlers.delete('error');
        reject(new Error(data.message));
      };

      this.messageHandlers.set('result', resultHandler);
      this.messageHandlers.set('error', errorHandler);

      this.postMessage({
        type: 'execute',
        code: { html, css, js },
      });
    });
  }

  /**
   * Post message to iframe
   */
  private postMessage(message: IframeMessage): void {
    if (this.iframe && this.iframe.contentWindow) {
      this.iframe.contentWindow.postMessage(message, '*');
    }
  }

  /**
   * Handle messages from iframe
   */
  private handleMessage = (event: MessageEvent): void => {
    if (!this.iframe || event.source !== this.iframe.contentWindow) return;

    const { type, data } = event.data;
    const handler = this.messageHandlers.get(type);

    if (handler) {
      handler(data);
    }

    // Also emit console messages (for external logging)
    if (type === 'console' && this.messageHandlers.has('console')) {
      this.messageHandlers.get('console')!(data);
    }
  };

  /**
   * Register a message handler
   */
  on(type: string, handler: (data: any) => void): void {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Remove a message handler
   */
  off(type: string): void {
    this.messageHandlers.delete(type);
  }

  /**
   * Destroy the iframe
   */
  destroy(): void {
    if (this.iframe) {
      window.removeEventListener('message', this.handleMessage);
      this.iframe.remove();
      this.iframe = null;
    }
    this.messageHandlers.clear();
  }
}

