"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/layout/Nav";

const AUTH_ROUTES = ["/login", "/register"];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r border-stone-800/50 bg-sidebar shadow-sidebar">
        {/* Logo area */}
        <div className="relative px-6 pt-6 pb-5">
          <Link href="/home" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-sm font-bold tracking-tight text-white shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:shadow-accent/20">
              C
            </div>
            <div>
              <span className="text-base font-semibold tracking-tight text-stone-100">CIAO</span>
              <p className="-mt-0.5 text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500">
                Intent-driven
              </p>
            </div>
          </Link>
          <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-stone-700/50 via-stone-700/30 to-transparent" />
        </div>

        <Nav />

        {/* Bottom branding */}
        <div className="border-t border-stone-800/50 px-6 py-4">
          <p className="text-[11px] text-stone-600">
            &copy; {new Date().getFullYear()} CIAO
          </p>
        </div>
      </aside>
      <main className="flex flex-1 flex-col overflow-auto bg-surface-warm">
        <div className="mx-auto w-full max-w-5xl px-10 py-10">{children}</div>
      </main>
    </div>
  );
}
