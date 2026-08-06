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

/** Horizontal tabs under the page title; scrolls sideways on narrow screens. */
export default function AccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Разделы кабинета" className="border-b border-line">
      <ul className="-mb-px flex items-center gap-[40px] overflow-x-auto">
        {LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`block border-b-2 pb-[16px] text-[20px] leading-[27.3px] font-bold whitespace-nowrap uppercase transition-colors duration-300 ${
                  active
                    ? "border-graphite text-graphite"
                    : "border-transparent text-ash hover:text-graphite"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}

        <li className="ml-auto shrink-0 pl-[40px]">
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="block border-b-2 border-transparent pb-[16px] text-[20px] leading-[27.3px] font-bold whitespace-nowrap text-ash uppercase transition-colors duration-300 hover:text-ink"
            >
              Выйти
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
