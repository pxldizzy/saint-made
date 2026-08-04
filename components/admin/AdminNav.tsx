"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Дашборд", exact: true },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/categories", label: "Категории" },
  { href: "/admin/orders", label: "Заказы" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Разделы админки">
      <ul className="flex overflow-x-auto lg:flex-col lg:overflow-visible">
        {LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`block px-[24px] py-[14px] text-[16px] leading-[21.9px] font-bold uppercase transition-colors duration-200 ${
                  active
                    ? "bg-paper text-graphite"
                    : "text-muted hover:bg-ink hover:text-paper"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
