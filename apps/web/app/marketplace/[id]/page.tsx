"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import type {
  MarketplaceReviewInfo,
  AuthorProfileInfo,
} from "@ciao/shared";
import { ReviewCard } from "@/components/marketplace/ReviewCard";
import { ReviewForm } from "@/components/marketplace/ReviewForm";
import { SubscriptionDialog } from "@/components/marketplace/SubscriptionDialog";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Star,
  Users,
  Coins,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface ListingDetail {
  listing: {
    id: string;
    agentId: string;
    agentName: string;
    price: number;
    weeklyPrice: number | null;
    monthlyPrice: number | null;
    description: string;
    rating: number;
    downloads: number;
    featured: boolean;
    status: string;
    totalSubscribers: number;
    totalEarned: number;
    tags: string | null;
    createdAt: string;
  };
  authorProfile: AuthorProfileInfo;
}

const TIER_STYLES: Record<string, string> = {
  BRONZE: "bg-amber-50 text-amber-700 border-amber-200",
  SILVER: "bg-stone-50 text-stone-600 border-stone-200",
  GOLD: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PLATINUM: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

export default function MarketplaceDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [detail, setDetail] = useState<ListingDetail | null>(null);
  const [reviews, setReviews] = useState<MarketplaceReviewInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubscribe, setShowSubscribe] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listingRes, reviewsRes] = await Promise.all([
        fetch(`/api/marketplace/${id}`),
        fetch(`/api/marketplace/${id}/reviews`),
      ]);
      if (!listingRes.ok) {
        if (listingRes.status === 404)
          throw new Error("Listing not found");
        throw new Error("Failed to load listing");
      }
      const listingData = await listingRes.json();
      const reviewsData = await reviewsRes.json();
      setDetail(listingData);
      setReviews(reviewsData.reviews ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReviewSuccess = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
        <p className="text-sm text-stone-500">Loading listing...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-stone-200 bg-white px-8 py-20">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
          <AlertCircle className="h-7 w-7 text-rose-500" />
        </div>
        <div className="text-center">
          <h3 className="font-serif text-xl text-stone-800">
            {error === "Listing not found" ? "Not Found" : "Error"}
          </h3>
          <p className="mt-1 text-sm text-stone-500">{error}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/buy"
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition-all hover:border-stone-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to marketplace
          </Link>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!detail) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-stone-200 bg-white px-8 py-20">
        <h3 className="font-serif text-xl text-stone-800">Not Found</h3>
        <p className="text-sm text-stone-500">
          This listing doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/buy"
          className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          Browse agents
        </Link>
      </div>
    );
  }

  const { listing, authorProfile } = detail;

  const subscriptionPrice =
    listing.monthlyPrice ?? listing.weeklyPrice;
  const subscriptionLabel = listing.monthlyPrice
    ? `${listing.monthlyPrice} credits/month`
    : listing.weeklyPrice
      ? `${listing.weeklyPrice} credits/week`
      : null;

  const tierStyle =
    TIER_STYLES[authorProfile.tier] ?? TIER_STYLES.BRONZE;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Back link */}
      <Link
        href="/buy"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 transition-colors hover:text-stone-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to marketplace
      </Link>

      {/* Hero section */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main info */}
        <div className="space-y-5 lg:col-span-2">
          <div>
            <h1 className="font-serif text-4xl leading-tight text-stone-800">
              {listing.agentName}
            </h1>
            {listing.description && (
              <p className="mt-3 text-base leading-relaxed text-stone-600">
                {listing.description}
              </p>
            )}
          </div>

          {/* Tags */}
          {listing.tags && (
            <div className="flex flex-wrap gap-2">
              {listing.tags.split(",").map((tag) => (
                <span
                  key={tag.trim()}
                  className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap gap-5">
            {listing.rating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm font-semibold text-stone-800">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {listing.rating.toFixed(1)}
                </div>
                <span className="text-xs text-stone-500">
                  ({authorProfile.ratingCount} reviews)
                </span>
              </div>
            )}
            {listing.totalSubscribers > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-stone-600">
                <Users className="h-4 w-4 text-stone-400" />
                {listing.totalSubscribers} subscribers
              </div>
            )}
            {listing.totalEarned > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-stone-600">
                <Coins className="h-4 w-4 text-amber-500" />
                {listing.totalEarned} credits earned
              </div>
            )}
          </div>
        </div>

        {/* Sidebar card */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          {/* Pricing */}
          <div className="mb-5">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
              Subscription
            </p>
            {subscriptionPrice ? (
              <p className="mt-1 font-serif text-3xl text-accent">
                {subscriptionPrice}
                <span className="ml-1 text-lg font-sans text-stone-500">
                  credits
                </span>
              </p>
            ) : (
              <p className="mt-1 text-sm text-stone-500">
                Price not available
              </p>
            )}
            {subscriptionLabel && (
              <p className="mt-0.5 text-sm text-stone-500">
                {subscriptionLabel}
              </p>
            )}
          </div>

          {/* Subscribe button */}
          <button
            onClick={() => setShowSubscribe(true)}
            className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent-hover"
          >
            Subscribe now
          </button>

          {/* Author info */}
          <div className="mt-5 border-t border-stone-100 pt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-500">
              Author
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-light text-sm font-bold text-accent">
                {(authorProfile.displayName ?? "A").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800">
                  {authorProfile.displayName ?? "Anonymous"}
                </p>
                <span
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tierStyle}`}
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  {authorProfile.tier}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <div className="space-y-5">
        <h2 className="font-serif text-2xl leading-tight text-stone-800">
          Reviews
          {reviews.length > 0 && (
            <span className="ml-2 text-base font-sans font-medium text-stone-400">
              ({reviews.length})
            </span>
          )}
        </h2>

        {/* Review form */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <ReviewForm listingId={id} onSuccess={handleReviewSuccess} />
        </div>

        {/* Reviews list */}
        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-200 bg-white/50 px-8 py-12 text-center">
            <p className="text-sm text-stone-500">
              No reviews yet. Be the first to review!
            </p>
          </div>
        )}
      </div>

      {/* Subscribe dialog */}
      {showSubscribe && (
        <SubscriptionDialog
          listingId={listing.id}
          agentName={listing.agentName}
          authorId={listing.agentId}
          weeklyPrice={listing.weeklyPrice}
          monthlyPrice={listing.monthlyPrice}
          onClose={() => setShowSubscribe(false)}
          onSuccess={() => fetchData()}
        />
      )}
    </div>
  );
}
