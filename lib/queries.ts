import type { ProductCardData } from "./product";
import { prisma } from "./prisma";

export const productCardSelect = {
  id: true,
  slug: true,
  title: true,
  price: true,
  oldPrice: true,
  isNew: true,
  images: { orderBy: { sortOrder: "asc" }, select: { url: true, alt: true } },
  variants: { select: { size: true, color: true, colorHex: true, stock: true } },
} as const;

/**
 * Bestsellers = most units actually sold. Falls back to the newest products
 * so the home page is never empty on a fresh database.
 */
export async function getBestsellers(take: number): Promise<ProductCardData[]> {
  const sold = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { qty: true },
    orderBy: { _sum: { qty: "desc" } },
    take: take * 2,
  });

  const ids = sold
    .map((row) => row.productId)
    .filter((id): id is string => Boolean(id));

  const ranked = ids.length
    ? await prisma.product.findMany({
        where: { id: { in: ids }, isHidden: false },
        select: productCardSelect,
      })
    : [];

  ranked.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

  if (ranked.length >= take) return ranked.slice(0, take);

  const filler = await prisma.product.findMany({
    where: { isHidden: false, id: { notIn: ranked.map((p) => p.id) } },
    orderBy: { createdAt: "desc" },
    take: take - ranked.length,
    select: productCardSelect,
  });

  return [...ranked, ...filler];
}
