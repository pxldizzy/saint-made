import Link from "next/link";
import BarChart from "@/components/admin/BarChart";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { RANGES, STATUS_LABELS, getStats, type Range } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rawRange } = await searchParams;
  const range = (RANGES.find((r) => r.value === rawRange)?.value ??
    "month") as Range;

  const [stats, lowStock, newOrders] = await Promise.all([
    getStats(range),
    prisma.variant.count({ where: { stock: { lte: 2 } } }),
    prisma.order.count({ where: { status: "new" } }),
  ]);

  const cards = [
    { label: "Заработано", value: formatPrice(stats.revenue) },
    { label: "Продаж", value: String(stats.orders) },
    { label: "Средний чек", value: formatPrice(stats.average) },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-[20px]">
        <h1 className="text-[36px] leading-[49.2px] font-extrabold uppercase">
          Аналитика продаж
        </h1>
        <nav aria-label="Период">
          <ul className="flex border-2 border-graphite">
            {RANGES.map((r) => (
              <li key={r.value}>
                <Link
                  href={`/admin?range=${r.value}`}
                  aria-current={r.value === range ? "page" : undefined}
                  className={`block px-[16px] py-[8px] text-[14px] leading-[19.1px] font-bold uppercase transition-colors duration-200 ${
                    r.value === range
                      ? "bg-graphite text-paper"
                      : "text-graphite hover:bg-line"
                  }`}
                >
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mt-[30px] grid gap-[20px] sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="border-2 border-graphite p-[24px]">
            <p className="text-[36px] leading-[49.2px] font-extrabold">
              {card.value}
            </p>
            <p className="mt-[4px] text-[16px] leading-[21.9px] text-ash uppercase">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {(newOrders > 0 || lowStock > 0) && (
        <div className="mt-[20px] flex flex-wrap gap-[20px]">
          {newOrders > 0 && (
            <Link
              href="/admin/orders?status=new"
              className="border-2 border-graphite px-[20px] py-[12px] text-[14px] leading-[19.1px] font-bold uppercase transition-colors duration-200 hover:bg-graphite hover:text-paper"
            >
              Новых заказов: {newOrders}
            </Link>
          )}
          {lowStock > 0 && (
            <Link
              href="/admin/products?stock=low"
              className="border-2 border-graphite px-[20px] py-[12px] text-[14px] leading-[19.1px] font-bold uppercase transition-colors duration-200 hover:bg-graphite hover:text-paper"
            >
              Заканчивается: {lowStock} позиц.
            </Link>
          )}
        </div>
      )}

      <section className="mt-[40px] border-2 border-graphite p-[24px]">
        <h2 className="text-[20px] leading-[27.3px] font-bold uppercase">
          Продажи по времени
        </h2>
        <div className="mt-[20px]">
          <BarChart data={stats.series} />
        </div>
      </section>

      <div className="mt-[40px] grid gap-[20px] lg:grid-cols-2">
        <section className="border-2 border-graphite p-[24px]">
          <h2 className="text-[20px] leading-[27.3px] font-bold uppercase">
            Топ товаров
          </h2>
          {stats.topProducts.length === 0 ? (
            <p className="mt-[20px] text-[16px] leading-[21.9px] text-ash uppercase">
              Продаж пока нет
            </p>
          ) : (
            <ol className="mt-[20px] flex flex-col gap-[14px]">
              {stats.topProducts.map((p, i) => (
                <li
                  key={p.title}
                  className="flex items-baseline justify-between gap-[20px] text-[16px] leading-[21.9px]"
                >
                  <span className="uppercase">
                    <span className="text-ash">{i + 1}.</span> {p.title}
                  </span>
                  <span className="shrink-0 font-bold">
                    {p.qty} шт · {formatPrice(p.revenue)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="border-2 border-graphite p-[24px]">
          <h2 className="text-[20px] leading-[27.3px] font-bold uppercase">
            По категориям
          </h2>
          {stats.byCategory.length === 0 ? (
            <p className="mt-[20px] text-[16px] leading-[21.9px] text-ash uppercase">
              Данных нет
            </p>
          ) : (
            <ul className="mt-[20px] flex flex-col gap-[14px]">
              {stats.byCategory.map((c) => {
                const share = stats.revenue
                  ? Math.round((c.revenue / stats.revenue) * 100)
                  : 0;
                return (
                  <li key={c.name}>
                    <div className="flex justify-between text-[16px] leading-[21.9px]">
                      <span className="uppercase">{c.name}</span>
                      <span className="font-bold">
                        {formatPrice(c.revenue)} · {share}%
                      </span>
                    </div>
                    <div className="mt-[6px] h-[6px] bg-line">
                      <div
                        className="h-full bg-graphite transition-[width] duration-700 ease-[var(--ease-brand)]"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-[40px] border-2 border-graphite p-[24px]">
        <h2 className="text-[20px] leading-[27.3px] font-bold uppercase">
          Заказы по статусам
        </h2>
        <ul className="mt-[20px] flex flex-wrap gap-[20px]">
          {stats.byStatus.map((s) => (
            <li key={s.status} className="text-[16px] leading-[21.9px]">
              <Link
                href={`/admin/orders?status=${s.status}`}
                className="uppercase transition-opacity duration-200 hover:opacity-60"
              >
                {STATUS_LABELS[s.status] ?? s.status}:{" "}
                <span className="font-bold">{s.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
