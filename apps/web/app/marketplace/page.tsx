import { MarketplaceGrid } from "@/components/marketplace/MarketplaceGrid";

export default function MarketplacePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium tracking-tight text-stone-800">Marketplace</h1>
      <MarketplaceGrid />
    </div>
  );
}
