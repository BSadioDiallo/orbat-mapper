// Vite's `import.meta.env.DEV`, read by shared code (tactical-draw probes). angular.json defines
// it at build time.
interface ImportMetaEnv {
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
