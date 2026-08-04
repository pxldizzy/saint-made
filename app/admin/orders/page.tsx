import Link from "next/link";
import { formatDateTime, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { STATUS_FLOW, STATUS_LABELS } from "@/lib/stats";

export const dynamic = "force-dynamic";
export const metadata = { title: "Заказы" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const status = STATUS_FLOW.includes(sp.status ?? "") ? sp.status : undefined;

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { phone: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { items: { select: { qty: true } } },
  });

  return (
    <div>
      <h1 className="text-[36px] leading-[49.2px] font-extrabold uppercase">
        Заказы
      </h1>

      <div className="mt-[24px] flex flex-wrap items-center gap-[12px]">
        <Link
          href="/admin/orders"
          className={`border-2 border-graphite px-[16px] py-[8px] text-[14px] leading-[19.1px] font-bold uppercase transition-colors duration-200 ${
            status ? "hover:bg-line" : "bg-graphite text-paper"
          }`}
        >
          Все
        </Link>
        {STATUS_FLOW.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`border-2 border-graphite px-[16px] py-[8px] text-[14px] leading-[19.1px] font-bold uppercase transition-colors duration-200 ${
              status === s ? "bg-graphite text-paper" : "hover:bg-line"
            }`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}

        <form className="ml-auto flex items-center gap-[8px]">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Имя, телефон или e-mail"
            aria-label="Поиск по покупателю"
            className="h-[44px] w-[260px] border-2 border-graphite px-[12px] text-[16px] focus:border-ink focus:outline-none"
          />
          <button type="submit" className="btn-base btn-outline h-[44px] px-[20px]">
            Найти
          </button>
        </form>
      </div>

      <div className="mt-[24px] overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-[16px] leading-[21.9px]">
          <thead>
            <tr className="border-b-2 border-graphite text-left uppercase">
              <th className="py-[12px] pr-[12px] font-bold">Заказ</th>
              <th className="py-[12px] pr-[12px] font-bold">Дата</th>
              <th className="py-[12px] pr-[12px] font-bold">Покупатель</th>
              <th className="py-[12px] pr-[12px] font-bold">Контакты</th>
              <th className="py-[12px] pr-[12px] font-bold">Позиций</th>
              <th className="py-[12px] pr-[12px] font-bold">Сумма</th>
              <th className="py-[12px] font-bold">Статус</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-line">
                <td className="py-[12px] pr-[12px]">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="link-underline font-bold"
                  >
                    №{order.id}
                  </Link>
                </td>
                <td className="py-[12px] pr-[12px] whitespace-nowrap">
                  {formatDateTime(order.createdAt)}
                </td>
                <td className="py-[12px] pr-[12px]">{order.name}</td>
                <td className="py-[12px] pr-[12px] whitespace-nowrap">
                  {order.phone}
                  {order.email ? (
                    <span className="block text-[14px] text-ash">{order.email}</span>
                  ) : null}
                </td>
                <td className="py-[12px] pr-[12px]">
                  {order.items.reduce((n, i) => n + i.qty, 0)}
                </td>
                <td className="py-[12px] pr-[12px] font-bold whitespace-nowrap">
                  {formatPrice(order.total)}
                </td>
                <td className="py-[12px] uppercase">
                  {STATUS_LABELS[order.status] ?? order.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <p className="py-[40px] text-center text-[16px] leading-[21.9px] text-ash uppercase">
            Заказов нет
          </p>
        )}
      </div>
    </div>
  );
}
