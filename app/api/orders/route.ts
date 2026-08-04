import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

type IncomingLine = {
  productId?: unknown;
  size?: unknown;
  color?: unknown;
  qty?: unknown;
};

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/**
 * Creates an order. Prices and stock always come from the database — the
 * client only says *what* it wants, never how much it costs.
 */
export async function POST(request: Request) {
  let body: {
    name?: unknown;
    phone?: unknown;
    email?: unknown;
    address?: unknown;
    comment?: unknown;
    lines?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const name = str(body.name, 120);
  const phone = str(body.phone, 40);
  const email = str(body.email, 160);
  const address = str(body.address, 400);
  const comment = str(body.comment, 1000);

  if (name.length < 2) {
    return NextResponse.json({ error: "Укажите имя" }, { status: 400 });
  }
  if (phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ error: "Укажите телефон" }, { status: 400 });
  }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Некорректный e-mail" }, { status: 400 });
  }
  if (address.length < 5) {
    return NextResponse.json({ error: "Укажите адрес доставки" }, { status: 400 });
  }

  const rawLines = Array.isArray(body.lines) ? (body.lines as IncomingLine[]) : [];
  if (rawLines.length === 0 || rawLines.length > 50) {
    return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
  }

  const lines = rawLines.map((l) => ({
    productId: str(l.productId, 40),
    size: str(l.size, 20),
    color: str(l.color, 60),
    qty: Math.min(Math.max(Math.trunc(Number(l.qty) || 0), 1), 20),
  }));

  if (lines.some((l) => !l.productId || !l.size)) {
    return NextResponse.json({ error: "Некорректный состав заказа" }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) }, isHidden: false },
    include: { variants: true },
  });

  type ResolvedItem = {
    product: (typeof products)[number];
    variant: (typeof products)[number]["variants"][number];
    qty: number;
  };
  const items: ResolvedItem[] = [];
  for (const line of lines) {
    const product = products.find((p) => p.id === line.productId);
    if (!product) {
      return NextResponse.json(
        { error: "Товар больше не доступен" },
        { status: 409 },
      );
    }
    const variant = product.variants.find(
      (v) => v.size.toUpperCase() === line.size.toUpperCase() && v.color === line.color,
    );
    if (!variant || variant.stock < line.qty) {
      return NextResponse.json(
        { error: `«${product.title}» — недостаточно на складе` },
        { status: 409 },
      );
    }
    items.push({ product, variant, qty: line.qty });
  }

  const total = items.reduce((sum, it) => sum + it.product.price * it.qty, 0);

  // Link the order to the account when the buyer is signed in.
  const user = await getCurrentUser();

  const order = await prisma.$transaction(async (tx) => {
    for (const it of items) {
      await tx.variant.update({
        where: { id: it.variant.id },
        data: { stock: { decrement: it.qty } },
      });
    }
    return tx.order.create({
      data: {
        ...(user ? { user: { connect: { id: user.id } } } : {}),
        name,
        phone,
        email,
        address,
        comment,
        total,
        items: {
          create: items.map((it) => ({
            product: { connect: { id: it.product.id } },
            title: it.product.title,
            size: it.variant.size,
            color: it.variant.color,
            price: it.product.price,
            qty: it.qty,
          })),
        },
      },
    });
  });

  return NextResponse.json({ id: order.id, total: order.total }, { status: 201 });
}
