"use client";

import { useEffect, useState, useCallback } from "react";
import type { AuthorStats } from "@ciao/shared";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Bot,
  Store,
  TrendingUp,
  Users,
  Coins,
  Sparkles,
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
  Wallet,
} from "lucide-react";

type Tab = "agents" | "income" | "payout";

const TABS: { id: Tab; label: string; icon: typeof Bot }[] = [
  { id: "agents", label: "My Agents", icon: Store },
  { id: "income", label: "Income", icon: TrendingUp },
  { id: "payout", label: "Payout", icon: Wallet },
];

function TabButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof Bot;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
        active
          ? "bg-accent text-white shadow-sm"
          : "text-stone-500 hover:bg-stone-100 hover:text-stone-700"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

// ─── My Agents Tab ─────────────────────────────────────────
function MyAgentsTab() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/marketplace?mine=true");
      if (!res.ok) throw new Error("Failed to load data");
      const data = await res.json();
      setAgents(data.listings ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <Loader2 className="h-5 w-5 animate-spin text-accent" />
        <p className="text-sm text-stone-500">Loading your listings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-stone-200 bg-white px-8 py-16">
        <AlertCircle className="h-6 w-6 text-rose-500" />
        <p className="text-sm text-stone-600">{error}</p>
        <Button variant="primary" onClick={load}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <EmptyState
        title="No listings yet"
        description="Publish an agent to the marketplace to start earning."
      />
    );
  }

  return (
    <div className="space-y-3">
      {agents.map((listing: any) => (
        <div
          key={listing.id}
          className="group flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-light">
              <Bot className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-serif text-lg leading-tight text-stone-800">
                {listing.agentName}
              </h3>
              <p className="mt-0.5 text-sm text-stone-500">
                {listing.agentDescription ?? "No description"}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {listing.totalSubscribers ?? 0} subscribers
                </span>
                {listing.totalEarned > 0 && (
                  <span className="flex items-center gap-1">
                    <Coins className="h-3.5 w-3.5 text-amber-500" />
                    {listing.totalEarned} earned
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={listing.status === "ACTIVE" ? "success" : "neutral"}>
              {listing.status ?? "ACTIVE"}
            </Badge>
            <button className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition-all hover:border-stone-300 hover:bg-stone-50">
              Edit
            </button>
            <button className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition-all hover:border-rose-300 hover:bg-rose-50">
              Unlist
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Income Tab ─────────────────────────────────────────────
function IncomeTab() {
  const [stats, setStats] = useState<AuthorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/author/stats");
      if (!res.ok) throw new Error("Failed to load stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <Loader2 className="h-5 w-5 animate-spin text-accent" />
        <p className="text-sm text-stone-500">Loading earnings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-stone-200 bg-white px-8 py-16">
        <AlertCircle className="h-6 w-6 text-rose-500" />
        <p className="text-sm text-stone-600">{error}</p>
        <Button variant="primary" onClick={load}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (!stats) {
    return <EmptyState title="No data yet" description="Publish an agent and start earning." />;
  }

  const TIER_BADGES: Record<string, { label: string; class: string }> = {
    BRONZE: { label: "Bronze", class: "bg-amber-50 text-amber-700 border-amber-200" },
    SILVER: { label: "Silver", class: "bg-stone-50 text-stone-600 border-stone-200" },
    GOLD: { label: "Gold", class: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    PLATINUM: { label: "Platinum", class: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  };

  const tierInfo = TIER_BADGES[stats.tier] ?? TIER_BADGES.BRONZE;

  return (
    <div className="space-y-5">
      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-stone-500">
            <Coins className="h-3.5 w-3.5 text-amber-500" />
            Total earned
          </div>
          <p className="mt-2 font-serif text-2xl text-stone-800">
            {stats.totalEarned}
            <span className="ml-1 text-sm font-sans font-medium text-stone-400">credits</span>
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-stone-500">
            <TrendingUp className="h-3.5 w-3.5 text-accent" />
            Monthly income
          </div>
          <p className="mt-2 font-serif text-2xl text-stone-800">
            {stats.monthlyIncome}
            <span className="ml-1 text-sm font-sans font-medium text-stone-400">credits</span>
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-stone-500">
            <Users className="h-3.5 w-3.5 text-accent" />
            Active subscribers
          </div>
          <p className="mt-2 font-serif text-2xl text-stone-800">
            {stats.activeSubscribers}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-stone-500">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Author tier
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex rounded-md border px-3 py-0.5 text-sm font-semibold ${tierInfo.class}`}>
              {tierInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <Card>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-stone-800">
          <Clock className="h-4 w-4 text-stone-500" />
          Recent transactions
        </h3>
        {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
          <div className="space-y-2">
            {stats.recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      tx.type === "CREDIT"
                        ? "bg-emerald-100"
                        : "bg-rose-100"
                    }`}
                  >
                    {tx.type === "CREDIT" ? (
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <TrendingUp className="h-4 w-4 rotate-180 text-rose-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-800">
                      {tx.description ?? (tx.type === "CREDIT" ? "Credit" : "Debit")}
                    </p>
                    <p className="text-xs text-stone-500">
                      {new Date(tx.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    tx.type === "CREDIT" ? "text-emerald-600" : "text-rose-500"
                  }`}
                >
                  {tx.type === "CREDIT" ? "+" : "-"}
                  {tx.amount}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-stone-500">
            No transactions yet
          </p>
        )}
      </Card>
    </div>
  );
}

// ─── Payout Tab ──────────────────────────────────────────────
function PayoutTab() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-stone-300 bg-white/50 px-8 py-20">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100">
        <Wallet className="h-6 w-6 text-stone-400" />
      </div>
      <div className="text-center">
        <h3 className="font-serif text-xl text-stone-800">
          Payouts &mdash; Coming Soon
        </h3>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-stone-500">
          We&apos;re building credit-to-fiat payouts. Soon you&apos;ll be able to withdraw
          your earned credits as real currency &mdash; PayPal, Alipay, and WeChat Pay.
        </p>
      </div>
    </div>
  );
}

// ─── Main Sell Page ──────────────────────────────────────────
export default function SellPage() {
  const [tab, setTab] = useState<Tab>("agents");

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl leading-tight text-stone-800">
          Sell
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
          Publish agents, track earnings, and manage your income
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
        {TABS.map((t) => (
          <TabButton
            key={t.id}
            active={tab === t.id}
            icon={t.icon}
            label={t.label}
            onClick={() => setTab(t.id)}
          />
        ))}
      </div>

      {/* Tab content */}
      {tab === "agents" && <MyAgentsTab />}
      {tab === "income" && <IncomeTab />}
      {tab === "payout" && <PayoutTab />}
    </div>
  );
}
