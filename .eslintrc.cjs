module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
  overrides: [
    {
      // These shared UI modules intentionally export helpers alongside components.
      files: [
        'src/@/components/ui/Form.tsx',
        'src/@/components/ui/Button.tsx',
        'src/@/components/ThemeProvider.tsx',
      ],
      rules: {
        'react-refresh/only-export-components': 'off',
      },
    },
    {
      // The upstream bookmark form owns a stable react-hook-form instance whose
      // initialization effect is intentionally run once.
      files: ['src/@/components/BookmarkForm.tsx'],
      rules: {
        'react-hooks/exhaustive-deps': 'off',
      },
    },
  ],
};
