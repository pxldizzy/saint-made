import ProfileForms from "@/components/account/ProfileForms";
import { getCurrentUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Профиль" };

export default async function AccountProfilePage() {
  const user = (await getCurrentUser())!;

  return (
    <div>
      <h2 className="text-h3 uppercase">Профиль</h2>
      <p className="text-body mt-[10px] text-ash uppercase">
        Эти данные подставляются при оформлении заказа.
      </p>

      <div className="mt-[30px]">
        <ProfileForms
          user={{ name: user.name, email: user.email, phone: user.phone }}
        />
      </div>
    </div>
  );
}
