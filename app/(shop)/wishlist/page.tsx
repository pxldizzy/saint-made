import WishlistGrid from "@/components/WishlistGrid";

export const metadata = { title: "Избранное" };

export default function WishlistPage() {
  return (
    <div className="container-sm pt-[120px]">
      <h1 className="text-h2 uppercase">Избранное</h1>
      <div className="mt-[60px]">
        <WishlistGrid />
      </div>
    </div>
  );
}
