import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { formatDate, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { STATUS_LABELS } from "@/lib/stats";

export const dynamic = "force-dynamic";
export const metadata = { title: "Личный кабинет" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  // Orders are matched by e-mail: checkout does not require an account.
  const orders = await prisma.order.findMany({
    where: { email: user.email },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const rows = [
    { label: "Имя", value: user.name },
    { label: "E-mail", value: user.email },
    { label: "Телефон", value: user.phone || "—" },
    { label: "С нами с", value: formatDate(user.createdAt) },
  ];

  return (
    <div className="container-sm pt-[120px]">
      <div className="flex flex-wrap items-baseline justify-between gap-[20px]">
        <h1 className="text-h2 uppercase">Личный кабинет</h1>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="link-underline text-[16px] leading-[21.9px] font-bold text-ash uppercase transition-colors duration-300 hover:text-ink"
          >
            Выйти
          </button>
        </form>
      </div>

      <dl className="mt-[60px] grid gap-[30px] sm:grid-cols-2 xl:grid-cols-4">
        {rows.map((row) => (
          <div key={row.label} className="border-2 border-graphite p-[24px]">
            <dt className="text-body text-ash uppercase">{row.label}</dt>
            <dd className="mt-[8px] text-[20px] leading-[27.3px] font-bold break-words">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <h2 className="text-column-title mt-[60px] text-graphite">Мои заказы</h2>

      {orders.length === 0 ? (
        <div className="mt-[30px]">
          <p className="text-body text-ash uppercase">
            Здесь появятся заказы, оформленные на {user.email}.
          </p>
          <Link href="/catalog" className="btn-base btn-solid mt-[30px]">
            В каталог
          </Link>
        </div>
      ) : (
        <ul className="mt-[30px] flex flex-col gap-[20px]">
          {orders.map((order) => (
            <li key={order.id} className="border-2 border-graphite p-[24px]">
              <div className="flex flex-wrap items-baseline justify-between gap-[20px]">
                <p className="text-[20px] leading-[27.3px] font-bold uppercase">
                  Заказ №{order.id} · {formatDate(order.createdAt)}
                </p>
                <p className="text-body font-bold uppercase">
                  {STATUS_LABELS[order.status] ?? order.status} ·{" "}
                  {formatPrice(order.total)}
                </p>
              </div>
              <ul className="mt-[16px] flex flex-col gap-[8px]">
                {order.items.map((item) => (
                  <li key={item.id} className="text-body text-ash uppercase">
                    {item.title} · {item.color} · {item.size} × {item.qty}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
