/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Thêm các biến khác nếu có, ví dụ:
  // readonly VITE_GEMINI_API_KEY: string;
  // readonly VITE_APP_NAME: string;
  // ... (tất cả biến bắt đầu bằng VITE_)
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}