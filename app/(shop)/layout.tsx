import Footer from "@/components/Footer";
import Header, { type NavItem } from "@/components/Header";
import { prisma } from "@/lib/prisma";

// The header menu comes from the database, so nothing in the storefront is
// prerendered at build time — the build never needs a live database.
export const dynamic = "force-dynamic";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sections = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true },
  });

  const nav: NavItem[] = [
    ...sections.map((s) => ({ href: `/catalog/${s.slug}`, label: s.name })),
    { href: "/lookbook", label: "Lookbook" },
  ];

  return (
    <>
      <Header nav={nav} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
