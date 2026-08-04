import Link from "next/link";
import NewsletterForm from "./NewsletterForm";
import { InstagramIcon, TelegramIcon, VkIcon } from "./icons";

const support = [
  { href: "/contacts", label: "Контакты" },
  { href: "/info/delivery", label: "Политика доставки" },
  { href: "/info/terms", label: "Положения и условия\nполитики конфиденциальности" },
  { href: "/info/returns", label: "Политика возврата" },
];

const shop = [
  { href: "/catalog?sort=new", label: "Сезоны" },
  { href: "/catalog", label: "Категории" },
  { href: "/catalog?sort=new", label: "Новые поступления" },
  { href: "/lookbook", label: "Коллекции" },
  { href: "/about", label: "О нас" },
];

const socials = [
  { href: "https://instagram.com", label: "Instagram", Icon: InstagramIcon },
  { href: "https://vk.com", label: "ВКонтакте", Icon: VkIcon },
  { href: "https://telegram.org", label: "Telegram", Icon: TelegramIcon },
];

/**
 * Macket columns sit at x = 75 / 525 / 825 / 1425 inside the 1770 container,
 * i.e. widths 450 / 300 / 600 / 420. Link size scales down a little below
 * 1920 so the labels never wrap into two ragged lines.
 */
const linkClass =
  "link-underline inline-block text-[clamp(16px,1.04vw,20px)] leading-[1.366] font-bold text-slate uppercase transition-colors duration-300 hover:text-ink";

export default function Footer() {
  return (
    <footer className="mt-[200px] pb-[100px]">
      <div className="container-sm grid items-start gap-x-[30px] gap-y-[60px] sm:grid-cols-2 xl:grid-cols-[minmax(0,450fr)_minmax(0,300fr)_minmax(0,600fr)_minmax(0,420fr)] xl:gap-x-0">
        <nav aria-labelledby="footer-support">
          <h2 id="footer-support" className="text-column-title text-slate">
            Поддержка
          </h2>
          <ul className="mt-[20px] flex flex-col gap-[20px]">
            {support.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={`${linkClass} whitespace-pre-line`}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-shop">
          <h2 id="footer-shop" className="text-column-title text-slate">
            Магазин
          </h2>
          <ul className="mt-[20px] flex flex-col gap-[20px]">
            {shop.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex h-full flex-col">
          <p className="text-column-title max-w-[420px] text-graphite">
            Подпишитесь чтобы получать обновления, доступ к эксклюзивным
            предложениям и многому другому.
          </p>
          <ul className="mt-[57px] flex gap-[30px] xl:justify-center">
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="flex h-[60px] w-[60px] items-center justify-center bg-graphite text-paper transition-transform duration-300 hover:-translate-y-1 hover:bg-ink"
                >
                  <Icon className="h-[30px] w-[30px]" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* @container + cqi: the copyright shrinks with the column, so the
            single line never grows wider than the subscribe block above it. */}
        <div className="@container flex h-full max-w-[420px] flex-col">
          <NewsletterForm />
          <p className="mt-[40px] text-[min(14px,4cqi)] leading-[1.366] font-bold whitespace-nowrap text-ash xl:mt-auto xl:text-center">
            © 2022 - {new Date().getFullYear()} SaintMade - All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
