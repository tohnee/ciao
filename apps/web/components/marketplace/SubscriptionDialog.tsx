"use client";

import { useState, useEffect } from "react";
import { X, Coins, Check, AlertCircle, Loader2 } from "lucide-react";

type Plan = "WEEKLY" | "MONTHLY";

interface SubscriptionDialogProps {
  listingId: string;
  agentName: string;
  authorId: string;
  weeklyPrice: number | null;
  monthlyPrice: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function SubscriptionDialog({
  listingId,
  agentName,
  authorId,
  weeklyPrice,
  monthlyPrice,
  onClose,
  onSuccess,
}: SubscriptionDialogProps) {
  const [plan, setPlan] = useState<Plan>("MONTHLY");
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const price = plan === "WEEKLY" ? weeklyPrice : monthlyPrice;

  useEffect(() => {
    fetch("/api/credits/balance")
      .then((r) => r.json())
      .then((d) => setBalance(d.balance))
      .catch(() => setBalance(null))
      .finally(() => setBalanceLoading(false));
  }, []);

  const insufficientFunds =
    balance !== null && price !== null && balance < price;

  const handleSubscribe = async () => {
    if (!price) return;
    setSubscribing(true);
    setError(null);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ listingId, authorId, plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Subscription failed");
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm animate-slide-up rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
        >
          <X className="h-4 w-4" />
        </button>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-stone-800">
              Subscribed to {agentName}!
            </p>
            <p className="text-xs text-stone-500">
              You can manage subscriptions in your account.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-5">
              <h2 className="font-serif text-xl leading-tight text-stone-800">
                Subscribe to
              </h2>
              <p className="mt-0.5 text-lg font-medium text-accent">
                {agentName}
              </p>
            </div>

            {/* Balance */}
            <div className="mb-5 flex items-center justify-between rounded-xl bg-accent-light px-4 py-3">
              <span className="text-sm font-medium text-stone-700">
                Your balance
              </span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-stone-800">
                <Coins className="h-4 w-4 text-amber-500" />
                {balanceLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-stone-400" />
                ) : balance !== null ? (
                  `${balance} credits`
                ) : (
                  "—"
                )}
              </span>
            </div>

            {/* Plan selector */}
            <div className="mb-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-500">
                Choose plan
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPlan("WEEKLY")}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    plan === "WEEKLY"
                      ? "border-accent bg-accent-light ring-1 ring-accent"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  <span className="block text-sm font-semibold text-stone-800">
                    Weekly
                  </span>
                  <span className="mt-0.5 block text-xs text-stone-500">
                    {weeklyPrice
                      ? `${weeklyPrice} credits / wk`
                      : "Not available"}
                  </span>
                </button>
                <button
                  onClick={() => setPlan("MONTHLY")}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    plan === "MONTHLY"
                      ? "border-accent bg-accent-light ring-1 ring-accent"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  <span className="block text-sm font-semibold text-stone-800">
                    Monthly
                  </span>
                  <span className="mt-0.5 block text-xs text-stone-500">
                    {monthlyPrice
                      ? `${monthlyPrice} credits / mo`
                      : "Not available"}
                  </span>
                </button>
              </div>
            </div>

            {/* Subscribe button */}
            <button
              onClick={handleSubscribe}
              disabled={
                !price || subscribing || insufficientFunds || success
              }
              className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {subscribing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Subscribing...
                </span>
              ) : price ? (
                `Subscribe — ${price} credits / ${
                  plan === "WEEKLY" ? "week" : "month"
                }`
              ) : (
                "No pricing available"
              )}
            </button>

            {/* Insufficient funds */}
            {insufficientFunds && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Insufficient credits. Top up your balance first.
              </p>
            )}

            {/* Error */}
            {error && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
