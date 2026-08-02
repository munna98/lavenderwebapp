"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Props = {
  user: {
    name: string;
    email: string;
    role: "ADMIN" | "STAFF";
  } | null;
};

export default function Navigation({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  if (!user || pathname === "/login") return null;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const links = [
    { href: "/po", label: "Purchase Orders" },
    { href: "/quotations", label: "Quotations" },
    { href: "/suppliers", label: "Suppliers" },
    ...(user.role === "ADMIN" ? [{ href: "/settings/users", label: "Staff & Users" }] : []),
  ];

  return (
    <header className="border-b sticky top-0 z-40 bg-surface/80 backdrop-blur-md" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/po" prefetch={true} className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              LP
            </div>
            <span className="font-semibold text-sm tracking-tight hidden sm:inline" style={{ color: "var(--foreground)" }}>
              Lavender Auto Parts
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-1">
            {links.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  style={{
                    color: active ? "var(--accent)" : "var(--muted-foreground)",
                    background: active ? "var(--accent-soft)" : "transparent",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Badge & Logout */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{user.name}</p>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded" style={{ background: "var(--surface-raised)", color: "var(--muted-foreground)" }}>
              {user.role}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="text-xs px-2.5 py-1.5 rounded-lg border cursor-pointer hover:bg-surface-raised transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
