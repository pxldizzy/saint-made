"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { STATUS_FLOW } from "@/lib/stats";

/** Every action re-checks the session — the proxy only guards page routes. */
async function requireAdmin() {
  if (!(await isAuthenticated())) throw new Error("Не авторизовано");
}

const text = (data: FormData, key: string, max: number) =>
  String(data.get(key) ?? "")
    .trim()
    .slice(0, max);

const rubToKopecks = (value: string) => {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : 0;
};

const slugify = (s: string) => {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
    и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh",
    щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return s
    .toLowerCase()
    .replace(/[а-яё]/g, (ch) => map[ch] ?? ch)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
};

type VariantInput = { size: string; color: string; colorHex: string; stock: number };

function parseVariants(raw: string): VariantInput[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw || "[]");
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const seen = new Set<string>();
  const out: VariantInput[] = [];
  for (const row of parsed.slice(0, 200)) {
    const r = row as Record<string, unknown>;
    const size = String(r.size ?? "").trim().slice(0, 20).toUpperCase();
    const color = String(r.color ?? "").trim().slice(0, 60);
    if (!size) continue;
    const key = `${size}|${color}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      size,
      color,
      colorHex: String(r.colorHex ?? "").trim().slice(0, 20),
      stock: Math.max(0, Math.trunc(Number(r.stock) || 0)),
    });
  }
  return out;
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();

  const id = text(formData, "id", 40);
  const title = text(formData, "title", 200);
  if (title.length < 2) throw new Error("Укажите название товара");

  const slug = slugify(text(formData, "slug", 120) || title);
  const price = rubToKopecks(text(formData, "price", 20));
  if (price <= 0) throw new Error("Укажите цену");

  const oldPriceRaw = text(formData, "oldPrice", 20);
  const categoryId = text(formData, "categoryId", 40);

  const images = text(formData, "images", 4000)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 12);

  const variants = parseVariants(text(formData, "variants", 20000));

  const data = {
    title,
    slug,
    description: text(formData, "description", 4000),
    price,
    oldPrice: oldPriceRaw ? rubToKopecks(oldPriceRaw) : null,
    isNew: formData.get("isNew") === "on",
    isHidden: formData.get("isHidden") === "on",
  };

  // `disconnect` is only valid on update — on create the relation is simply omitted.
  const category = categoryId
    ? { category: { connect: { id: categoryId } } }
    : {};

  // Images and variants are replaced wholesale: the form always submits the
  // full set. `deleteMany` is only valid on update.
  const imageRows = images.map((url, sortOrder) => ({ url, alt: title, sortOrder }));

  if (id) {
    await prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(categoryId ? category : { category: { disconnect: true } }),
        images: { deleteMany: {}, create: imageRows },
        variants: { deleteMany: {}, create: variants },
      },
    });
  } else {
    await prisma.product.create({
      data: {
        ...data,
        ...category,
        images: { create: imageRows },
        variants: { create: variants },
      },
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id", 40);
  if (id) await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
}

export async function toggleProductHidden(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id", 40);
  const product = await prisma.product.findUnique({ where: { id } });
  if (product) {
    await prisma.product.update({
      where: { id },
      data: { isHidden: !product.isHidden },
    });
  }
  revalidatePath("/admin/products");
  revalidatePath("/catalog");
}

export async function saveCategory(formData: FormData) {
  await requireAdmin();

  const id = text(formData, "id", 40);
  const name = text(formData, "name", 120);
  if (name.length < 2) throw new Error("Укажите название категории");

  const parentId = text(formData, "parentId", 40);
  const sortOrder = Math.trunc(Number(text(formData, "sortOrder", 10)) || 0);
  const slug = slugify(text(formData, "slug", 120) || name) || `cat-${Date.now()}`;

  const data = { name, slug, sortOrder };
  const parent = parentId ? { parent: { connect: { id: parentId } } } : {};

  if (id) {
    await prisma.category.update({
      where: { id },
      data: {
        ...data,
        ...(parentId ? parent : { parent: { disconnect: true } }),
      },
    });
  } else {
    await prisma.category.create({ data: { ...data, ...parent } });
  }

  revalidatePath("/admin/categories");
  revalidatePath("/catalog");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id", 40);
  if (id) await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/catalog");
}

export async function setOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = Number(text(formData, "id", 20));
  const status = text(formData, "status", 20);
  if (!id || !STATUS_FLOW.includes(status)) throw new Error("Некорректный статус");

  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Uploads a product photo. On Vercel the filesystem is read-only, so we use
 * Vercel Blob when its token is present; locally the file goes to
 * /public/uploads so the admin works without any cloud setup.
 */
export async function uploadImage(formData: FormData): Promise<string> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Файл не выбран");
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Поддерживаются JPEG, PNG, WebP и AVIF");
  }
  if (file.size > 8 * 1024 * 1024) throw new Error("Файл больше 8 МБ");

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`products/${name}`, file, { access: "public" });
    return blob.url;
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  return `/uploads/${name}`;
}
