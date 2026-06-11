```markdown
# SALIS-GMS Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill provides guidance on the development patterns used in the SALIS-GMS repository, a TypeScript codebase with no detected framework. You'll learn about file naming, import/export conventions, commit message style, and how to write and organize tests. This skill is ideal for developers contributing to or maintaining SALIS-GMS, ensuring consistency and best practices throughout the codebase.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names.
  - **Example:**  
    ```
    userProfile.ts
    getDataFromApi.ts
    ```

### Import Style
- Use **relative imports** for referencing modules within the project.
  - **Example:**  
    ```typescript
    import { getUser } from './userService';
    import { calculateTotal } from '../utils/math';
    ```

### Export Style
- Use **named exports** for all modules.
  - **Example:**  
    ```typescript
    // In userService.ts
    export function getUser(id: string) { ... }
    export const USER_ROLE = 'admin';
    ```

    ```typescript
    // In another file
    import { getUser, USER_ROLE } from './userService';
    ```

### Commit Message Style
- Commit messages are **freeform** (no strict prefix), averaging 53 characters.
  - **Example:**  
    ```
    Fix bug in user authentication flow
    Add support for batch data import
    ```

## Workflows

_No automated workflows detected in the repository._

## Testing Patterns

- **Test Framework:** Not explicitly detected.
- **Test File Pattern:** All test files follow the `*.test.*` naming convention.
  - **Example:**  
    ```
    userService.test.ts
    dataProcessor.test.ts
    ```
- **Test Placement:** Tests are typically placed alongside the code they test or in a dedicated test directory.
- **Test Example:**  
  ```typescript
  // userService.test.ts
  import { getUser } from './userService';

  describe('getUser', () => {
    it('returns user data for a valid ID', () => {
      const user = getUser('123');
      expect(user).toBeDefined();
    });
  });
  ```

## Commands
| Command | Purpose |
|---------|---------|
| /test   | Run all test files matching `*.test.*` |
| /lint   | Lint the codebase for style and errors |
| /build  | Compile the TypeScript codebase |
```