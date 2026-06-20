// Global test setup. Loaded for every test file (see vitest.config.ts).
// Adds jest-dom matchers (toBeInTheDocument, toHaveAttribute, ...).
//
// CONVENTION: tests run in the `node` environment by default. Any client test
// that renders React / touches the DOM must opt into jsdom by adding this
// docblock as the FIRST line of the file:
//
//   // @vitest-environment jsdom
//
import '@testing-library/jest-dom';
