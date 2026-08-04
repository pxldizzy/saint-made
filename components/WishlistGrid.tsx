"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { ProductCardData } from "@/lib/product";
import { useWishlist } from "@/lib/wishlist";

/** Favourites live in localStorage; the ids are resolved through /api/products. */
export default function WishlistGrid({ columns = 4 }: { columns?: 3 | 4 }) {
  const { ids, ready } = useWishlist();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!ready || ids.length === 0) return;
    let cancelled = false;
    const qs = ids.map((id) => `id=${encodeURIComponent(id)}`).join("&");

    fetch(`/api/products?${qs}`)
      .then((r) => r.json())
      .then((data: ProductCardData[]) => {
        if (!cancelled) {
          setProducts(data);
          setFetched(true);
        }
      })
      .catch(() => {
        if (!cancelled) setFetched(true);
      });

    return () => {
      cancelled = true;
    };
  }, [ids, ready]);

  if (!ready || (ids.length > 0 && !fetched)) {
    return <p className="text-body text-ash uppercase">Загружаем…</p>;
  }

  if (products.length === 0) {
    return (
      <div>
        <p className="text-body text-ash uppercase">
          Здесь пока пусто. Отмечайте понравившиеся вещи сердечком — они
          сохранятся в этом браузере.
        </p>
        <Link href="/catalog" className="btn-base btn-solid mt-[24px]">
          В каталог
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 gap-x-[30px] gap-y-[60px] ${
        columns === 3 ? "xl:grid-cols-3" : "md:grid-cols-3 xl:grid-cols-4"
      }`}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          sizes="(max-width: 768px) 50vw, 300px"
        />
      ))}
    </div>
  );
}
