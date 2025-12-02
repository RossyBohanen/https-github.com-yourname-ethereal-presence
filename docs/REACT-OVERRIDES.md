# React Overrides Documentation

## Why Overrides Were Added

This project experienced runtime issues with React hooks failing because two different versions of React were loaded simultaneously (React 18 and React 19). This occurred because:

1. The root `package.json` specified React 18.2.0
2. Several transitive dependencies (like `@ai-sdk/react`, `ai`, `convex`, `swr`, etc.) required React 19
3. npm installed both versions, causing React's internal version mismatch detection to fail

The `overrides` section in `package.json` forces all dependencies—both direct and transitive—to use React 19.0.0, ensuring only one React instance is loaded at runtime.

## How to Reinstall and Verify

To perform a clean installation and verify that only React 19.0.0 is installed:

```bash
# Remove existing dependencies
rm -rf node_modules package-lock.json

# Install dependencies
npm install

# Verify only React 19.0.0 is installed
npm ls react
```

The `npm ls react` command should show a clean dependency tree with only `react@19.0.0` installed, with no version conflicts or duplicates.

## Expected Output

After running `npm ls react`, you should see output similar to:

```
ethereal-presence@0.0.0 /path/to/project
├── react@19.0.0
└─┬ [dependencies using react]
  └── react@19.0.0 deduped
```

If you see any version mismatches or multiple React versions, the overrides may need to be updated to include additional transitive dependencies.

## Troubleshooting

If you encounter issues:

1. Ensure you're using npm version 8.3.0 or higher (overrides support)
2. Clear npm cache: `npm cache clean --force`
3. Delete `node_modules` and `package-lock.json` and reinstall
4. Check for conflicting package manager lock files (yarn.lock, pnpm-lock.yaml)
