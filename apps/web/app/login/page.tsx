"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const router = useRouter();
  const { error } = searchParams;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      return;
    }

    router.push("/home");
    router.refresh();
  }

  return (
    <div className="noise-bg flex min-h-screen items-center justify-center bg-surface-warm px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <Link href="/home" className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-2xl font-bold tracking-tight text-white shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-accent/20">
            C
          </Link>
          <h1 className="text-xl font-medium tracking-tight text-stone-800">
            Sign in to CIAO
          </h1>
          <p className="mt-1.5 text-sm text-stone-500">
            Enter your credentials to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border bg-white p-6 shadow-card">
          {error === "CredentialsSignin" && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
              Invalid email or password
            </p>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 shadow-sm placeholder-stone-400 transition-all duration-200 focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(13,124,107,0.08)]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 shadow-sm placeholder-stone-400 transition-all duration-200 focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(13,124,107,0.08)]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-accent-hover active:scale-[0.97] disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-accent transition-colors hover:text-accent-hover">
            Create one
          </Link>
        </p>

        <div className="mt-4 border-t border-border pt-4 text-center">
          <Link href="/trial" className="text-sm text-stone-400 transition-colors hover:text-stone-600">
            Try CIAO without signing in
          </Link>
        </div>
      </div>
    </div>
  );
}
