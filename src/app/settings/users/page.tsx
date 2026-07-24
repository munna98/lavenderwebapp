import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import UsersTable from "./users-table";

export const metadata: Metadata = {
  title: "User Management — Lavender Auto Parts",
};

export default async function UsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">User Management</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Invite team members and manage roles
          </p>
        </div>
      </div>

      <UsersTable users={users} />
    </div>
  );
}
