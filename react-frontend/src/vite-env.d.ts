/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for the PHP API (default "/api"). */
  readonly VITE_API_URL?: string;
  /** When "true", public catalogue reads use the bundled JSON snapshot
   *  instead of the PHP API. Admin + forms always use the API. Default "true". */
  readonly VITE_USE_STATIC_DATA?: string;
  /** Public site config (mirrors the former NEXT_PUBLIC_* variables). */
  readonly VITE_SITE_NAME?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_CONTACT_PHONE?: string;
  readonly VITE_SHOP_ADDRESS?: string;
  readonly VITE_WHATSAPP_NUMBER?: string;
  /** When "true", build for double-clickable file:// use (HashRouter + base "./"). */
  readonly VITE_OFFLINE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
