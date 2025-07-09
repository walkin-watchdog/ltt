/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ADMIN_URL: string;
  readonly VITE_GA_TRACKING_ID: string;
  readonly VITE_TRIPADS_API_KEY: string;
  readonly VITE_GOOGLE_REVIEWS_PLACE_ID: string;
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_WP_API_URL: string;
  readonly VITE_WP_USER: string;
  readonly VITE_WP_APP_PASSWORD: string;
  readonly VITE_PROD: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}