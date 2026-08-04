/** Shared product shape + pure helpers — safe to import from client components. */
export type ProductCardData = {
  id: string;
  slug: string;
  title: string;
  price: number;
  oldPrice: number | null;
  isNew: boolean;
  images: { url: string; alt: string }[];
  variants: { size: string; color: string; colorHex: string; stock: number }[];
};

export const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

/** Unique colour swatches for a product, in the order they were added. */
export function colorsOf(product: ProductCardData) {
  const seen = new Map<string, string>();
  for (const v of product.variants) {
    if (v.color && !seen.has(v.color)) seen.set(v.color, v.colorHex || "#1c1c1c");
  }
  return [...seen.entries()].map(([name, hex]) => ({ name, hex }));
}

/** Sizes that still have stock, ordered the way the macket lists them. */
export function sizesOf(product: ProductCardData) {
  const sizes = new Set(
    product.variants.filter((v) => v.stock > 0).map((v) => v.size.toUpperCase()),
  );
  return [...sizes].sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));
}
