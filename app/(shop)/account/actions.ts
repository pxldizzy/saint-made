"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth-server";
import { hashPassword, verifyPassword } from "@/lib/password";
import { normalizePhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";

export type AccountState = { error: string; ok?: string };

const str = (data: FormData, key: string, max = 200) =>
  String(data.get(key) ?? "")
    .trim()
    .slice(0, max);

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Не авторизовано");
  return user;
}

export async function updateProfile(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const user = await requireUser();

  const name = str(formData, "name", 120);
  const emailRaw = str(formData, "email", 160).toLowerCase();
  const phoneRaw = str(formData, "phone", 40);

  if (name.length < 2) return { error: "Укажите имя" };

  const hasPhoneInput = phoneRaw.replace(/\D/g, "").length > 1;
  if (!emailRaw && !hasPhoneInput) {
    return { error: "Оставьте e-mail или телефон — по нему вы входите" };
  }
  if (emailRaw && !EMAIL_RE.test(emailRaw)) {
    return { error: "Некорректный e-mail" };
  }

  const phone = hasPhoneInput ? normalizePhone(phoneRaw) : null;
  if (hasPhoneInput && !phone) {
    return { error: "Телефон в формате +7 900 000-00-00" };
  }

  const email = emailRaw || null;

  const taken = await prisma.user.findFirst({
    where: {
      id: { not: user.id },
      OR: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
    },
  });
  if (taken) {
    return {
      error:
        taken.email === email
          ? "Этот e-mail уже занят"
          : "Этот телефон уже занят",
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { name, email, phone },
  });

  revalidatePath("/account", "layout");
  return { error: "", ok: "Данные сохранены" };
}

export async function changePassword(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const user = await requireUser();

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next.length < 8) return { error: "Новый пароль — минимум 8 символов" };
  if (next !== confirm) return { error: "Пароли не совпадают" };

  const record = await prisma.user.findUnique({ where: { id: user.id } });
  if (!record || !(await verifyPassword(current, record.passwordHash))) {
    await new Promise((r) => setTimeout(r, 400));
    return { error: "Текущий пароль неверный" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next) },
  });

  return { error: "", ok: "Пароль изменён" };
}

export async function saveAddress(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const user = await requireUser();

  const id = str(formData, "id", 40);
  const city = str(formData, "city", 120);
  const street = str(formData, "street", 200);

  if (city.length < 2) return { error: "Укажите город" };
  if (street.length < 3) return { error: "Укажите улицу и дом" };

  const data = {
    title: str(formData, "title", 60),
    city,
    street,
    apartment: str(formData, "apartment", 40),
    comment: str(formData, "comment", 500),
  };

  const count = await prisma.address.count({ where: { userId: user.id } });

  if (id) {
    await prisma.address.updateMany({ where: { id, userId: user.id }, data });
  } else {
    await prisma.address.create({
      data: { ...data, user: { connect: { id: user.id } }, isDefault: count === 0 },
    });
  }

  revalidatePath("/account/addresses");
  return { error: "", ok: id ? "Адрес обновлён" : "Адрес добавлен" };
}

export async function deleteAddress(formData: FormData) {
  const user = await requireUser();
  const id = str(formData, "id", 40);

  const removed = await prisma.address.findFirst({ where: { id, userId: user.id } });
  if (!removed) return;

  await prisma.address.deleteMany({ where: { id, userId: user.id } });

  // Keep exactly one default address.
  if (removed.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });
    if (next) {
      await prisma.address.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }

  revalidatePath("/account/addresses");
}

export async function setDefaultAddress(formData: FormData) {
  const user = await requireUser();
  const id = str(formData, "id", 40);

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    }),
    prisma.address.updateMany({
      where: { id, userId: user.id },
      data: { isDefault: true },
    }),
  ]);

  revalidatePath("/account/addresses");
}
