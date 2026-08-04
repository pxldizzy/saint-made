"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/account", label: "Обзор", exact: true },
  { href: "/account/orders", label: "Мои заказы" },
  { href: "/account/wishlist", label: "Избранное" },
  { href: "/account/addresses", label: "Адреса доставки" },
  { href: "/account/profile", label: "Профиль" },
];

/** Sidebar on desktop, a scrollable row on narrow screens. */
export default function AccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Разделы кабинета">
      <ul className="flex gap-x-[30px] gap-y-[20px] overflow-x-auto pb-[10px] xl:flex-col xl:overflow-visible xl:pb-0">
        {LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                data-active={active}
                aria-current={active ? "page" : undefined}
                className={`link-underline text-[20px] leading-[27.3px] font-bold whitespace-nowrap uppercase transition-colors duration-300 hover:text-graphite ${
                  active ? "text-graphite" : "text-ash"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
        <li className="shrink-0 xl:mt-[20px] xl:border-t xl:border-line xl:pt-[20px]">
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="link-underline text-[20px] leading-[27.3px] font-bold whitespace-nowrap text-ash uppercase transition-colors duration-300 hover:text-ink"
            >
              Выйти
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
