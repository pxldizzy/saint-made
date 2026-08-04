import { prisma } from "./prisma";

export type Range = "day" | "week" | "month" | "all";

export const RANGES: { value: Range; label: string }[] = [
  { value: "day", label: "День" },
  { value: "week", label: "Неделя" },
  { value: "month", label: "Месяц" },
  { value: "all", label: "Всё время" },
];

export function rangeStart(range: Range): Date | null {
  const now = new Date();
  switch (range) {
    case "day":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "week":
      return new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    case "month":
      return new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

export type Stats = {
  revenue: number;
  orders: number;
  average: number;
  series: { label: string; value: number }[];
  topProducts: { title: string; qty: number; revenue: number }[];
  byCategory: { name: string; qty: number; revenue: number }[];
  byStatus: { status: string; count: number }[];
};

/**
 * ponytail: aggregates in JS over the orders in range — fine for a single-shop
 * dataset. Move to SQL GROUP BY if the order table outgrows ~100k rows.
 */
export async function getStats(range: Range): Promise<Stats> {
  const since = rangeStart(range);

  const orders = await prisma.order.findMany({
    where: since ? { createdAt: { gte: since } } : {},
    select: {
      total: true,
      createdAt: true,
      status: true,
      items: {
        select: {
          title: true,
          qty: true,
          price: true,
          product: { select: { category: { select: { name: true } } } },
        },
      },
    },
  });

  const paid = orders.filter((o) => o.status !== "cancelled");
  const revenue = paid.reduce((sum, o) => sum + o.total, 0);

  const buckets = new Map<string, number>();
  const byDay = range !== "day";
  const format = (d: Date) =>
    byDay
      ? d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })
      : `${String(d.getHours()).padStart(2, "0")}:00`;

  const points = byDay ? (range === "week" ? 7 : range === "month" ? 30 : 0) : 24;
  if (points) {
    const now = new Date();
    for (let i = points - 1; i >= 0; i--) {
      const d = byDay
        ? new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        : new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - i);
      buckets.set(format(d), 0);
    }
  }

  for (const order of paid) {
    const key = format(new Date(order.createdAt));
    buckets.set(key, (buckets.get(key) ?? 0) + order.total);
  }

  const productTotals = new Map<string, { qty: number; revenue: number }>();
  const categoryTotals = new Map<string, { qty: number; revenue: number }>();

  for (const order of paid) {
    for (const item of order.items) {
      const p = productTotals.get(item.title) ?? { qty: 0, revenue: 0 };
      p.qty += item.qty;
      p.revenue += item.qty * item.price;
      productTotals.set(item.title, p);

      const name = item.product?.category?.name ?? "Без категории";
      const c = categoryTotals.get(name) ?? { qty: 0, revenue: 0 };
      c.qty += item.qty;
      c.revenue += item.qty * item.price;
      categoryTotals.set(name, c);
    }
  }

  const statusCounts = new Map<string, number>();
  for (const order of orders) {
    statusCounts.set(order.status, (statusCounts.get(order.status) ?? 0) + 1);
  }

  return {
    revenue,
    orders: paid.length,
    average: paid.length ? Math.round(revenue / paid.length) : 0,
    series: [...buckets.entries()].map(([label, value]) => ({ label, value })),
    topProducts: [...productTotals.entries()]
      .map(([title, v]) => ({ title, ...v }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5),
    byCategory: [...categoryTotals.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue),
    byStatus: [...statusCounts.entries()].map(([status, count]) => ({
      status,
      count,
    })),
  };
}

export const STATUS_LABELS: Record<string, string> = {
  new: "Новый",
  processing: "В обработке",
  shipped: "Отправлен",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

export const STATUS_FLOW = ["new", "processing", "shipped", "delivered", "cancelled"];
