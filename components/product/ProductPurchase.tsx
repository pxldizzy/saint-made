"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart";

export type PurchaseVariant = {
  size: string;
  color: string;
  colorHex: string;
  stock: number;
};

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

/**
 * Macket: colour buttons 71px tall with 20px gaps, size buttons 75×71,
 * outline "добавить в корзину" and solid "купить", both 750×71.
 */
export default function ProductPurchase({
  product,
  variants,
}: {
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    image: string;
  };
  variants: PurchaseVariant[];
}) {
  const router = useRouter();
  const { add, lastAdded } = useCart();

  const colors = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of variants) if (!map.has(v.color)) map.set(v.color, v.colorHex);
    return [...map.entries()].map(([name, hex]) => ({ name, hex }));
  }, [variants]);

  const sizes = useMemo(() => {
    const set = new Set(variants.map((v) => v.size.toUpperCase()));
    return [...set].sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));
  }, [variants]);

  const [color, setColor] = useState(colors[0]?.name ?? "");
  const [size, setSize] = useState("");
  const [error, setError] = useState("");

  const stockOf = (s: string) =>
    variants.find(
      (v) => v.size.toUpperCase() === s && v.color === color,
    )?.stock ?? 0;

  const selected = size ? stockOf(size) : 0;
  const justAdded = lastAdded === `${product.id}|${size}|${color}`;

  const addToCart = () => {
    if (!size) {
      setError("Выберите размер");
      return;
    }
    setError("");
    add({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      image: product.image,
      size,
      color,
    });
    return true;
  };

  return (
    <div>
      {colors.length > 0 && (
        <>
          <h2 className="text-h3 mt-[60px] uppercase">Цвет</h2>
          <ul className="mt-[16px] flex flex-wrap gap-[20px]">
            {colors.map((c) => {
              const active = c.name === color;
              return (
                <li key={c.name}>
                  <button
                    type="button"
                    onClick={() => {
                      setColor(c.name);
                      setSize("");
                    }}
                    aria-pressed={active}
                    className={`btn-base h-[71px] border-2 px-[30px] text-[16px] font-semibold ${
                      active
                        ? "border-ink text-ink"
                        : "border-muted text-ash hover:border-graphite hover:text-graphite"
                    }`}
                  >
                    <span
                      aria-hidden
                      className="mr-[10px] inline-block h-[12px] w-[25px] border border-ink"
                      style={{ background: c.hex }}
                    />
                    {c.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <div className="mt-[60px] flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="text-h3 uppercase">Размер</h2>
        <button
          type="button"
          className="link-underline text-[20px] leading-[27.3px] font-bold uppercase"
        >
          Таблица размеров
        </button>
      </div>

      <ul className="mt-[16px] flex flex-wrap gap-[20px]">
        {sizes.map((s) => {
          const stock = stockOf(s);
          const active = s === size;
          return (
            <li key={s}>
              <button
                type="button"
                disabled={stock === 0}
                onClick={() => {
                  setSize(s);
                  setError("");
                }}
                aria-pressed={active}
                title={stock === 0 ? "Нет в наличии" : `В наличии: ${stock}`}
                className={`btn-base h-[71px] w-[75px] border-2 px-0 text-[16px] font-semibold ${
                  active
                    ? "border-ink text-ink"
                    : "border-muted text-ash hover:border-graphite hover:text-graphite"
                } ${stock === 0 ? "cursor-not-allowed line-through opacity-40 hover:border-muted hover:text-ash" : ""}`}
              >
                {s}
              </button>
            </li>
          );
        })}
      </ul>

      {error && (
        <p role="alert" className="text-body mt-[20px] font-semibold text-ink">
          {error}
        </p>
      )}
      {size && selected > 0 && selected <= 3 && (
        <p className="text-body mt-[20px] text-ash uppercase">
          Осталось {selected} шт.
        </p>
      )}

      <button
        type="button"
        onClick={addToCart}
        className="btn-base btn-outline mt-[60px] w-full max-w-[750px] font-semibold"
      >
        {justAdded ? "Добавлено ✓" : "Добавить в корзину"}
      </button>
      <button
        type="button"
        onClick={() => {
          if (addToCart()) router.push("/checkout");
        }}
        className="btn-base btn-solid mt-[20px] w-full max-w-[750px] font-semibold"
      >
        Купить
      </button>
    </div>
  );
}
