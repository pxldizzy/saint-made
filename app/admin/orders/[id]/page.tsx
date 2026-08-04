import Link from "next/link";
import { notFound } from "next/navigation";
import { setOrderStatus } from "@/app/admin/actions";
import { formatDateTime, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { STATUS_FLOW, STATUS_LABELS } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: { select: { slug: true } } } } },
  });
  if (!order) notFound();

  const rows = [
    { label: "Покупатель", value: order.name },
    { label: "Телефон", value: order.phone },
    { label: "E-mail", value: order.email || "—" },
    { label: "Адрес", value: order.address || "—" },
    { label: "Комментарий", value: order.comment || "—" },
    { label: "Создан", value: formatDateTime(order.createdAt) },
    { label: "Обновлён", value: formatDateTime(order.updatedAt) },
  ];

  return (
    <div className="max-w-[1000px]">
      <Link
        href="/admin/orders"
        className="link-underline text-[14px] leading-[19.1px] font-bold text-ash uppercase"
      >
        ← Ко всем заказам
      </Link>

      <div className="mt-[16px] flex flex-wrap items-baseline justify-between gap-[20px]">
        <h1 className="text-[36px] leading-[49.2px] font-extrabold uppercase">
          Заказ №{order.id}
        </h1>
        <p className="text-[20px] leading-[27.3px] font-bold uppercase">
          {formatPrice(order.total)}
        </p>
      </div>

      <section className="mt-[24px] border-2 border-graphite p-[20px]">
        <h2 className="text-[14px] leading-[19.1px] font-bold uppercase">Статус</h2>
        <form action={setOrderStatus} className="mt-[12px] flex flex-wrap gap-[12px]">
          <input type="hidden" name="id" value={order.id} />
          {STATUS_FLOW.map((s) => (
            <button
              key={s}
              type="submit"
              name="status"
              value={s}
              aria-current={order.status === s ? "true" : undefined}
              className={`border-2 border-graphite px-[16px] py-[8px] text-[14px] leading-[19.1px] font-bold uppercase transition-colors duration-200 ${
                order.status === s ? "bg-graphite text-paper" : "hover:bg-line"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </form>
      </section>

      <section className="mt-[24px] border-2 border-graphite p-[20px]">
        <h2 className="text-[14px] leading-[19.1px] font-bold uppercase">
          Данные покупателя
        </h2>
        <dl className="mt-[12px] grid gap-[12px] sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-[14px] leading-[19.1px] text-ash uppercase">
                {row.label}
              </dt>
              <dd className="text-[16px] leading-[21.9px]">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-[24px] border-2 border-graphite p-[20px]">
        <h2 className="text-[14px] leading-[19.1px] font-bold uppercase">Состав</h2>
        <div className="mt-[12px] overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[16px] leading-[21.9px]">
            <thead>
              <tr className="border-b-2 border-graphite text-left uppercase">
                <th className="py-[10px] pr-[12px] font-bold">Товар</th>
                <th className="py-[10px] pr-[12px] font-bold">Цвет / размер</th>
                <th className="py-[10px] pr-[12px] font-bold">Кол-во</th>
                <th className="py-[10px] pr-[12px] font-bold">Цена</th>
                <th className="py-[10px] font-bold">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-line">
                  <td className="py-[10px] pr-[12px] uppercase">
                    {item.product ? (
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="link-underline"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      item.title
                    )}
                  </td>
                  <td className="py-[10px] pr-[12px] uppercase">
                    {item.color} · {item.size}
                  </td>
                  <td className="py-[10px] pr-[12px]">{item.qty}</td>
                  <td className="py-[10px] pr-[12px]">{formatPrice(item.price)}</td>
                  <td className="py-[10px] font-bold">
                    {formatPrice(item.price * item.qty)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
