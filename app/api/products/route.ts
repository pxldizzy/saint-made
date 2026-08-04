import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productCardSelect } from "@/lib/queries";

/** Resolves a list of product ids (used by the localStorage-backed wishlist). */
export async function GET(request: Request) {
  const ids = new URL(request.url).searchParams.getAll("id").slice(0, 100);
  if (ids.length === 0) return NextResponse.json([]);

  const products = await prisma.product.findMany({
    where: { id: { in: ids }, isHidden: false },
    select: productCardSelect,
  });

  return NextResponse.json(products);
}
