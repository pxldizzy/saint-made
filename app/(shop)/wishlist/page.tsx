"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { ProductCardData } from "@/lib/product";
import { useWishlist } from "@/lib/wishlist";

export default function WishlistPage() {
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

  const loading = !ready || (ids.length > 0 && !fetched);

  return (
    <div className="container-sm pt-[120px]">
      <h1 className="text-h2 uppercase">Избранное</h1>

      {loading ? (
        <p className="text-body mt-[60px] text-ash uppercase">Загружаем…</p>
      ) : products.length === 0 ? (
        <div className="mt-[60px]">
          <p className="text-body text-ash uppercase">
            Здесь пока пусто. Отмечайте понравившиеся вещи сердечком.
          </p>
          <Link href="/catalog" className="btn-base btn-solid mt-[40px]">
            В каталог
          </Link>
        </div>
      ) : (
        <div className="mt-[60px] grid grid-cols-2 gap-x-[30px] gap-y-[60px] md:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
