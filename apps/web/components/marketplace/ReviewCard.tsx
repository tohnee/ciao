"use client";

import { Star } from "lucide-react";
import type { MarketplaceReviewInfo } from "@ciao/shared";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-stone-200 text-stone-200"
          }`}
        />
      ))}
    </div>
  );
}

function Avatar({
  name,
  size = "sm",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const initial = (name ?? "?").charAt(0).toUpperCase();
  const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-accent-light font-semibold text-accent ${sizeClass}`}
    >
      {initial}
    </div>
  );
}

export function ReviewCard({ review }: { review: MarketplaceReviewInfo }) {
  const date = new Date(review.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="group rounded-xl border border-stone-200 bg-white p-4 transition-all hover:border-stone-300 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar name={review.reviewerName ?? "Anonymous"} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-stone-800">
              {review.reviewerName ?? "Anonymous"}
            </p>
            <span className="shrink-0 text-xs text-stone-400">{date}</span>
          </div>
          <div className="mt-1">
            <StarRating rating={review.rating} />
          </div>
          {review.text && (
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              {review.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
