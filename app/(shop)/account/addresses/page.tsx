import { deleteAddress, setDefaultAddress } from "@/app/(shop)/account/actions";
import AddressForm from "@/components/account/AddressForm";
import { getCurrentUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Адреса доставки" };

export default async function AccountAddressesPage() {
  const user = (await getCurrentUser())!;

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return (
    <div>
      <h2 className="text-h3 uppercase">Адреса доставки</h2>
      <p className="text-body mt-[10px] text-ash uppercase">
        Адрес по умолчанию подставляется при оформлении заказа.
      </p>

      {addresses.length > 0 && (
        <ul className="mt-[30px] grid gap-[30px] sm:grid-cols-2">
          {addresses.map((address) => (
            <li
              key={address.id}
              className={`border-2 p-[24px] ${
                address.isDefault ? "border-graphite" : "border-line"
              }`}
            >
              <div className="flex items-start justify-between gap-[16px]">
                <h3 className="text-[20px] leading-[27.3px] font-bold uppercase">
                  {address.title || "Адрес"}
                </h3>
                {address.isDefault && (
                  <span className="bg-graphite px-[10px] py-[4px] text-[12px] leading-[19.1px] font-bold text-paper uppercase">
                    По умолчанию
                  </span>
                )}
              </div>

              <p className="text-body mt-[12px] uppercase">
                {[
                  address.city,
                  address.street,
                  address.apartment && `кв. ${address.apartment}`,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              {address.comment && (
                <p className="text-body mt-[8px] text-ash">{address.comment}</p>
              )}

              <div className="mt-[20px] flex flex-wrap gap-[20px]">
                {!address.isDefault && (
                  <form action={setDefaultAddress}>
                    <input type="hidden" name="id" value={address.id} />
                    <button
                      type="submit"
                      className="link-underline text-[14px] leading-[19.1px] font-bold uppercase"
                    >
                      Сделать основным
                    </button>
                  </form>
                )}
                <form action={deleteAddress}>
                  <input type="hidden" name="id" value={address.id} />
                  <button
                    type="submit"
                    className="link-underline text-[14px] leading-[19.1px] font-bold text-ash uppercase transition-colors duration-300 hover:text-ink"
                  >
                    Удалить
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-[30px]">
        <AddressForm />
      </div>
    </div>
  );
}
