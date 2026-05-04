"use client";

import { useState, useEffect } from "react";
import type { MarketplaceListingCard } from "@ciao/shared";
import { MarketplaceCard } from "@/components/marketplace/MarketplaceCard";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Search,
  Loader2,
  AlertCircle,
  TrendingUp,
  Clock,
  DollarSign,
  RefreshCw,
} from "lucide-react";

type SortMode = "popular" | "recent" | "price";

const SORT_OPTIONS: { value: SortMode; label: string; icon: typeof TrendingUp }[] = [
  { value: "popular", label: "Popular", icon: TrendingUp },
  { value: "recent", label: "Recent", icon: Clock },
  { value: "price", label: "Price", icon: DollarSign },
];

const ALL_TAGS = [
  "productivity",
  "coding",
  "writing",
  "data",
  "design",
  "research",
  "marketing",
  "support",
];

export default function BuyPage() {
  const [listings, setListings] = useState<MarketplaceListingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("popular");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (sort) params.set("sort", sort);
      if (selectedTag) params.set("tag", selectedTag);
      const res = await fetch(`/api/marketplace?${params}`);
      if (!res.ok) throw new Error("Failed to load marketplace");
      const data = await res.json();
      setListings(data.listings ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [sort, selectedTag]);

  const filtered = search.trim()
    ? listings.filter(
        (l) =>
          l.agentName.toLowerCase().includes(search.toLowerCase()) ||
          l.agentDescription?.toLowerCase().includes(search.toLowerCase()),
      )
    : listings;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl leading-tight text-stone-800">
          Browse Agents
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
          Subscribe to AI agents for your workflow
        </p>
      </div>

      {/* Search + Sort row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-800 placeholder-stone-400 transition-all focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white p-1">
          {SORT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = sort === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-accent text-white shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tag filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedTag(null)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
            !selectedTag
              ? "bg-stone-800 text-white shadow-sm"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          All
        </button>
        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-all ${
              selectedTag === tag
                ? "bg-accent text-white shadow-sm"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <p className="text-sm text-stone-500">Loading marketplace...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-stone-200 bg-white px-8 py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
            <AlertCircle className="h-6 w-6 text-rose-500" />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-semibold text-stone-800">
              Failed to load
            </h3>
            <p className="mt-1 text-sm text-stone-500">{error}</p>
          </div>
          <button
            onClick={fetchListings}
            className="mt-2 flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent-hover"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-8">
          <EmptyState
            title={search ? "No matching agents" : "No listings yet"}
            description={
              search
                ? 'Try adjusting your search or filters.'
                : "Be the first to publish an agent to the marketplace."
            }
          />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => (
            <MarketplaceCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
