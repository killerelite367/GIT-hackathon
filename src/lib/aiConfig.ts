/**
 * Config for the AI document scanner.
 *
 * Two ways to run a scan:
 *   - "direct"  → the browser calls the Gemini API itself. Zero backend, works
 *                 on Vercel, but the key ships inside the JS bundle.
 *   - "webhook" → the browser POSTs the image to an n8n webhook, which holds
 *                 the key server-side and calls Gemini. Nothing secret in the
 *                 bundle. Use this if the site is public.
 *
 * The key is read from (highest priority first):
 *   1. whatever the user typed into Settings (localStorage, never committed)
 *   2. VITE_GEMINI_API_KEY at build time (.env, gitignored)
 */

const KEY_STORAGE = "studyquest.ai.key";
const HOOK_STORAGE = "studyquest.ai.webhook";
const MODE_STORAGE = "studyquest.ai.mode";

export type ScanMode = "direct" | "webhook";

/** Gemini model used for scanning. 2.5-flash is fast, cheap, and reads
 *  photographed documents well. (2.0-flash has no free-tier quota left.) */
export const GEMINI_MODEL = "gemini-2.5-flash";

const envKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim() ?? "";
const envHook = (import.meta.env.VITE_SCAN_WEBHOOK_URL as string | undefined)?.trim() ?? "";

function read(k: string): string {
  try {
    return localStorage.getItem(k)?.trim() ?? "";
  } catch {
    return "";
  }
}

function write(k: string, v: string) {
  try {
    if (v.trim()) localStorage.setItem(k, v.trim());
    else localStorage.removeItem(k);
  } catch {
    /* private mode — ignore */
  }
}

export function getApiKey(): string {
  return read(KEY_STORAGE) || envKey;
}

export function setApiKey(v: string) {
  write(KEY_STORAGE, v);
}

/** True when the key came from Settings rather than the build. */
export function isUserKey(): boolean {
  return read(KEY_STORAGE).length > 0;
}

export function getWebhookUrl(): string {
  return read(HOOK_STORAGE) || envHook;
}

export function setWebhookUrl(v: string) {
  write(HOOK_STORAGE, v);
}

export function getMode(): ScanMode {
  const m = read(MODE_STORAGE);
  if (m === "direct" || m === "webhook") return m;
  // Default to whichever is actually configured, preferring the webhook since
  // it keeps the key off the client.
  return getWebhookUrl() ? "webhook" : "direct";
}

export function setMode(m: ScanMode) {
  write(MODE_STORAGE, m);
}

/** Can we actually run a scan right now? */
export function isScanConfigured(): boolean {
  return getMode() === "webhook" ? !!getWebhookUrl() : !!getApiKey();
}

/** Masked key for display, e.g. "AQ.Ab8R…BfiQ". Never render the full key. */
export function maskKey(k: string): string {
  if (!k) return "";
  if (k.length <= 12) return "•".repeat(k.length);
  return `${k.slice(0, 6)}…${k.slice(-4)}`;
}
