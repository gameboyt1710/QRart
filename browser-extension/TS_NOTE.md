# Extension TypeScript Note

The extension has three separate entry points (contentScript.ts, options.ts, background.ts) that Vite builds independently. TypeScript may show "duplicate function" warnings because it sees all files together, but this is a false positive - each file is bundled separately and there are no actual duplicates at runtime.

To verify there are no real errors, run:
```bash
npm run build
```

If the build succeeds, the code is correct despite any IDE warnings.
