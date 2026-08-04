import CheckoutForm from "@/components/CheckoutForm";
import { getCurrentUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Оформление заказа" };

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  const addresses = user
    ? await prisma.address.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
        select: {
          id: true,
          title: true,
          city: true,
          street: true,
          apartment: true,
          isDefault: true,
        },
      })
    : [];

  return (
    <CheckoutForm
      user={user ? { name: user.name, email: user.email, phone: user.phone } : null}
      addresses={addresses}
    />
  );
}
