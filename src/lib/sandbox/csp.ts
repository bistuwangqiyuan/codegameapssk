/**
 * Content Security Policy for Code Sandbox
 * Constitution Requirement: Sandboxes MUST enforce CSP policies
 */

export const SANDBOX_CSP = {
  'default-src': ["'none'"],
  'script-src': ["'unsafe-inline'", "'unsafe-eval'"], // Required for user code execution
  'style-src': ["'unsafe-inline'", 'data:'],
  'img-src': ['data:', 'blob:', 'https:'],
  'font-src': ['data:'],
  'connect-src': ["'none'"], // Block network requests
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'none'"],
};

export function generateCSPString(): string {
  return Object.entries(SANDBOX_CSP)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

export const SANDBOX_PERMISSIONS = [
  'allow-scripts', // Allow JavaScript execution
  // Explicitly NOT including:
  // - allow-same-origin (prevents accessing parent)
  // - allow-forms (prevents form submission)
  // - allow-popups (prevents popups)
  // - allow-modals (prevents alerts/confirms)
];

export function generateSandboxAttributes(): string {
  return SANDBOX_PERMISSIONS.join(' ');
}

