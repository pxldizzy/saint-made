import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm, { type ProductFormData } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const EMPTY: ProductFormData = {
  id: "",
  title: "",
  slug: "",
  description: "",
  price: "",
  oldPrice: "",
  categoryId: "",
  isNew: false,
  isHidden: false,
  images: [],
  variants: [
    { size: "S", color: "Черный", colorHex: "#1c1c1c", stock: 0 },
    { size: "M", color: "Черный", colorHex: "#1c1c1c", stock: 0 },
    { size: "L", color: "Черный", colorHex: "#1c1c1c", stock: 0 },
  ],
};

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  const [categories, product] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
      include: { parent: { select: { name: true } } },
    }),
    isNew
      ? null
      : prisma.product.findUnique({
          where: { id },
          include: {
            images: { orderBy: { sortOrder: "asc" } },
            variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
          },
        }),
  ]);

  if (!isNew && !product) notFound();

  const data: ProductFormData = product
    ? {
        id: product.id,
        title: product.title,
        slug: product.slug,
        description: product.description,
        price: String(product.price / 100),
        oldPrice: product.oldPrice ? String(product.oldPrice / 100) : "",
        categoryId: product.categoryId ?? "",
        isNew: product.isNew,
        isHidden: product.isHidden,
        images: product.images.map((i) => i.url),
        variants: product.variants.map((v) => ({
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          stock: v.stock,
        })),
      }
    : EMPTY;

  return (
    <div className="max-w-[1000px]">
      <Link
        href="/admin/products"
        className="link-underline text-[14px] leading-[19.1px] font-bold text-ash uppercase"
      >
        ← К списку товаров
      </Link>

      <h1 className="mt-[16px] text-[36px] leading-[49.2px] font-extrabold uppercase">
        {isNew ? "Новый товар" : product?.title}
      </h1>

      <ProductForm
        product={data}
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          parentName: c.parent?.name ?? null,
        }))}
      />
    </div>
  );
}
