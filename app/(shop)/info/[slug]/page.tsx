import { notFound } from "next/navigation";

/** Text pages linked from the footer — same type scale as the macket. */
const PAGES: Record<string, { title: string; blocks: string[] }> = {
  delivery: {
    title: "Политика доставки",
    blocks: [
      "Доставка по России — курьерской службой и Почтой России. Отправляем заказы в течение 1–2 рабочих дней после подтверждения.",
      "Москва и Санкт-Петербург — курьер 1–2 дня, бесплатно при заказе от 10 000 ₽.",
      "Другие города — 3–7 дней, стоимость рассчитывается при подтверждении заказа.",
      "Примерка при курьере доступна для заказов с предоплатой.",
    ],
  },
  returns: {
    title: "Политика возврата",
    blocks: [
      "Вернуть товар надлежащего качества можно в течение 14 дней с момента получения, если сохранены товарный вид, бирки и упаковка.",
      "Для возврата напишите на sm@saintmade.ru — мы пришлём бланк и согласуем способ отправки.",
      "Деньги возвращаются на карту, с которой была оплата, в течение 10 рабочих дней после получения товара.",
      "Товар с браком меняем или возвращаем полную стоимость, включая доставку.",
    ],
  },
  terms: {
    title: "Положения и условия, политика конфиденциальности",
    blocks: [
      "Оформляя заказ, вы соглашаетесь с условиями продажи и обработкой персональных данных.",
      "Мы собираем имя, телефон, e-mail и адрес доставки — только для выполнения заказа и связи с вами.",
      "Данные не передаются третьим лицам, кроме служб доставки, и хранятся не дольше, чем требуется законом.",
      "Отозвать согласие на обработку данных можно письмом на sm@saintmade.ru.",
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: PAGES[slug]?.title ?? "Информация" };
}

export default async function InfoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();

  return (
    <article className="container-sm max-w-[870px] pt-[120px]">
      <h1 className="text-h2 uppercase">{page.title}</h1>
      <div className="mt-[60px] flex flex-col gap-[30px]">
        {page.blocks.map((text) => (
          <p key={text} className="text-[20px] leading-[27.3px] font-medium">
            {text}
          </p>
        ))}
      </div>
    </article>
  );
}
