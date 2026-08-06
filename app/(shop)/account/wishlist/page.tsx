import WishlistGrid from "@/components/WishlistGrid";

export const metadata = { title: "Избранное" };

export default function AccountWishlistPage() {
  return (
    <div>
      <h2 className="text-h3 uppercase">Избранное</h2>
      <div className="mt-[30px]">
        <WishlistGrid />
      </div>
    </div>
  );
}
