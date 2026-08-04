"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SUBJECT,
  SESSION_COOKIE,
  checkCredentials,
  createSessionValue,
  sessionCookieOptions,
  userSubject,
} from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export type FormState = { error: string };

const str = (data: FormData, key: string, max = 200) =>
  String(data.get(key) ?? "")
    .trim()
    .slice(0, max);

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Same-site paths only — never redirect to a URL supplied by the query. */
const safeNext = (value: string, fallback: string) =>
  /^\/(?!\/)/.test(value) ? value : fallback;

async function startSession(subject: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionValue(subject), sessionCookieOptions);
}

/**
 * A server action (not fetch) so the form also works before hydration and
 * with JS disabled — a native GET submit would leak the password into the URL.
 *
 * The admin credentials from .env open the admin panel; anything else is
 * matched against the site accounts created via registration.
 */
export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const login = str(formData, "login");
  const password = String(formData.get("password") ?? "");
  const next = str(formData, "next", 300);

  if (!login || !password) return { error: "Заполните оба поля" };

  if (checkCredentials(login, password)) {
    await startSession(ADMIN_SUBJECT);
    redirect(safeNext(next, "/admin"));
  }

  const user = await prisma.user.findUnique({
    where: { email: login.toLowerCase() },
  });

  if (user && (await verifyPassword(password, user.passwordHash))) {
    await startSession(userSubject(user.id));
    redirect(safeNext(next, "/account"));
  }

  // Slow failures down a little so the form is not a fast oracle.
  await new Promise((r) => setTimeout(r, 400));
  return { error: "Неверный логин или пароль" };
}

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = str(formData, "name", 120);
  const email = str(formData, "email", 160).toLowerCase();
  const phone = str(formData, "phone", 40);
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (name.length < 2) return { error: "Укажите имя" };
  if (!EMAIL_RE.test(email)) return { error: "Некорректный e-mail" };
  if (phone.replace(/\D/g, "").length < 10) return { error: "Укажите телефон" };
  if (password.length < 8) return { error: "Пароль — минимум 8 символов" };
  if (password !== confirm) return { error: "Пароли не совпадают" };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Такой e-mail уже зарегистрирован" };

  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash: await hashPassword(password) },
  });

  await startSession(userSubject(user.id));
  redirect("/account");
}
