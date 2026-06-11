```markdown
# SALIS-GMS Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the SALIS-GMS TypeScript codebase. You'll learn about file naming, import/export styles, commit message formatting, and how to write and organize tests. This guide also provides suggested commands for common workflows to streamline your development process.

## Coding Conventions

### File Naming
- **Style:** kebab-case
- **Example:**  
  - `user-service.ts`
  - `data-manager.test.ts`

### Import Style
- **Relative imports** are used throughout the codebase.
- **Example:**
  ```typescript
  import { fetchData } from './utils/fetch-data';
  ```

### Export Style
- **Named exports** are preferred.
- **Example:**
  ```typescript
  // In user-service.ts
  export function getUser(id: string) { ... }
  export const USER_ROLE = 'admin';
  ```

### Commit Messages
- **Conventional commits** are used, with the prefix `feat` for new features.
- **Average commit message length:** 54 characters
- **Example:**
  ```
  feat: add user authentication middleware
  ```

## Workflows

### Creating a New Feature
**Trigger:** When adding a new feature to the codebase  
**Command:** `/new-feature`

1. Create a new file using kebab-case naming.
2. Write your feature code using named exports.
3. Use relative imports for any dependencies.
4. Add or update corresponding test files (`*.test.ts`).
5. Commit your changes using the `feat` prefix and a clear description.

### Writing and Running Tests
**Trigger:** When verifying code functionality  
**Command:** `/run-tests`

1. Write tests in files matching the `*.test.*` pattern (e.g., `user-service.test.ts`).
2. Use the project's preferred (unknown) testing framework.
3. Run the tests using the appropriate command for the framework.

## Testing Patterns

- **Test file naming:** Use the `*.test.*` pattern, e.g., `data-manager.test.ts`.
- **Framework:** Not explicitly detected; follow project or team standards.
- **Example:**
  ```typescript
  // data-manager.test.ts
  import { fetchData } from './fetch-data';

  describe('fetchData', () => {
    it('should return data for valid input', () => {
      // test implementation
    });
  });
  ```

## Commands
| Command        | Purpose                                      |
|----------------|----------------------------------------------|
| /new-feature   | Scaffold and commit a new feature            |
| /run-tests     | Run all test files matching *.test.* pattern |
```
