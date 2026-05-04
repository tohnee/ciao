"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Coins } from "lucide-react";

export function Header() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/credits/balance")
      .then((r) => r.json())
      .then((d) => setBalance(d.balance))
      .catch(() => {});
  }, []);

  return (
    <header className="mb-10 flex items-center justify-between">
      <div>
        <h1 className="font-serif text-2xl leading-tight tracking-tight text-stone-800">
          Marketplace
        </h1>
        <p className="mt-0.5 text-sm text-muted">
          Discover, subscribe, and earn from AI agents
        </p>
      </div>
      <Link
        href="/credits"
        className="flex items-center gap-2 rounded-button border border-border bg-white px-3.5 py-2 text-sm font-medium text-stone-700 shadow-sm transition-all hover:border-stone-300 hover:shadow-card-hover"
      >
        <Coins className="h-4 w-4 text-amber-500" />
        <span>{balance !== null ? `${balance} credits` : "— credits"}</span>
      </Link>
    </header>
  );
}
