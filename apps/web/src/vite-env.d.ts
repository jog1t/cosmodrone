/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly RIVET_PUBLIC_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
