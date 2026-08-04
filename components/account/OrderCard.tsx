import Image from "next/image";
import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/stats";

export type AccountOrder = {
  id: number;
  status: string;
  total: number;
  createdAt: Date;
  items: {
    id: string;
    title: string;
    size: string;
    color: string;
    qty: number;
    price: number;
    product: { slug: string; images: { url: string }[] } | null;
  }[];
};

/** Status chip — solid while the order is active, outlined once it is closed. */
export function StatusChip({ status }: { status: string }) {
  const closed = status === "delivered" || status === "cancelled";
  return (
    <span
      className={`inline-flex h-[32px] items-center px-[14px] text-[14px] leading-[19.1px] font-bold uppercase ${
        closed ? "border border-line text-ash" : "bg-graphite text-paper"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default function OrderCard({ order }: { order: AccountOrder }) {
  const count = order.items.reduce((n, i) => n + i.qty, 0);

  return (
    <article className="border-2 border-graphite p-[24px] transition-colors duration-300 hover:border-ink">
      <div className="flex flex-wrap items-center justify-between gap-[16px]">
        <div>
          <h3 className="text-[20px] leading-[27.3px] font-bold uppercase">
            Заказ №{order.id}
          </h3>
          <p className="text-body mt-[4px] text-ash uppercase">
            {formatDate(order.createdAt)} · {count} шт.
          </p>
        </div>
        <StatusChip status={order.status} />
      </div>

      <ul className="mt-[20px] flex flex-wrap gap-[10px]">
        {order.items.slice(0, 6).map((item) => {
          const image = item.product?.images[0]?.url;
          return (
            <li key={item.id}>
              {image ? (
                <Link
                  href={item.product ? `/product/${item.product.slug}` : "#"}
                  className="relative block aspect-[150/226] w-[70px] overflow-hidden bg-[#f4f4f4] transition-opacity duration-300 hover:opacity-70"
                  title={`${item.title} · ${item.size}`}
                >
                  <Image
                    src={image}
                    alt={item.title}
                    fill
                    sizes="70px"
                    loading="lazy"
                    className="object-cover"
                  />
                </Link>
              ) : (
                <span className="flex aspect-[150/226] w-[70px] items-center justify-center bg-line text-[10px] uppercase">
                  нет фото
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-[20px] flex flex-wrap items-center justify-between gap-[16px]">
        <p className="text-[20px] leading-[27.3px] font-bold">
          {formatPrice(order.total)}
        </p>
        <Link
          href={`/account/orders/${order.id}`}
          className="link-underline text-body font-bold uppercase"
        >
          Подробнее
        </Link>
      </div>
    </article>
  );
}
