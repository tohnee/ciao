"use client";

import { useState } from "react";
import Link from "next/link";
import type { MarketplaceListingCard } from "@ciao/shared";
import { Star, Users, Sparkles } from "lucide-react";
import { SubscriptionDialog } from "@/components/marketplace/SubscriptionDialog";

const TIER_COLORS: Record<string, string> = {
  BRONZE: "bg-amber-100 text-amber-800 border-amber-200",
  SILVER: "bg-stone-100 text-stone-700 border-stone-200",
  GOLD: "bg-yellow-50 text-yellow-800 border-yellow-200",
  PLATINUM:
    "bg-gradient-to-r from-sky-50 to-indigo-50 text-indigo-800 border-indigo-200",
};

function TierBadge({ tier }: { tier: string | null }) {
  if (!tier) return null;
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
        TIER_COLORS[tier] ?? TIER_COLORS.BRONZE
      }`}
    >
      <Sparkles className="mr-1 h-2.5 w-2.5" />
      {tier}
    </span>
  );
}

function AgentAvatar({
  name,
  url,
}: {
  name: string;
  url: string | null;
}) {
  const initial = name.charAt(0).toUpperCase();
  // Color based on name hash for variety
  const colors = [
    "bg-rose-100 text-rose-600",
    "bg-sky-100 text-sky-600",
    "bg-amber-100 text-amber-600",
    "bg-emerald-100 text-emerald-600",
    "bg-violet-100 text-violet-600",
    "bg-cyan-100 text-cyan-600",
  ];
  const colorIndex =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    colors.length;

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="h-12 w-12 rounded-xl object-cover"
      />
    );
  }

  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${colors[colorIndex]}`}
    >
      {initial}
    </div>
  );
}

interface MarketplaceCardProps {
  listing: MarketplaceListingCard;
}

export function MarketplaceCard({ listing }: MarketplaceCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [imgError, setImgError] = useState(false);

  const subscriptionPrice =
    listing.weeklyPrice ?? listing.monthlyPrice;
  const subscriptionLabel = listing.weeklyPrice
    ? `${listing.weeklyPrice} cr/wk`
    : listing.monthlyPrice
      ? `${listing.monthlyPrice} cr/mo`
      : null;

  const avatarSrc =
    !imgError && listing.agentAvatarUrl
      ? listing.agentAvatarUrl
      : null;

  return (
    <>
      <Link
        href={`/marketplace/${listing.id}`}
        className="group block animate-fade-in"
      >
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md">
          {/* Top row: avatar + tier */}
          <div className="flex items-start justify-between gap-3">
            <AgentAvatar
              name={listing.agentName}
              url={avatarSrc}
            />
            <TierBadge tier={listing.authorTier} />
          </div>

          {/* Agent info */}
          <div className="mt-3">
            <h3 className="font-serif text-lg leading-tight text-stone-800 transition-colors group-hover:text-accent">
              {listing.agentName}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-stone-500">
              {listing.agentDescription ?? "No description"}
            </p>
          </div>

          {/* Tags */}
          {listing.tags && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {listing.tags.split(",").map((tag) => (
                <span
                  key={tag.trim()}
                  className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-600"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Stats row */}
          <div className="mt-4 flex items-center gap-3 text-xs text-stone-500">
            {listing.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {listing.rating.toFixed(1)}
              </span>
            )}
            {listing.totalSubscribers > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {listing.totalSubscribers}
              </span>
            )}
          </div>

          {/* Bottom row: price + subscribe */}
          <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
            <div>
              {listing.price > 0 && (
                <span className="text-sm text-stone-400 line-through">
                  ${listing.price.toFixed(2)}
                </span>
              )}
              {subscriptionPrice && (
                <span className="ml-2 text-sm font-semibold text-accent">
                  {subscriptionLabel}
                </span>
              )}
            </div>
            <span
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDialog(true);
              }}
              className="cursor-pointer rounded-xl bg-accent px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-accent-hover"
            >
              Subscribe
            </span>
          </div>
        </div>
      </Link>

      {showDialog && (
        <SubscriptionDialog
          listingId={listing.id}
          agentName={listing.agentName}
          authorId={listing.agentId}
          weeklyPrice={listing.weeklyPrice}
          monthlyPrice={listing.monthlyPrice}
          onClose={() => setShowDialog(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}
