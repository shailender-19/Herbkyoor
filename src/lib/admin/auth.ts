import { cookies } from "next/headers";

/**
 * Minimal, temporary admin authentication for the `/admin` panel.
 *
 * Credentials are read exclusively from the environment (`.env.local`):
 *   ADMIN_USERNAME="youruser"
 *   ADMIN_PASSWORD="yourpassword"
 *
 * There is no hardcoded fallback — if either variable is unset, login is
 * refused. This is NOT a production-grade auth system; it exists to gate
 * catalogue editing behind a shared login. Replace with a real provider
 * before going live.
 */

const USERNAME = process.env.ADMIN_USERNAME;
const PASSWORD = process.env.ADMIN_PASSWORD;

export const SESSION_COOKIE = "admin_session";

/** Opaque session token derived from the configured credentials. */
function sessionToken(): string {
  return Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64url");
}

export function verifyCredentials(
  username: unknown,
  password: unknown,
): boolean {
  if (!USERNAME || !PASSWORD) {
    console.warn(
      "[admin] ADMIN_USERNAME / ADMIN_PASSWORD are not set — admin login is disabled.",
    );
    return false;
  }
  return (
    typeof username === "string" &&
    typeof password === "string" &&
    username === USERNAME &&
    password === PASSWORD
  );
}

/** Write the session cookie after a successful login. */
export async function startSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** True when the incoming request carries a valid admin session cookie. */
export async function isAuthenticated(): Promise<boolean> {
  if (!USERNAME || !PASSWORD) return false;
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value === sessionToken();
}
