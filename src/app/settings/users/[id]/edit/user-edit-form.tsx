"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@prisma/client";
import { updateUser } from "@/lib/actions/users";
import Link from "next/link";
import { toast } from "sonner";

type Props = {
  user: User;
};

export default function EditUserForm({ user }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [role, setRole] = useState<"ADMIN" | "STAFF">(user.role);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await updateUser({
        userId: user.id,
        name: name.trim(),
        phone: phone.trim() || null,
        role,
      });

      if (result.success) {
        toast.success("User updated successfully!");
        router.push("/settings/users");
        router.refresh();
      } else {
        setError(result.error ?? "Failed to update user.");
        toast.error(result.error ?? "Failed to update user.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          className="px-4 py-3 rounded-lg text-sm border"
          style={{ background: "#FEF2F2", borderColor: "#FCA5A5", color: "#B91C1C" }}
        >
          {error}
        </div>
      )}

      {/* Full Name */}
      <div>
        <label htmlFor="edit-name" className="block text-sm font-medium mb-1.5">
          Full Name <span style={{ color: "var(--brass)" }}>*</span>
        </label>
        <input
          id="edit-name"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Munavir T"
          className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all focus:border-accent"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
        />
      </div>

      {/* Email (Readonly) */}
      <div>
        <label htmlFor="edit-email" className="block text-sm font-medium mb-1.5">
          Email Address
        </label>
        <input
          id="edit-email"
          name="email"
          type="email"
          disabled
          value={user.email}
          className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none font-mono-nums opacity-60 cursor-not-allowed"
          style={{ borderColor: "var(--border)", background: "var(--surface-raised)", color: "var(--foreground)" }}
        />
      </div>

      {/* Mobile / Phone */}
      <div>
        <label htmlFor="edit-phone" className="block text-sm font-medium mb-1.5">
          Mobile Number
        </label>
        <input
          id="edit-phone"
          name="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+971 50 123 4567"
          className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all focus:border-accent font-mono-nums"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
        />
      </div>

      {/* Role */}
      <div>
        <label htmlFor="edit-role" className="block text-sm font-medium mb-1.5">
          Role <span style={{ color: "var(--brass)" }}>*</span>
        </label>
        <div className="relative">
          <select
            id="edit-role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as "ADMIN" | "STAFF")}
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
          id="update-user-submit-btn"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {isPending ? "Saving…" : "Save changes"}
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
  );
}
