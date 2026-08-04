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
      <div className="flex flex-wrap items-baseline justify-between gap-[20px]">
        <h1 className="text-h2 uppercase">Личный кабинет</h1>
        <p className="text-body text-ash uppercase">{user.name}</p>
      </div>

      <div className="mt-[50px] grid gap-[30px] xl:grid-cols-[270px_minmax(0,1fr)] xl:gap-[120px]">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
