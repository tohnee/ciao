"use client";

import { create } from "zustand";
import type { MarketplaceListingCard, CreateListingInput } from "@ciao/shared";

type MarketplaceState = {
  listings: MarketplaceListingCard[];
  loading: boolean;
  error: string | null;
  fetchListings: () => Promise<void>;
  createListing: (input: CreateListingInput & { agentId: string }) => Promise<void>;
  purchaseListing: (listingId: string) => Promise<void>;
};

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  listings: [],
  loading: false,
  error: null,
  fetchListings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/marketplace");
      const data = await res.json();
      set({ listings: data.listings, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  createListing: async (input: CreateListingInput & { agentId: string }) => {
    const res = await fetch("/api/marketplace", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to create listing");
    const listRes = await fetch("/api/marketplace");
    const listData = await listRes.json();
    set({ listings: listData.listings });
  },
  purchaseListing: async (listingId: string) => {
    const res = await fetch(`/api/marketplace/${listingId}`, { method: "POST" });
    if (!res.ok) throw new Error("Purchase failed");
    set((state) => ({
      listings: state.listings.filter((l) => l.id !== listingId),
    }));
  },
}));
