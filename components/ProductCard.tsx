import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { colorsOf, sizesOf, type ProductCardData } from "@/lib/product";

/**
 * Card geometry from the macket:
 *  lg   — image 420×629, title 16/700, price 16/500 (CATALOG 4, home)
 *  sm   — image 270×405, same type       (CATALOG 6)
 *  wide — image 870×885, title 20/700    (home, bestseller hero card)
 */
type Size = "lg" | "sm" | "wide";

const ratio: Record<Size, string> = {
  lg: "420 / 629",
  sm: "270 / 405",
  wide: "870 / 885",
};

export default function ProductCard({
  product,
  size = "lg",
  priority = false,
  sizes = "(max-width: 768px) 50vw, 420px",
}: {
  product: ProductCardData;
  size?: Size;
  priority?: boolean;
  sizes?: string;
}) {
  const [first, second] = product.images;
  const colors = colorsOf(product);
  const available = sizesOf(product);
  const big = size === "wide";

  return (
    <article className="group">
      <Link href={`/product/${product.slug}`} className="block">
        <div
          className="relative overflow-hidden bg-[#f4f4f4]"
          style={{ aspectRatio: ratio[size] }}
        >
          {first ? (
            <Image
              src={first.url}
              alt={first.alt || product.title}
              fill
              sizes={sizes}
              priority={priority}
              loading={priority ? undefined : "lazy"}
              className="object-cover transition-transform duration-700 ease-[var(--ease-brand)] group-hover:scale-[1.04]"
            />
          ) : null}
          {second ? (
            <Image
              src={second.url}
              alt=""
              fill
              sizes={sizes}
              loading="lazy"
              className="object-cover opacity-0 transition-opacity duration-500 ease-[var(--ease-brand)] group-hover:opacity-100"
            />
          ) : null}
          {product.isNew ? (
            <span className="absolute top-0 left-0 bg-graphite px-3 py-1 text-[12px] leading-[19px] font-bold text-paper uppercase">
              New
            </span>
          ) : null}
        </div>

        <div
          className={`mt-[20px] flex items-baseline justify-between gap-4 ${
            big ? "text-[20px] leading-[27.3px]" : "text-body"
          }`}
        >
          <h3 className="font-bold uppercase transition-opacity duration-300 group-hover:opacity-60">
            {product.title}
          </h3>
          <span className="shrink-0 font-medium">
            {formatPrice(product.price)}
          </span>
        </div>
      </Link>

      <div className="mt-[8px] flex items-center justify-between gap-4">
        <p className="text-body font-bold text-ash">
          {available.length ? available.join("  ") : "Нет в наличии"}
        </p>
        {colors.length > 0 && (
          <ul className="flex shrink-0 gap-[10px]">
            {colors.slice(0, 4).map((c) => (
              <li
                key={c.name}
                title={c.name}
                aria-label={c.name}
                className="h-[12px] w-[25px] border border-ink transition-transform duration-300 hover:scale-110"
                style={{ background: c.hex }}
              />
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
