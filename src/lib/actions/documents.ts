"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Decimal from "decimal.js";
import { computeTotals } from "@/lib/utils/totals";
import { CreateDocumentSchema } from "@/lib/schemas/documents";

export type ActionResult =
  | { success: true; id: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

async function generatePoNumber(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
): Promise<string> {
  const result = await tx.$queryRaw<{ current: number }[]>`
    UPDATE po_sequence
    SET current = current + 1
    WHERE name = 'po'
    RETURNING current
  `;
  const next = result[0]?.current ?? 1;
  return `PO-${next}`;
}

export async function createDocument(
  data: unknown
): Promise<ActionResult> {
  const auth = await requireAuth();

  const parsed = CreateDocumentSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues || [];
    return {
      success: false,
      error: issues[0]?.message ?? "Validation failed",
    };
  }

  const { supplierId, notes, items } = parsed.data;

  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier) {
    return { success: false, error: "Selected supplier does not exist." };
  }

  let docId = "";

  try {
    const document = await prisma.$transaction(async (tx) => {
      const poNumber = await generatePoNumber(tx);

      return tx.document.create({
        data: {
          number: poNumber,
          type: "PO",
          status: "DRAFT",
          supplierId,
          createdById: auth.user.id,
          notes: notes || null,
          items: {
            create: items.map((item) => ({
              name: item.name,
              qty: new Decimal(item.qty).toFixed(4),
              rate: new Decimal(item.rate).toFixed(4),
              taxPercent: new Decimal(item.taxPercent || 0).toFixed(2),
            })),
          },
        },
      });
    });
    docId = document.id;
  } catch (err: unknown) {
    console.error("createDocument error:", err);
    return { success: false, error: "Failed to create purchase order." };
  }

  revalidatePath("/po");
  redirect(`/po/${docId}`);
}

export async function updateDocument(
  documentId: string,
  data: unknown
): Promise<ActionResult> {
  const auth = await requireAuth();

  const existingDoc = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!existingDoc) return { success: false, error: "Document not found." };
  if (existingDoc.status !== "DRAFT") {
    return { success: false, error: "Only DRAFT documents can be edited." };
  }

  const canEdit =
    auth.role === "ADMIN" || existingDoc.createdById === auth.user.id;

  if (!canEdit) {
    return { success: false, error: "You don't have permission to edit this document." };
  }

  const parsed = CreateDocumentSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues || [];
    return {
      success: false,
      error: issues[0]?.message ?? "Validation failed",
    };
  }

  const { supplierId, notes, items } = parsed.data;

  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier) {
    return { success: false, error: "Selected supplier does not exist." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.documentItem.deleteMany({
        where: { documentId },
      });

      await tx.document.update({
        where: { id: documentId },
        data: {
          supplierId,
          notes: notes || null,
          items: {
            create: items.map((item) => ({
              name: item.name,
              qty: new Decimal(item.qty).toFixed(4),
              rate: new Decimal(item.rate).toFixed(4),
              taxPercent: new Decimal(item.taxPercent || 0).toFixed(2),
            })),
          },
        },
      });
    });
  } catch (err: unknown) {
    console.error("updateDocument error:", err);
    return { success: false, error: "Failed to update purchase order." };
  }

  revalidatePath("/po");
  revalidatePath(`/po/${documentId}`);
  redirect(`/po/${documentId}`);
}

export async function cancelDocument(documentId: string): Promise<ActionResult> {
  const auth = await requireAuth();

  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) return { success: false, error: "Document not found." };

  const canCancel =
    auth.role === "ADMIN" ||
    (document.createdById === auth.user.id && document.status === "DRAFT");

  if (!canCancel) {
    return { success: false, error: "You don't have permission to cancel this document." };
  }

  await prisma.document.update({
    where: { id: documentId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/po");
  revalidatePath(`/po/${documentId}`);
  return { success: true, id: documentId };
}

export async function sendDocument(documentId: string): Promise<ActionResult> {
  const auth = await requireAuth();

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      supplier: true,
      createdBy: true,
      items: true,
    },
  });

  if (!document) return { success: false, error: "Document not found." };
  if (document.status !== "DRAFT") {
    return { success: false, error: "Only DRAFT documents can be sent." };
  }
  if (!document.supplier.email) {
    return { success: false, error: "Supplier has no email address on file." };
  }

  try {
    const { renderToBuffer } = await import("@react-pdf/renderer");
    const { default: PurchaseOrderPdf } = await import("@/components/pdf/purchase-order-pdf");
    const { Resend } = await import("resend");
    const { createElement } = await import("react");

    const totals = computeTotals(
      document.items.map((i) => ({
        qty: i.qty.toString(),
        rate: i.rate.toString(),
        taxPercent: i.taxPercent.toString(),
      }))
    );

    const pdfBuffer = await renderToBuffer(
      createElement(PurchaseOrderPdf, { document, totals }) as unknown as React.ReactElement<any>
    );

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "orders@lavenderautoparts.com",
      replyTo: document.createdBy.email,
      to: [document.supplier.email],
      subject: `Purchase Order ${document.number} — Lavender Auto Parts`,
      text: `Dear ${document.supplier.name},\n\nPlease find attached Purchase Order ${document.number} from Lavender Auto Parts.\n\nTotal: ${totals.totalFormatted}\n\nKind regards,\n${document.createdBy.name}\nLavender Auto Parts`,
      attachments: [
        {
          filename: `${document.number}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return { success: false, error: `Failed to send email: ${emailError.message}` };
    }

    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "SENT",
        sentAt: new Date(),
        snapshotSupplierName: document.supplier.name,
        snapshotSupplierAddress: document.supplier.address,
        snapshotSupplierEmail: document.supplier.email,
        snapshotSupplierPhone: document.supplier.phone,
        snapshotSupplierTaxId: document.supplier.taxId,
      },
    });

    revalidatePath("/po");
    revalidatePath(`/po/${documentId}`);
    return { success: true, id: documentId };
  } catch (err) {
    console.error("sendDocument error:", err);
    return { success: false, error: "An unexpected error occurred while sending." };
  }
}
