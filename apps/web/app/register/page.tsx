"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Account created but sign-in failed. Please log in.");
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
            Create an account
          </h1>
          <p className="mt-1.5 text-sm text-stone-500">
            Get started with CIAO
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border bg-white p-6 shadow-card">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-700">
              Name <span className="text-stone-400">(optional)</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 shadow-sm placeholder-stone-400 transition-all duration-200 focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(13,124,107,0.08)]"
              placeholder="Your name"
            />
          </div>

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
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-stone-700">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 shadow-sm placeholder-stone-400 transition-all duration-200 focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(13,124,107,0.08)]"
              placeholder="Repeat password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-accent-hover active:scale-[0.97] disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent transition-colors hover:text-accent-hover">
            Sign in
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
