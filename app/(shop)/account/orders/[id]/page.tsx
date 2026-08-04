import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusChip } from "@/components/account/OrderCard";
import { ordersOf } from "@/lib/account";
import { getCurrentUser } from "@/lib/auth-server";
import { formatDateTime, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { STATUS_LABELS } from "@/lib/stats";

export const dynamic = "force-dynamic";

/** The happy path a buyer sees; "cancelled" is shown separately. */
const TIMELINE = ["new", "processing", "shipped", "delivered"];

export default async function AccountOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = (await getCurrentUser())!;
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) notFound();

  // Ownership is part of the query — a foreign id simply is not found.
  const order = await prisma.order.findFirst({
    where: { id: orderId, ...ordersOf(user) },
    include: {
      items: {
        include: {
          product: {
            select: {
              slug: true,
              images: { orderBy: { sortOrder: "asc" }, take: 1 },
            },
          },
        },
      },
    },
  });
  if (!order) notFound();

  const cancelled = order.status === "cancelled";
  const reached = TIMELINE.indexOf(order.status);

  return (
    <div>
      <Link
        href="/account/orders"
        className="link-underline text-[14px] leading-[19.1px] font-bold text-ash uppercase"
      >
        ← Ко всем заказам
      </Link>

      <div className="mt-[16px] flex flex-wrap items-center justify-between gap-[20px]">
        <h2 className="text-h3 uppercase">Заказ №{order.id}</h2>
        <StatusChip status={order.status} />
      </div>
      <p className="text-body mt-[8px] text-ash uppercase">
        Оформлен {formatDateTime(order.createdAt)}
      </p>

      {cancelled ? (
        <p className="text-body mt-[30px] border-2 border-line p-[20px] uppercase">
          Заказ отменён. Если это ошибка — напишите нам на sm@saintmade.ru.
        </p>
      ) : (
        <ol className="mt-[30px] grid grid-cols-2 gap-[10px] sm:grid-cols-4">
          {TIMELINE.map((step, i) => {
            const done = i <= reached;
            return (
              <li key={step}>
                <span
                  className={`block h-[4px] ${done ? "bg-graphite" : "bg-line"}`}
                />
                <span
                  className={`mt-[10px] block text-[14px] leading-[19.1px] font-bold uppercase ${
                    done ? "text-graphite" : "text-ash"
                  }`}
                >
                  {STATUS_LABELS[step]}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <section className="mt-[40px]">
        <h3 className="text-column-title text-graphite">Состав</h3>
        <ul className="mt-[20px] flex flex-col">
          {order.items.map((item) => {
            const image = item.product?.images[0]?.url;
            return (
              <li
                key={item.id}
                className="flex gap-[20px] border-t border-line py-[20px] first:border-t-0 first:pt-0"
              >
                <span className="relative block aspect-[150/226] w-[90px] shrink-0 overflow-hidden bg-[#f4f4f4]">
                  {image && (
                    <Image
                      src={image}
                      alt={item.title}
                      fill
                      sizes="90px"
                      loading="lazy"
                      className="object-cover"
                    />
                  )}
                </span>

                <div className="flex flex-1 flex-col justify-between gap-[10px]">
                  <div>
                    {item.product ? (
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="link-underline text-[20px] leading-[27.3px] font-bold uppercase"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <span className="text-[20px] leading-[27.3px] font-bold uppercase">
                        {item.title}
                      </span>
                    )}
                    <p className="text-body mt-[6px] text-ash uppercase">
                      {item.color} · {item.size} · {item.qty} шт.
                    </p>
                  </div>
                </div>

                <p className="text-[20px] leading-[27.3px] font-medium whitespace-nowrap">
                  {formatPrice(item.price * item.qty)}
                </p>
              </li>
            );
          })}
        </ul>

        <p className="mt-[20px] flex justify-between border-t-2 border-graphite pt-[20px] text-[24px] leading-[32.8px] font-bold uppercase">
          <span>Итого</span>
          <span>{formatPrice(order.total)}</span>
        </p>
      </section>

      <section className="mt-[40px]">
        <h3 className="text-column-title text-graphite">Доставка</h3>
        <dl className="mt-[20px] grid gap-[20px] sm:grid-cols-2">
          {[
            { label: "Получатель", value: order.name },
            { label: "Телефон", value: order.phone },
            { label: "E-mail", value: order.email || "—" },
            { label: "Адрес", value: order.address || "—" },
            { label: "Комментарий", value: order.comment || "—" },
          ].map((row) => (
            <div key={row.label}>
              <dt className="text-[14px] leading-[19.1px] text-ash uppercase">
                {row.label}
              </dt>
              <dd className="text-body mt-[4px]">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
