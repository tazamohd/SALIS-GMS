import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Provide a minimal DOM environment for tests that need it
if (typeof window !== 'undefined') {
  // MatchMedia polyfill (used by some components)
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}