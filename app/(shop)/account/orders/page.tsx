import Link from "next/link";
import OrderCard from "@/components/account/OrderCard";
import { getUserOrders } from "@/lib/account";
import { getCurrentUser } from "@/lib/auth-server";
import { STATUS_FLOW, STATUS_LABELS } from "@/lib/stats";

export const dynamic = "force-dynamic";
export const metadata = { title: "Мои заказы" };

export default async function AccountOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = (await getCurrentUser())!;
  const { status } = await searchParams;
  const active = STATUS_FLOW.includes(status ?? "") ? status : undefined;

  const all = await getUserOrders(user);
  const orders = active ? all.filter((o) => o.status === active) : all;

  const counts = STATUS_FLOW.map((s) => ({
    status: s,
    count: all.filter((o) => o.status === s).length,
  })).filter((s) => s.count > 0);

  return (
    <div>
      <h2 className="text-h3 uppercase">Мои заказы</h2>

      {counts.length > 0 && (
        <nav aria-label="Фильтр по статусу" className="mt-[24px]">
          <ul className="flex flex-wrap gap-[30px]">
            <li>
              <Link
                href="/account/orders"
                data-active={!active}
                className={`link-underline text-body font-bold uppercase transition-colors duration-300 ${
                  active ? "text-ash hover:text-graphite" : "text-graphite"
                }`}
              >
                Все ({all.length})
              </Link>
            </li>
            {counts.map((s) => (
              <li key={s.status}>
                <Link
                  href={`/account/orders?status=${s.status}`}
                  data-active={active === s.status}
                  className={`link-underline text-body font-bold uppercase transition-colors duration-300 ${
                    active === s.status ? "text-graphite" : "text-ash hover:text-graphite"
                  }`}
                >
                  {STATUS_LABELS[s.status]} ({s.count})
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {orders.length === 0 ? (
        <div className="mt-[30px] border-2 border-line p-[30px]">
          <p className="text-body text-ash uppercase">
            {all.length === 0
              ? "Заказов пока нет."
              : "В этом статусе заказов нет."}
          </p>
          <Link href="/catalog" className="btn-base btn-solid mt-[24px]">
            В каталог
          </Link>
        </div>
      ) : (
        <div className="mt-[30px] flex flex-col gap-[30px]">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
