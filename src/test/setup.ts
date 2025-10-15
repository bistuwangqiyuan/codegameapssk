import { beforeAll, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';

// Setup global test environment
beforeAll(() => {
  // Setup any global test configuration
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Teardown after all tests
afterAll(() => {
  // Cleanup any global resources
});

