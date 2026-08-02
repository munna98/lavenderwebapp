"use client";

import Link from "next/link";
import type { User } from "@prisma/client";
import UsersTable from "./users-table";

type Props = { users: User[] };

export default function UsersPageClient({ users }: Props) {
  return (
    <>
      {/* Title row — matches suppliers page pattern */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">User Management</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {users.length} user{users.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/settings/users/new"
          id="add-user-btn"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="hidden sm:inline">Add User</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

      {/* Table — hideAddButton suppresses its own internal Add button */}
      <UsersTable users={users} showAddForm={false} setShowAddForm={() => {}} />
    </>
  );
}
