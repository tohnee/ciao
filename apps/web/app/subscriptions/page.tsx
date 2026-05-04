"use client";

import { useState, useEffect, useCallback } from "react";
import type { SubscriptionInfo } from "@ciao/shared";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Bot,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Trash2,
  Repeat,
  Coins,
} from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { label: string; class: string; icon: typeof CheckCircle }
> = {
  ACTIVE: {
    label: "Active",
    class: "bg-emerald-50 text-emerald-700",
    icon: CheckCircle,
  },
  PAST_DUE: {
    label: "Past Due",
    class: "bg-amber-50 text-amber-700",
    icon: AlertTriangle,
  },
  EXPIRED: {
    label: "Expired",
    class: "bg-stone-100 text-stone-500",
    icon: Clock,
  },
  CANCELLED: {
    label: "Cancelled",
    class: "bg-rose-50 text-rose-600",
    icon: XCircle,
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.EXPIRED;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${cfg.class}`}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-accent-light px-2 py-0.5 text-[11px] font-medium text-accent">
      {plan === "WEEKLY" ? "Weekly" : "Monthly"}
    </span>
  );
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<SubscriptionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subscriptions");
      if (!res.ok) throw new Error("Failed to load subscriptions");
      const data = await res.json();
      setSubs(data.subscriptions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  const handleCancel = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to cancel");
      await fetchSubs();
    } catch {
      // swallow
    } finally {
      setActionLoading(null);
    }
  };

  const handleRenew = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/subscriptions/${id}/renew`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Renewal failed");
      await fetchSubs();
    } catch {
      // swallow
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
        <p className="text-sm text-stone-500">
          Loading subscriptions...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-stone-200 bg-white px-8 py-16">
        <AlertCircle className="h-6 w-6 text-rose-500" />
        <div className="text-center">
          <h3 className="text-sm font-semibold text-stone-800">
            Failed to load
          </h3>
          <p className="mt-1 text-sm text-stone-500">{error}</p>
        </div>
        <button
          onClick={fetchSubs}
          className="mt-2 flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl leading-tight text-stone-800">
          Subscriptions
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
          Manage your agent subscriptions
        </p>
      </div>

      {subs.length === 0 ? (
        <EmptyState
          title="No subscriptions yet"
          description="Browse the marketplace and subscribe to an agent."
        />
      ) : (
        <div className="space-y-3">
          {subs.map((sub) => {
            const isBusy = actionLoading === sub.id;
            const isActive = sub.status === "ACTIVE" || sub.status === "PAST_DUE";
            const isCancellable = isActive;
            const isRenewable = sub.status === "EXPIRED" || sub.status === "CANCELLED";

            return (
              <div
                key={sub.id}
                className="group rounded-2xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-light">
                      <Bot className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg leading-tight text-stone-800">
                        {sub.agentName}
                      </h3>
                      {sub.authorName && (
                        <p className="mt-0.5 text-xs text-stone-500">
                          by {sub.authorName}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusBadge status={sub.status} />
                        <PlanBadge plan={sub.plan} />
                        <span className="flex items-center gap-1 text-xs text-stone-500">
                          <Coins className="h-3.5 w-3.5 text-amber-500" />
                          {sub.priceAtSubscription} credits
                        </span>
                      </div>
                      <div className="mt-1.5 text-xs text-stone-500">
                        {sub.status === "ACTIVE" && sub.currentPeriodEnd && (
                          <>
                            Renews{" "}
                            {new Date(sub.currentPeriodEnd).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                            {sub.autoRenew ? " (auto)" : ""}
                          </>
                        )}
                        {sub.cancelledAt && (
                          <>
                            Cancelled{" "}
                            {new Date(sub.cancelledAt).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )}
                          </>
                        )}
                        {sub.status === "EXPIRED" && sub.currentPeriodEnd && (
                          <>
                            Expired{" "}
                            {new Date(sub.currentPeriodEnd).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    {isCancellable && (
                      <button
                        onClick={() => handleCancel(sub.id)}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 rounded-xl border border-rose-200 px-3.5 py-2 text-xs font-medium text-rose-600 transition-all hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50"
                      >
                        {isBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Cancel
                      </button>
                    )}
                    {isRenewable && (
                      <button
                        onClick={() => handleRenew(sub.id)}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-accent-hover disabled:opacity-50"
                      >
                        {isBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Repeat className="h-3.5 w-3.5" />
                        )}
                        Renew
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
