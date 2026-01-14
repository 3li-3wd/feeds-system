import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
        plugins: {
            react,
        },
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            "react/react-in-jsx-scope": "off",
            "no-unused-vars": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
            "no-console": "off",
        },
    },
);
