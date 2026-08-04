import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { hashPassword } from "../lib/password";
import { normalizePhone } from "../lib/phone";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL не задан");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const SECTIONS = [
  { slug: "men", name: "Мужское" },
  { slug: "women", name: "Женское" },
  { slug: "shoes", name: "Обувь" },
];

/** Catalog tabs from the macket (frame CATALOG 4, "Group 15"). */
const TABS = [
  "Футболки",
  "Пиджаки и рубашки",
  "Костюмы",
  "Трикотаж",
  "Верхняя одежда",
  "Брюки",
  "Аксессуары",
];

const COLORS = [
  { color: "Черный", colorHex: "#1c1c1c" },
  { color: "Слоновая кость", colorHex: "#efe9dd" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const GALLERY = [
  "/img/product-1.webp",
  "/img/product-2.webp",
  "/img/product-3.webp",
  "/img/product-4.webp",
];

const DETAIL_GALLERY = [
  "/img/product-main.webp",
  "/img/product-alt-1.webp",
  "/img/product-alt-2.webp",
  "/img/product-alt-3.webp",
];

const TITLES = [
  "Куртка Number 010",
  "Пальто Saint 004",
  "Костюм Monogram 021",
  "Рубашка Ivory 007",
  "Трикотаж Winter 015",
  "Брюки Straight 032",
  "Бомбер Number 011",
  "Худи Saint 019",
  "Пиджак Classic 002",
  "Свитер Wool 026",
  "Жилет Number 044",
  "Парка Saint 051",
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-|-$/g, "")
    .replace(/[а-яё]/g, (ch) => {
      const map: Record<string, string> = {
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
        з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
        п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
        ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
        я: "ya",
      };
      return map[ch] ?? ch;
    });

async function main() {
  await prisma.user.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const sections = [];
  for (const [i, s] of SECTIONS.entries()) {
    sections.push(
      await prisma.category.create({
        data: { slug: s.slug, name: s.name, sortOrder: i },
      }),
    );
  }

  const tabs = [];
  for (const section of sections) {
    for (const [i, name] of TABS.entries()) {
      tabs.push(
        await prisma.category.create({
          data: {
            slug: `${section.slug}-${slugify(name)}`,
            name,
            sortOrder: i,
            parent: { connect: { id: section.id } },
          },
        }),
      );
    }
  }

  const products = [];
  for (const [i, title] of TITLES.entries()) {
    const category = tabs[i % tabs.length];
    const detail = i % 3 === 0;
    const images = detail ? DETAIL_GALLERY : [GALLERY[i % 4], GALLERY[(i + 1) % 4]];

    products.push(
      await prisma.product.create({
        data: {
          slug: slugify(title),
          title,
          description:
            "Артикул: М-019-084\nСостав: 50% акрил 28% нейлон 22% полиэстер\nРазмер модели: рост 186см - 98/72/91\nРазмер на модели: L",
          price: (8000 + i * 1500) * 100,
          oldPrice: i % 4 === 0 ? (12000 + i * 1500) * 100 : null,
          isNew: i < 4,
          category: { connect: { id: category.id } },
          images: {
            create: images.map((url, sortOrder) => ({
              url,
              alt: title,
              sortOrder,
            })),
          },
          variants: {
            create: COLORS.flatMap((c) =>
              SIZES.map((size) => ({
                ...c,
                size,
                stock: (i + size.length) % 5 === 0 ? 0 : 3 + ((i + size.length) % 8),
              })),
            ),
          },
        },
        include: { variants: true },
      }),
    );
  }

  const CUSTOMERS = [
    { name: "Анна Кузнецова", phone: "+7 916 240-11-08", email: "anna.k@example.com", address: "Москва, ул. Тверская, 12, кв. 45" },
    { name: "Дмитрий Соколов", phone: "+7 903 118-77-52", email: "d.sokolov@example.com", address: "Санкт-Петербург, Невский пр., 88, кв. 3" },
    { name: "Мария Орлова", phone: "+7 925 776-04-19", email: "m.orlova@example.com", address: "Казань, ул. Баумана, 5, кв. 21" },
    { name: "Игорь Лебедев", phone: "+7 962 330-58-41", email: "igor.l@example.com", address: "Екатеринбург, ул. Ленина, 40, кв. 8" },
    { name: "Ольга Никитина", phone: "+7 911 004-92-36", email: "o.nikitina@example.com", address: "Новосибирск, Красный пр., 17, кв. 62" },
  ];

  const STATUSES = ["new", "processing", "shipped", "delivered", "cancelled"];
  const day = 24 * 60 * 60 * 1000;

  for (let i = 0; i < 24; i++) {
    const customer = CUSTOMERS[i % CUSTOMERS.length];
    const createdAt = new Date(Date.now() - Math.floor(i * 2.6) * day);
    const picked = [products[i % products.length], products[(i * 5 + 3) % products.length]];

    const items = picked.map((product, n) => {
      const variant = product.variants[(i + n) % product.variants.length];
      return {
        product: { connect: { id: product.id } },
        title: product.title,
        size: variant.size,
        color: variant.color,
        price: product.price,
        qty: 1 + ((i + n) % 2),
      };
    });

    await prisma.order.create({
      data: {
        ...customer,
        comment: i % 6 === 0 ? "Позвонить за час до доставки" : "",
        // Offset so a customer does not always land on the same status.
        status: STATUSES[(i + Math.floor(i / STATUSES.length)) % STATUSES.length],
        total: items.reduce((sum, it) => sum + it.price * it.qty, 0),
        createdAt,
        updatedAt: createdAt,
        items: { create: items },
      },
    });
  }

  // Demo account — its e-mail matches the first seeded customer, so the
  // personal cabinet shows real orders.
  await prisma.user.create({
    data: {
      name: CUSTOMERS[0].name,
      email: CUSTOMERS[0].email,
      phone: normalizePhone(CUSTOMERS[0].phone),
      passwordHash: await hashPassword("demo12345"),
    },
  });

  const [categories, productCount, orders] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.order.count(),
  ]);
  console.log(
    `seeded: ${categories} categories, ${productCount} products, ${orders} orders`,
  );
  console.log(`demo account: ${CUSTOMERS[0].email} / demo12345`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
