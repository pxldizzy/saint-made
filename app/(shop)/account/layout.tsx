import { redirect } from "next/navigation";
import AccountNav from "@/components/account/AccountNav";
import { getCurrentUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Личный кабинет" };

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  return (
    <div className="container-sm pt-[120px]">
      <h1 className="text-h2 uppercase">Личный кабинет</h1>

      {/* Site grid: nav takes one 420 column, content the other three. */}
      <div className="mt-[50px] grid gap-[30px] xl:grid-cols-[420fr_1320fr]">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
