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

      {/* Sidebar 300 + 60 gutter leaves 1410 for content — exactly four
          330px tiles with the site's 30px gutters. */}
      <div className="mt-[50px] grid gap-[30px] xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-x-[60px]">
        {/* Optical offset: aligns the first link with the section heading. */}
        <div className="xl:pt-[14px]">
          <AccountNav />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
