import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EditUserForm from "./user-edit-form";

export const metadata: Metadata = {
  title: "Edit User — Lavender Auto Parts",
};

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Edit user</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          {user.name} ({user.email})
        </p>
      </div>

      {/* Form Card */}
      <div
        className="rounded-xl border p-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <EditUserForm user={user} />
      </div>
    </div>
  );
}
