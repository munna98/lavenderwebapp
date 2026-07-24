import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewPoForm from "@/components/po/new-po-form";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id }, select: { number: true } });
  return {
    title: doc ? `Edit ${doc.number} — Purchase Order` : "Edit Purchase Order",
  };
}

export default async function EditPoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireAuth();
  const { id } = await params;

  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      items: true,
    },
  });

  if (!doc) notFound();

  // Protect integrity: Only DRAFT status can be edited
  if (doc.status !== "DRAFT") {
    redirect(`/po/${id}`);
  }

  // Security check: Only creator or ADMIN can edit
  const canEdit = auth.role === "ADMIN" || doc.createdById === auth.user.id;
  if (!canEdit) {
    redirect(`/po/${id}`);
  }

  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
  });

  const initialData = {
    documentId: doc.id,
    supplierId: doc.supplierId,
    notes: doc.notes,
    items: doc.items.map((i) => ({
      name: i.name,
      qty: Number(i.qty),
      rate: Number(i.rate),
      taxPercent: Number(i.taxPercent || 0),
    })),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Edit Draft — {doc.number}</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          Modify the purchase order details below and save your changes.
        </p>
      </div>

      <NewPoForm suppliers={suppliers} initialData={initialData} />
    </div>
  );
}
