"use client";

import { HeartLargeIcon } from "@/components/icons";
import { useWishlist } from "@/lib/wishlist";

/** Macket: 36×32 heart at the top-right of the product page. */
export default function WishlistButton({
  productId,
  title,
}: {
  productId: string;
  title: string;
}) {
  const { has, toggle, ready } = useWishlist();
  const active = ready && has(productId);

  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      aria-pressed={active}
      aria-label={
        active ? `Убрать «${title}» из избранного` : `Добавить «${title}» в избранное`
      }
      className="shrink-0 transition-transform duration-300 hover:scale-110 active:scale-95"
    >
      <HeartLargeIcon
        className={`h-[32px] w-[36px] transition-colors duration-300 ${
          active ? "text-ink" : "text-ink/40 hover:text-ink"
        }`}
        style={active ? { fill: "currentColor" } : undefined}
      />
    </button>
  );
}
