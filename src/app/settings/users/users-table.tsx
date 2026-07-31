"use client";

import { useState, useTransition } from "react";
import type { User } from "@prisma/client";
import { createUser, updateUser } from "@/lib/actions/users";
import Pagination from "@/components/ui/pagination";

type Props = { users: User[] };

export default function UsersTable({ users: initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const paginated = users.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createUser(formData);
      if (result.success) {
        setFeedback({ type: "success", message: result.message });
        setShowAddForm(false);
        (e.target as HTMLFormElement).reset();
      } else {
        setFeedback({ type: "error", message: result.error });
      }
    });
  }

  async function handleToggleActive(userId: string, isActive: boolean) {
    startTransition(async () => {
      const result = await updateUser({ userId, isActive: !isActive });
      if (!result.success) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: !isActive } : u))
        );
      }
    });
  }

  async function handleRoleChange(userId: string, role: "ADMIN" | "STAFF") {
    startTransition(async () => {
      const result = await updateUser({ userId, role });
      if (!result.success) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role } : u))
        );
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Feedback banner */}
      {feedback && (
        <div
          className="px-4 py-3 rounded-lg text-sm border flex items-center justify-between"
          style={{
            background: feedback.type === "success" ? "var(--accent-soft)" : "#FEF2F2",
            borderColor: feedback.type === "success" ? "var(--accent)" : "#FCA5A5",
            color: feedback.type === "success" ? "var(--accent)" : "#B91C1C",
          }}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="ml-3 opacity-60 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Add User button + form */}
      {!showAddForm ? (
        <div className="flex justify-end">
          <button
            id="add-user-btn"
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            + Add user
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleCreateSubmit}
          className="p-5 rounded-xl border space-y-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2 className="font-semibold text-sm">Add a new user</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label htmlFor="create-name" className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>
                Name
              </label>
              <input
                id="create-name"
                name="name"
                required
                placeholder="Full name"
                className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
              />
            </div>
            <div>
              <label htmlFor="create-email" className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>
                Email
              </label>
              <input
                id="create-email"
                name="email"
                type="email"
                required
                placeholder="email@example.com"
                className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
              />
            </div>
            <div>
              <label htmlFor="create-password" className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>
                Password
              </label>
              <input
                id="create-password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Initial password"
                className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
              />
            </div>
            <div>
              <label htmlFor="create-role" className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>
                Role
              </label>
              <select
                id="create-role"
                name="role"
                defaultValue="STAFF"
                className="w-full px-3 py-2 text-sm rounded-lg border outline-none cursor-pointer"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
              >
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-2 text-sm rounded-lg border cursor-pointer"
              style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              id="create-submit-btn"
              disabled={isPending}
              className="px-4 py-2 text-sm rounded-lg font-semibold cursor-pointer disabled:opacity-50"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              {isPending ? "Creating…" : "Create User"}
            </button>
          </div>
        </form>
      )}

      {/* Users table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--border)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--surface-raised)", borderBottom: "1px solid var(--border)" }}>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Name</th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Email</th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Role</th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
                  No users yet. Add a user to get started.
                </td>
              </tr>
            ) : (
              paginated.map((user, idx) => (
                <tr
                  key={user.id}
                  style={{
                    borderTop: idx > 0 ? "1px solid var(--border)" : undefined,
                    background: "var(--surface)",
                  }}
                >
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as "ADMIN" | "STAFF")}
                      disabled={isPending}
                      className="text-xs px-2 py-1 rounded-md border cursor-pointer"
                      style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                    >
                      <option value="STAFF">Staff</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      style={
                        user.isActive
                          ? { background: "var(--status-sent-bg)", color: "var(--status-sent-text)" }
                          : { background: "var(--status-cancelled-bg)", color: "var(--status-cancelled-text)" }
                      }
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                      disabled={isPending}
                      className="text-xs underline underline-offset-2 cursor-pointer disabled:opacity-40"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {user.isActive ? "Deactivate" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={users.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
