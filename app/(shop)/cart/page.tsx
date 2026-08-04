"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { lineKey, useCart } from "@/lib/cart";

export default function CartPage() {
  const { lines, total, count, ready, setQty, remove } = useCart();

  return (
    <div className="container-sm pt-[120px]">
      <h1 className="text-h2 uppercase">Корзина</h1>

      {!ready ? (
        <p className="text-body mt-[60px] text-ash uppercase">Загружаем…</p>
      ) : lines.length === 0 ? (
        <div className="mt-[60px]">
          <p className="text-body text-ash uppercase">
            В корзине пока пусто.
          </p>
          <Link href="/catalog" className="btn-base btn-solid mt-[40px]">
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="mt-[60px] grid gap-[60px] lg:grid-cols-[1fr_420px]">
          <ul className="flex flex-col">
            {lines.map((line) => {
              const key = lineKey(line);
              return (
                <li
                  key={key}
                  className="flex gap-[30px] border-t border-line py-[30px] first:border-t-0 first:pt-0"
                >
                  <Link
                    href={`/product/${line.slug}`}
                    className="relative aspect-[150/226] w-[110px] shrink-0 overflow-hidden bg-[#f4f4f4] md:w-[150px]"
                  >
                    {line.image && (
                      <Image
                        src={line.image}
                        alt={line.title}
                        fill
                        sizes="150px"
                        loading="lazy"
                        className="object-cover"
                      />
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col justify-between gap-4">
                    <div>
                      <Link
                        href={`/product/${line.slug}`}
                        className="link-underline text-[20px] leading-[27.3px] font-bold uppercase"
                      >
                        {line.title}
                      </Link>
                      <p className="text-body mt-[8px] text-ash uppercase">
                        {line.color} · {line.size}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-[30px]">
                      <div className="flex items-center border-2 border-graphite">
                        <button
                          type="button"
                          aria-label="Уменьшить количество"
                          onClick={() => setQty(key, line.qty - 1)}
                          className="h-[44px] w-[44px] text-[20px] transition-colors duration-300 hover:bg-graphite hover:text-paper"
                        >
                          −
                        </button>
                        <span
                          aria-live="polite"
                          className="text-body w-[44px] text-center font-bold"
                        >
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          aria-label="Увеличить количество"
                          onClick={() => setQty(key, line.qty + 1)}
                          className="h-[44px] w-[44px] text-[20px] transition-colors duration-300 hover:bg-graphite hover:text-paper"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(key)}
                        className="link-underline text-body font-bold text-ash uppercase transition-colors duration-300 hover:text-ink"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>

                  <p className="text-[20px] leading-[27.3px] font-medium whitespace-nowrap">
                    {formatPrice(line.price * line.qty)}
                  </p>
                </li>
              );
            })}
          </ul>

          <aside className="h-fit border-2 border-graphite p-[30px]">
            <h2 className="text-column-title">Итого</h2>
            <dl className="mt-[30px] flex flex-col gap-[16px]">
              <div className="text-body flex justify-between uppercase">
                <dt>Товаров</dt>
                <dd className="font-bold">{count}</dd>
              </div>
              <div className="text-body flex justify-between uppercase">
                <dt>Доставка</dt>
                <dd className="font-bold">Бесплатно</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-[16px] text-[20px] leading-[27.3px] uppercase">
                <dt className="font-bold">К оплате</dt>
                <dd className="font-bold">{formatPrice(total)}</dd>
              </div>
            </dl>
            <Link href="/checkout" className="btn-base btn-solid mt-[30px] w-full">
              Оформить заказ
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
