"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  House,
  GitBranch,
  CheckCircle,
  Brain,
  Cpu,
  Bot,
  BookOpen,
  Users,
  Store,
  ShoppingBag,
  Tag,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const workspaceItems: NavItem[] = [
  { href: "/home", label: "Home", icon: House },
  { href: "/decisions", label: "Decisions", icon: GitBranch },
  { href: "/outcomes", label: "Outcomes", icon: CheckCircle },
  { href: "/memory", label: "Memory", icon: Brain },
  { href: "/advanced", label: "Advanced", icon: Cpu },
];

const agentItems: NavItem[] = [
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/skills", label: "Skills", icon: BookOpen },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/buy", label: "Buy", icon: ShoppingBag },
  { href: "/sell", label: "Sell", icon: Tag },
  { href: "/subscriptions", label: "Subscriptions", icon: CheckCircle },
];

function NavSection({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-accent/10 text-accent"
                : "text-stone-400 hover:bg-sidebar-hover hover:text-stone-200",
            )}
          >
            <Icon
              className={clsx(
                "h-4 w-4 shrink-0 transition-all duration-200",
                isActive
                  ? "text-accent"
                  : "text-stone-500 group-hover:text-stone-300",
              )}
            />
            <span>{item.label}</span>
            {isActive && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
            )}
          </Link>
        );
      })}
    </>
  );
}

export function Nav() {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pt-5">
      <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.15em] text-stone-500">
        Workspace
      </p>
      <NavSection items={workspaceItems} />

      <div className="mx-3 mt-6 mb-3 h-px bg-gradient-to-r from-stone-700/40 via-stone-700/20 to-transparent" />

      <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.15em] text-stone-500">
        Agents
      </p>
      <NavSection items={agentItems} />
    </nav>
  );
}
