"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/lib/actions/users";
import Link from "next/link";
import { toast } from "sonner";

export default function NewUserPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createUser(formData);
      if (result.success) {
        toast.success(result.message || "User created and credentials email sent successfully!");
        router.push("/settings/users");
        router.refresh();
      } else {
        setError(result.error ?? "Something went wrong.");
        toast.error(result.error ?? "Failed to create user.");
      }
    });
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Add User</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          Create a team member account and assign their role.
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error */}
          {error && (
            <div
              className="px-4 py-3 rounded-lg text-sm border"
              style={{ background: "#FEF2F2", borderColor: "#FCA5A5", color: "#B91C1C" }}
            >
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="new-name" className="block text-sm font-medium mb-1.5">
              Full Name <span style={{ color: "var(--brass)" }}>*</span>
            </label>
            <input
              id="new-name"
              name="name"
              required
              autoFocus
              placeholder="e.g. Munavir T"
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all focus:border-accent"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="new-email" className="block text-sm font-medium mb-1.5">
              Email Address <span style={{ color: "var(--brass)" }}>*</span>
            </label>
            <input
              id="new-email"
              name="email"
              type="email"
              required
              autoComplete="off"
              placeholder="email@example.com"
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all focus:border-accent font-mono-nums"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium mb-1.5">
              Initial Password <span style={{ color: "var(--brass)" }}>*</span>
            </label>
            <div className="relative">
              <input
                id="new-password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Minimum 6 characters"
                className="w-full px-3 py-2.5 pr-10 rounded-lg border text-sm outline-none transition-all focus:border-accent"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-opacity hover:opacity-75"
                style={{ color: "var(--muted-foreground)" }}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label htmlFor="new-role" className="block text-sm font-medium mb-1.5">
              Role <span style={{ color: "var(--brass)" }}>*</span>
            </label>
            <div className="relative">
              <select
                id="new-role"
                name="role"
                defaultValue="STAFF"
                className="w-full px-3 py-2.5 pr-9 rounded-lg border text-sm outline-none cursor-pointer transition-all appearance-none focus:border-accent"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
              >
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
              </select>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted-foreground)" }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              id="create-user-submit-btn"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              {isPending ? "Creating…" : "Create User"}
            </button>
            <Link
              href="/settings/users"
              className="px-4 py-2.5 rounded-lg text-sm font-medium border cursor-pointer transition-colors hover:bg-surface-raised"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
