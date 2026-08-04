import { InstagramIcon, TelegramIcon, VkIcon } from "@/components/icons";

export const metadata = { title: "Контакты" };

const BLOCKS = [
  {
    title: "Шоурум",
    lines: ["Москва, Столешников пер., 14", "Ежедневно 11:00 — 21:00"],
  },
  {
    title: "Связь",
    lines: ["+7 495 000-00-00", "sm@saintmade.ru"],
  },
  {
    title: "Сотрудничество",
    lines: ["press@saintmade.ru", "Оптовые заказы и коллаборации"],
  },
];

const SOCIALS = [
  { href: "https://instagram.com", label: "Instagram", Icon: InstagramIcon },
  { href: "https://vk.com", label: "ВКонтакте", Icon: VkIcon },
  { href: "https://telegram.org", label: "Telegram", Icon: TelegramIcon },
];

export default function ContactsPage() {
  return (
    <div className="container-sm pt-[120px]">
      <h1 className="text-h2 uppercase">Контакты</h1>

      <div className="mt-[60px] grid gap-[30px] md:grid-cols-2 xl:grid-cols-3">
        {BLOCKS.map((block) => (
          <section key={block.title} className="border-2 border-graphite p-[30px]">
            <h2 className="text-column-title text-graphite">{block.title}</h2>
            <ul className="mt-[20px] flex flex-col gap-[10px]">
              {block.lines.map((line) => (
                <li
                  key={line}
                  className="text-[20px] leading-[27.3px] font-medium"
                >
                  {line}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <h2 className="text-column-title mt-[60px] text-graphite">Мы в соцсетях</h2>
      <ul className="mt-[20px] flex gap-[30px]">
        {SOCIALS.map(({ href, label, Icon }) => (
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
  );
}
