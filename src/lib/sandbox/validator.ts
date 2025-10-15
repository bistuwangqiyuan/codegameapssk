/**
 * Code Sandbox Security Validator
 * Constitution Requirement: All user code MUST be validated before execution
 */

export interface ValidationResult {
  safe: boolean;
  errors: string[];
  warnings: string[];
}

const DANGEROUS_PATTERNS = [
  // XSS attempts
  /<script[^>]*>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi, // Inline event handlers in HTML strings
  
  // Dangerous DOM manipulation
  /document\.write/gi,
  /eval\s*\(/gi,
  /Function\s*\(/gi,
  
  // Network requests
  /fetch\s*\(/gi,
  /XMLHttpRequest/gi,
  /\.ajax\s*\(/gi,
  
  // Storage access
  /localStorage/gi,
  /sessionStorage/gi,
  /indexedDB/gi,
  
  // Window manipulation
  /window\.opener/gi,
  /window\.parent/gi,
  /window\.top/gi,
];

const WARNING_PATTERNS = [
  // Potentially infinite loops (simple detection)
  /while\s*\(\s*true\s*\)/gi,
  /for\s*\(\s*;\s*;\s*\)/gi,
];

export function validateCode(code: string, language: 'html' | 'css' | 'javascript'): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!code || code.trim() === '') {
    return { safe: true, errors, warnings };
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(code)) {
      errors.push(
        `Potentially unsafe code detected. For security reasons, features like ${pattern.source} are not allowed in the sandbox.`
      );
    }
  }

  // Check for warning patterns
  for (const pattern of WARNING_PATTERNS) {
    if (pattern.test(code)) {
      warnings.push(
        `Your code contains a pattern that might cause infinite loops: ${pattern.source}. Make sure your loops have proper exit conditions.`
      );
    }
  }

  // Language-specific validation
  if (language === 'javascript') {
    // Check for excessive code length (potential DOS)
    if (code.length > 50000) {
      errors.push('Code is too long. Please keep your code under 50,000 characters.');
    }
  }

  return {
    safe: errors.length === 0,
    errors,
    warnings,
  };
}

export function sanitizeHTML(html: string): string {
  // Remove potentially dangerous attributes and tags
  let sanitized = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');

  return sanitized;
}

