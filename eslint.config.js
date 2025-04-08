/* eslint-disable @typescript-eslint/no-require-imports */
const { defineConfig } = require("eslint/config");
const globals = require("globals");
const tseslint = require("@typescript-eslint/eslint-plugin");
const parser = require("@typescript-eslint/parser");
const pluginSecurity = require("eslint-plugin-security");

module.exports = defineConfig([
    pluginSecurity.configs.recommended,
    {
        ignores: [
            "build/**/*",
            "dist/**/*",
            "coverage/**/*",
            "node_modules/**/*",
            "src/infrastructure/lambda/**/*",
        ],
        files: ["**/*.{js,ts}"],
        languageOptions: {
            parser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: "module",
            },
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
        },
    },
]);
