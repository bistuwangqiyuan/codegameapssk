/**
 * Infinite Loop Detector
 * Uses static analysis to detect potential infinite loops
 */

/**
 * Detect potential infinite loops in JavaScript code
 */
export function detectInfiniteLoops(code: string): {
  hasIssue: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Pattern 1: while(true) without break
  const whileTruePattern = /while\s*\(\s*true\s*\)\s*\{[^}]*\}/g;
  const whileTrueMatches = code.match(whileTruePattern);
  if (whileTrueMatches) {
    whileTrueMatches.forEach((match) => {
      if (!match.includes('break') && !match.includes('return')) {
        issues.push('Potential infinite loop: while(true) without break or return');
      }
    });
  }

  // Pattern 2: for loops with no increment
  const forLoopPattern = /for\s*\([^;]*;[^;]*;\s*\)\s*\{/g;
  const forLoopMatches = code.match(forLoopPattern);
  if (forLoopMatches) {
    forLoopMatches.forEach((match) => {
      if (match.includes(';;') || match.match(/for\s*\([^;]*;[^;]*;\s*\)/)) {
        issues.push('Potential infinite loop: for loop with empty increment');
      }
    });
  }

  // Pattern 3: while loops with constant conditions
  const whileConstantPattern = /while\s*\(\s*(1|"[^"]*"|'[^']*')\s*\)/g;
  const whileConstantMatches = code.match(whileConstantPattern);
  if (whileConstantMatches) {
    issues.push('Potential infinite loop: while loop with constant truthy condition');
  }

  // Pattern 4: Recursive functions without base case
  const functionPattern = /function\s+(\w+)\s*\([^)]*\)\s*\{([^}]*)\}/g;
  let funcMatch;
  while ((funcMatch = functionPattern.exec(code)) !== null) {
    const funcName = funcMatch[1];
    const funcBody = funcMatch[2];

    if (funcBody.includes(funcName)) {
      // Has recursion
      if (
        !funcBody.includes('return') &&
        !funcBody.includes('if') &&
        !funcBody.includes('break')
      ) {
        issues.push(
          `Potential infinite recursion: function ${funcName} calls itself without base case`
        );
      }
    }
  }

  // Pattern 5: setInterval without clearInterval
  if (code.includes('setInterval') && !code.includes('clearInterval')) {
    issues.push(
      'Warning: setInterval detected without clearInterval. This may cause memory leaks.'
    );
  }

  return {
    hasIssue: issues.length > 0,
    issues,
  };
}

/**
 * Inject timeout protection into user code
 * Adds a loop counter to prevent long-running loops
 */
export function injectLoopProtection(code: string, maxIterations: number = 100000): string {
  let protected Code = code;

  // Inject counter for while loops
  protectedCode = protectedCode.replace(
    /while\s*\(([^)]+)\)\s*\{/g,
    (match, condition) => {
      return `
        let __loopCounter_${Math.random().toString(36).substr(2, 9)} = 0;
        while (${condition}) {
          if (++__loopCounter_${Math.random().toString(36).substr(2, 9)} > ${maxIterations}) {
            throw new Error('Infinite loop detected: Loop exceeded ${maxIterations} iterations');
          }
      `;
    }
  );

  // Inject counter for for loops
  protectedCode = protectedCode.replace(
    /for\s*\(([^)]+)\)\s*\{/g,
    (match, condition) => {
      const counterId = Math.random().toString(36).substr(2, 9);
      return `
        let __loopCounter_${counterId} = 0;
        for (${condition}) {
          if (++__loopCounter_${counterId} > ${maxIterations}) {
            throw new Error('Infinite loop detected: Loop exceeded ${maxIterations} iterations');
          }
      `;
    }
  );

  return protectedCode;
}

/**
 * Validate code safety before execution
 */
export function validateCodeSafety(code: string): {
  safe: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for dangerous eval usage
  if (code.includes('eval(')) {
    errors.push('eval() is not allowed for security reasons');
  }

  // Check for Function constructor
  if (code.match(/new\s+Function\s*\(/)) {
    errors.push('Function constructor is not allowed for security reasons');
  }

  // Check for setTimeout/setInterval with string argument
  if (code.match(/(setTimeout|setInterval)\s*\(\s*["']/)) {
    errors.push('setTimeout/setInterval with string arguments is not allowed');
  }

  // Detect infinite loops
  const loopDetection = detectInfiniteLoops(code);
  if (loopDetection.hasIssue) {
    warnings.push(...loopDetection.issues);
  }

  // Check for extremely long code (potential DoS)
  if (code.length > 100000) {
    warnings.push('Code is very long (>100KB). This may cause performance issues.');
  }

  return {
    safe: errors.length === 0,
    errors,
    warnings,
  };
}

