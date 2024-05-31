import globals from "globals";
import stylistic from "@stylistic/eslint-plugin-js";
// import all from "@eslint/js";
// import recommended from "@eslint/js";

// https://eslint.org/blog/2022/08/new-config-system-part-1
// https://eslint.org/blog/2022/08/new-config-system-part-2

export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      stylistic,
    },
    rules: {
      indent:    [
        "error",
        2,
      ],
      "linebreak-style": [
        "error",
        "windows",
      ],
      quotes: [
        "error",
        "double",
      ],
      semi: [
        "error",
        "always",
      ],
      // custom start
      "stylistic/array-bracket-spacing": ["error", "never"],
      "stylistic/comma-dangle": ["error", "always-multiline"],
      "stylistic/no-multi-spaces": "error",
      "stylistic/no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
      "stylistic/no-trailing-spaces": "error",
      "stylistic/nonblock-statement-body-position": ["error", "below"],
      "stylistic/object-curly-spacing": ["error", "always"],
      "stylistic/quote-props": ["error", "as-needed"],
      "prefer-const": "error",
      "prefer-template": "error",
      // custom end
    },
  },
];