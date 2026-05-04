"use client";

import { useEffect } from "react";
import type { MarketplaceListingCard } from "@ciao/shared";
import { useMarketplaceStore } from "@/stores/marketplace";
import { MarketplaceCard } from "@/components/marketplace/MarketplaceCard";
import { EmptyState } from "@/components/shared/EmptyState";

export function MarketplaceGrid() {
  const { listings, loading, fetchListings } = useMarketplaceStore();

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  if (loading && listings.length === 0) {
    return <div className="flex items-center justify-center py-16 text-sm text-muted">Loading marketplace...</div>;
  }

  if (listings.length === 0) {
    return <EmptyState title="No listings yet" description="Publish an agent to the marketplace." />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing: MarketplaceListingCard) => (
        <MarketplaceCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
