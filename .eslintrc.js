module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended", 
    "prettier", 
  ],
  plugins: [
      "@typescript-eslint"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    project: "./tsconfig.json" ,
    ecmaFeatures: {
      jsx: true,
    },
  },
  ignorePatterns: [
    "/.eslintrc.js"
  ],
  rules: {}
}