import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import UsersPageClient from "./users-page-client";

export const metadata: Metadata = {
  title: "User Management — Lavender Auto Parts",
};

export default async function UsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <UsersPageClient users={users} />
    </div>
  );
}
