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
      {/* Title, tabs and content share one left edge — nothing is indented. */}
      <h1 className="text-h2 uppercase">Личный кабинет</h1>

      <div className="mt-[40px]">
        <AccountNav />
      </div>

      <div className="mt-[50px]">{children}</div>
    </div>
  );
}
