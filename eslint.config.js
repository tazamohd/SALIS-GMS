import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "*.config.js",
      "*.config.ts",
      "scripts/**",
      "drizzle.config.ts",
      "vite.config.ts",
      "postcss.config.js",
      "tailwind.config.ts",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-namespace": "warn",
      "@typescript-eslint/prefer-as-const": "warn",
      "no-console": "off",
      "prefer-const": "warn",
      "no-undef": "off",
      "no-case-declarations": "warn",
      "no-useless-assignment": "warn",
      "no-empty": "warn",
    },
  },
);
