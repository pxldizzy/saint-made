import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";

export const metadata = { title: { default: "Админка", template: "%s — админка" } };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      <aside className="bg-graphite text-paper lg:sticky lg:top-0 lg:h-screen lg:w-[260px] lg:shrink-0">
        <div className="flex items-center justify-between p-[24px] lg:block">
          <Link href="/admin" className="text-[20px] leading-[27.3px] font-extrabold uppercase">
            Saint Made
          </Link>
          <p className="hidden text-[14px] leading-[19.1px] text-muted uppercase lg:mt-[4px] lg:block">
            Панель управления
          </p>
        </div>

        <AdminNav />

        <div className="p-[24px]">
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="text-[14px] leading-[19.1px] font-bold text-muted uppercase transition-colors duration-300 hover:text-paper"
            >
              Выйти
            </button>
          </form>
          <Link
            href="/"
            className="mt-[10px] block text-[14px] leading-[19.1px] font-bold text-muted uppercase transition-colors duration-300 hover:text-paper"
          >
            На сайт →
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-[24px] lg:p-[40px]">{children}</main>
    </div>
  );
}
