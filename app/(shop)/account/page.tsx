import Link from "next/link";
import OrderCard from "@/components/account/OrderCard";
import { getUserOrders } from "@/lib/account";
import { getCurrentUser } from "@/lib/auth-server";
import { formatDate, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AccountOverviewPage() {
  const user = (await getCurrentUser())!;

  const [orders, defaultAddress] = await Promise.all([
    getUserOrders(user),
    prisma.address.findFirst({ where: { userId: user.id, isDefault: true } }),
  ]);

  const paid = orders.filter((o) => o.status !== "cancelled");
  const active = orders.filter(
    (o) => o.status === "new" || o.status === "processing" || o.status === "shipped",
  );
  const spent = paid.reduce((sum, o) => sum + o.total, 0);

  const tiles = [
    { label: "Всего заказов", value: String(orders.length) },
    { label: "В работе", value: String(active.length) },
    { label: "Куплено на", value: formatPrice(spent) },
    { label: "С нами с", value: formatDate(user.createdAt) },
  ];

  return (
    <div>
      <h2 className="text-h3 uppercase">Здравствуйте, {user.name.split(" ")[0]}</h2>

      <dl className="mt-[30px] grid gap-[30px] sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="border-2 border-graphite p-[20px]">
            <dt className="text-[14px] leading-[19.1px] text-ash uppercase">
              {tile.label}
            </dt>
            <dd className="mt-[8px] text-[24px] leading-[32.8px] font-bold">
              {tile.value}
            </dd>
          </div>
        ))}
      </dl>

      <section className="mt-[50px]">
        <div className="flex flex-wrap items-baseline justify-between gap-[16px]">
          <h3 className="text-column-title text-graphite">
            {active.length > 0 ? "Текущий заказ" : "Последний заказ"}
          </h3>
          {orders.length > 1 && (
            <Link
              href="/account/orders"
              className="link-underline text-body font-bold uppercase"
            >
              Все заказы
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="mt-[30px] border-2 border-line p-[30px]">
            <p className="text-body text-ash uppercase">
              Заказов пока нет. Всё, что вы купите, появится здесь — со статусом
              доставки и составом.
            </p>
            <Link href="/catalog" className="btn-base btn-solid mt-[24px]">
              В каталог
            </Link>
          </div>
        ) : (
          <div className="mt-[30px]">
            <OrderCard order={active[0] ?? orders[0]} />
          </div>
        )}
      </section>

      <section className="mt-[50px]">
        <div className="flex flex-wrap items-baseline justify-between gap-[16px]">
          <h3 className="text-column-title text-graphite">Адрес доставки</h3>
          <Link
            href="/account/addresses"
            className="link-underline text-body font-bold uppercase"
          >
            {defaultAddress ? "Изменить" : "Добавить"}
          </Link>
        </div>
        <p className="text-body mt-[30px] uppercase">
          {defaultAddress
            ? [
                defaultAddress.city,
                defaultAddress.street,
                defaultAddress.apartment && `кв. ${defaultAddress.apartment}`,
              ]
                .filter(Boolean)
                .join(", ")
            : "Не указан — добавьте, чтобы не вводить его при каждом заказе."}
        </p>
      </section>
    </div>
  );
}
