"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { BagIcon, HeartIcon, UserIcon } from "./icons";

export type NavItem = { href: string; label: string };

/**
 * Macket: logo 128×65 centred at y=30, nav 20px/500 on the left starting at
 * x=75 with 70px gaps, three icons on the right ending at x=1845.
 */
export default function Header({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="relative z-50 bg-paper">
      <div className="container-sm grid h-[125px] grid-cols-[auto_1fr_auto] items-center gap-[20px] xl:grid-cols-[1fr_auto_1fr]">
        <button
          type="button"
          className="flex h-8 w-8 flex-col justify-center gap-[6px] xl:hidden"
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span
            className={`block h-[2px] w-8 bg-ink transition-transform duration-300 ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-8 bg-ink transition-opacity duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-8 bg-ink transition-transform duration-300 ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>

        <nav aria-label="Основное меню" className="hidden min-w-0 xl:block">
          <ul className="flex gap-[40px] 2xl:gap-[70px]">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href.split("?")[0]);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    data-active={active}
                    className="link-underline text-nav uppercase transition-opacity duration-300 hover:opacity-70"
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Link
          href="/"
          aria-label="SAINT MADE — на главную"
          className="justify-self-center transition-opacity duration-300 hover:opacity-70"
        >
          {/* Macket puts the logo in a 128×65 box with STRETCH, which squashes
              the artwork; we keep the 65px height and the natural ratio. */}
          <Image
            src="/img/logo.png"
            alt="SAINT MADE"
            width={512}
            height={397}
            priority
            className="h-[52px] w-auto sm:h-[65px]"
          />
        </Link>

        <div className="flex items-center justify-self-end gap-[30px] sm:gap-[50px]">
          <Link
            href="/cart"
            aria-label={`Корзина${ready && count ? `, товаров: ${count}` : ""}`}
            className="relative transition-transform duration-300 hover:-translate-y-0.5"
          >
            <BagIcon className="h-[28px] w-[26px]" />
            {ready && count > 0 && (
              <span className="absolute -top-2 -right-3 flex h-5 min-w-5 items-center justify-center bg-graphite px-1 text-[11px] leading-none font-bold text-paper">
                {count}
              </span>
            )}
          </Link>
          <Link
            href="/wishlist"
            aria-label="Избранное"
            className="hidden transition-transform duration-300 hover:-translate-y-0.5 sm:block"
          >
            <HeartIcon className="h-[27px] w-[30px]" />
          </Link>
          <Link
            href="/account"
            aria-label="Личный кабинет"
            className="hidden transition-transform duration-300 hover:-translate-y-0.5 sm:block"
          >
            <UserIcon className="h-[28px] w-[26px]" />
          </Link>
        </div>
      </div>

      {/* Mobile menu — same type scale, slides down */}
      <div
        className={`fixed inset-x-0 top-[125px] bottom-0 z-40 origin-top bg-paper transition-all duration-400 ease-[var(--ease-brand)] xl:hidden ${
          menuOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-4 opacity-0"
        }`}
      >
        <nav aria-label="Мобильное меню" className="container-sm py-10">
          <ul className="flex flex-col gap-8">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  className="text-h2 uppercase"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-4 border-t border-line pt-8">
              <Link href="/account" onClick={closeMenu} className="text-nav uppercase">
                Личный кабинет
              </Link>
            </li>
            <li>
              <Link href="/wishlist" onClick={closeMenu} className="text-nav uppercase">
                Избранное
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
