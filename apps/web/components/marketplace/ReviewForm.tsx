"use client";

import { useState } from "react";
import { Star, Loader2, AlertCircle, Check } from "lucide-react";

interface ReviewFormProps {
  listingId: string;
  onSuccess: () => void;
}

export function ReviewForm({ listingId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/marketplace/${listingId}/reviews`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rating, text: text.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit review");
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        setSuccess(false);
        setRating(0);
        setText("");
      }, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = rating >= 1 && !submitting && !success;

  if (success) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        <Check className="h-4 w-4" />
        Review submitted! Refreshing...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Star picker */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-500">
          Your rating
        </p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="rounded-md p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= (hoverRating || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-stone-200 text-stone-200"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-xs text-stone-500">
              {rating === 1
                ? "Poor"
                : rating === 2
                  ? "Fair"
                  : rating === 3
                    ? "Good"
                    : rating === 4
                      ? "Very good"
                      : "Excellent"}
            </span>
          )}
        </div>
      </div>

      {/* Review text */}
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-500">
          Review (optional)
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your experience with this agent..."
          rows={3}
          maxLength={1000}
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <p className="mt-1 text-right text-xs text-stone-400">
          {text.length}/1000
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </span>
        ) : (
          "Submit review"
        )}
      </button>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-rose-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </form>
  );
}
