module.exports = {
  root: true,
  env: {
    node: true,
    'vue/setup-compiler-macros': true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
  ],
  plugins: ['@typescript-eslint'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/script-setup-uses-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    "semi": ["error", "never"],
    "object-curly-spacing": ["error", "always"],
    "indent": ["error", 2],
  },
  ignorePatterns: ['dist', 'node_modules'],
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@', './src'],
          ['@components', './src/components'],
          ['@composables', './src/composables'],
          ['@views', './src/views'],
          ['@utils', './src/utils'],
        ],
        extensions: ['.ts', '.tsx', '.d.ts', '.vue'],
      },
    },
  },
}
