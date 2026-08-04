import { prisma } from "./prisma";

/**
 * Orders of a signed-in visitor: those placed while logged in plus guest
 * orders made with the same e-mail.
 */
export function ordersOf(user: { id: string; email: string | null }) {
  return {
    OR: [{ userId: user.id }, ...(user.email ? [{ email: user.email }] : [])],
  };
}

export const orderCardInclude = {
  items: {
    include: {
      product: {
        select: {
          slug: true,
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
    },
  },
} as const;

export async function getUserOrders(user: { id: string; email: string | null }) {
  return prisma.order.findMany({
    where: ordersOf(user),
    orderBy: { createdAt: "desc" },
    include: orderCardInclude,
  });
}
