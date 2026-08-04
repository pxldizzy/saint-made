/**
 * Session signing with Web Crypto so the same code runs in the proxy,
 * route handlers and server components.
 *
 * Cookie value: `<expires>.<subject>.<hmac>` where subject is either
 * "admin" or "u<userId>".
 */
export const SESSION_COOKIE = "sm_session";
const MAX_AGE_SECONDS = 60 * 60 * 8;

const encoder = new TextEncoder();

function secret() {
  return process.env.SESSION_SECRET ?? "dev-secret-change-me";
}

async function sign(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return [...new Uint8Array(signature)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time compare that tolerates different lengths. */
export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function checkCredentials(login: string, password: string) {
  const expectedLogin = process.env.ADMIN_LOGIN ?? "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "saintmade";
  // Both comparisons always run so timing does not reveal which one failed.
  const okLogin = safeEqual(login, expectedLogin);
  const okPassword = safeEqual(password, expectedPassword);
  return okLogin && okPassword;
}

export const ADMIN_SUBJECT = "admin";
export const userSubject = (id: string) => `u${id}`;

export async function createSessionValue(subject: string) {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${expires}.${subject}`;
  return `${payload}.${await sign(payload)}`;
}

/** Returns the session subject, or null if missing, tampered with or expired. */
export async function readSession(value: string | undefined) {
  if (!value) return null;
  const [expires, subject, mac] = value.split(".");
  if (!expires || !subject || !mac) return null;
  if (!safeEqual(mac, await sign(`${expires}.${subject}`))) return null;
  if (!(Number(expires) > Date.now())) return null;
  return subject;
}

export async function isValidSession(value: string | undefined) {
  return (await readSession(value)) !== null;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
