export {};

declare global {
  interface Window {
    electron: {
      checkDocker:  () => Promise<boolean>;
      pickFolder:   () => Promise<string | null>;
      install:      (config: unknown) => Promise<void>;
      openExternal: (url: string) => void;
    };
  }
}
