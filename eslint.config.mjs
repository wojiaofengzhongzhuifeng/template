import antfu from '@antfu/eslint-config';
import nextPlugin from '@next/eslint-plugin-next';
import eslintConfigPrettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import perfectionist from 'eslint-plugin-perfectionist';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
// import tailwind from 'eslint-plugin-tailwindcss';
import unusedImports from 'eslint-plugin-unused-imports';

export default antfu(
    {
        isInEditor: false,
        react: {
            overrides: {
                'react/no-comment-textnodes': 'off',
            },
        },
        typescript: true,
        stylistic: false,
        markdown: false,
        toml: false,
        ignores: [
            'public',
            'node_modules',
            'build',
            '.history',
            '.next',
            'public',
            'pnpm-lock.yaml',
            'package-lock.json',
            'next-env.d.ts',
            'src/database/generated',
            '**/hooks/**',
            '**/_hooks/**',
            '**/api/**',
        ],
    },
    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
        },
        rules: {
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'Identifier[name="useEffect"]',
                    message:
                        '禁止在组件中直接使用 useEffect。请将相关逻辑封装到自定义 hooks 中（如 src/app/(pages)/your-feature/hooks/useXxx.ts），以保持代码整洁和可复用。',
                },
            ],
        },
    },
    // ...tailwind.configs['flat/recommended'],
    jsxA11y.flatConfigs.recommended,
    {
        plugins: {
            '@next/next': nextPlugin,
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs['core-web-vitals'].rules,
        },
    },
    {
        name: 'perfectionist',
        rules: {
            'import/order': 'off',
            'sort-imports': 'off',
            'perfectionist/sort-imports':
                perfectionist.configs['recommended-natural'].rules['perfectionist/sort-imports'],
            'perfectionist/sort-exports':
                perfectionist.configs['recommended-natural'].rules['perfectionist/sort-exports'],
            'perfectionist/sort-named-imports':
                perfectionist.configs['recommended-natural'].rules[
                    'perfectionist/sort-named-imports'
                ],
            'perfectionist/sort-named-exports':
                perfectionist.configs['recommended-natural'].rules[
                    'perfectionist/sort-named-exports'
                ],
        },
    },
    {
        plugins: {
            'unused-imports': unusedImports,
        },
        rules: {
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],
        },
    },
    eslintConfigPrettier,
    eslintPluginPrettierRecommended,
);
