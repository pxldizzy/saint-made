import { cookies } from "next/headers";
import { ADMIN_SUBJECT, SESSION_COOKIE, readSession } from "./auth";
import { prisma } from "./prisma";

/** Server-component/route-handler helpers (they need next/headers). */
export async function getSubject() {
  const store = await cookies();
  return readSession(store.get(SESSION_COOKIE)?.value);
}

/** True only for the admin session — used to guard the admin area. */
export async function isAuthenticated() {
  return (await getSubject()) === ADMIN_SUBJECT;
}

/** The signed-in site visitor, if any. */
export async function getCurrentUser() {
  const subject = await getSubject();
  if (!subject || !subject.startsWith("u")) return null;

  return prisma.user.findUnique({
    where: { id: subject.slice(1) },
    select: { id: true, name: true, email: true, phone: true, createdAt: true },
  });
}
