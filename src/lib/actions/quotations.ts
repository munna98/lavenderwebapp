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

async function generateQuotationNumber(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
): Promise<string> {
  const result = await tx.$queryRaw<{ current: number }[]>`
    INSERT INTO po_sequence (name, current)
    VALUES ('quotation', 1)
    ON CONFLICT (name) DO UPDATE
    SET current = po_sequence.current + 1
    RETURNING current
  `;
  const next = result[0]?.current ?? 1;
  return `SQ-${next}`;
}

export async function createQuotation(data: unknown): Promise<ActionResult> {
  const auth = await requireAuth();

  const parsed = CreateDocumentSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues || [];
    return {
      success: false,
      error: issues[0]?.message ?? "Validation failed",
    };
  }

  const { supplierId, supplierEmail, notes, customerName, customerContact, items } = parsed.data;

  // For Quotations, supplierId form field represents the customerId
  const customerId = supplierId;
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    return { success: false, error: "Selected customer does not exist." };
  }

  let docId = "";

  try {
    const document = await prisma.$transaction(async (tx) => {
      const sqNumber = await generateQuotationNumber(tx);

      return tx.document.create({
        data: {
          number: sqNumber,
          type: "QUOTATION",
          status: "DRAFT",
          customerId,
          customerEmail: supplierEmail || customer.email || null,
          createdById: auth.user.id,
          notes: notes || null,
          customerName: customerName || null,
          customerContact: customerContact || null,
          items: {
            create: items.map((item) => ({
              partNumber: item.partNumber,
              name: item.name || "",
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
    console.error("createQuotation error:", err);
    return { success: false, error: "Failed to create sales quotation." };
  }

  revalidatePath("/quotations");
  redirect(`/quotations/${docId}`);
}

export async function updateQuotation(
  documentId: string,
  data: unknown
): Promise<ActionResult> {
  const auth = await requireAuth();

  const existingDoc = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!existingDoc) return { success: false, error: "Quotation not found." };
  if (existingDoc.status !== "DRAFT") {
    return { success: false, error: "Only DRAFT quotations can be edited." };
  }

  const parsed = CreateDocumentSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues || [];
    return {
      success: false,
      error: issues[0]?.message ?? "Validation failed",
    };
  }

  const { supplierId, supplierEmail, notes, customerName, customerContact, items } = parsed.data;
  const customerId = supplierId;

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    return { success: false, error: "Selected customer does not exist." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.documentItem.deleteMany({
        where: { documentId },
      });

      await tx.document.update({
        where: { id: documentId },
        data: {
          customerId,
          customerEmail: supplierEmail || customer.email || null,
          notes: notes || null,
          customerName: customerName || null,
          customerContact: customerContact || null,
          items: {
            create: items.map((item) => ({
              partNumber: item.partNumber,
              name: item.name || "",
              qty: new Decimal(item.qty).toFixed(4),
              rate: new Decimal(item.rate).toFixed(4),
              taxPercent: new Decimal(item.taxPercent || 0).toFixed(2),
            })),
          },
        },
      });
    });
  } catch (err: unknown) {
    console.error("updateQuotation error:", err);
    return { success: false, error: "Failed to update sales quotation." };
  }

  revalidatePath("/quotations");
  revalidatePath(`/quotations/${documentId}`);
  redirect(`/quotations/${documentId}`);
}

export async function cancelQuotation(documentId: string): Promise<ActionResult> {
  const auth = await requireAuth();

  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) return { success: false, error: "Quotation not found." };

  const canCancel =
    auth.role === "ADMIN" ||
    (document.createdById === auth.user.id && document.status === "DRAFT");

  if (!canCancel) {
    return { success: false, error: "You don't have permission to cancel this quotation." };
  }

  await prisma.document.update({
    where: { id: documentId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/quotations");
  revalidatePath(`/quotations/${documentId}`);
  return { success: true, id: documentId };
}

export async function sendQuotation(documentId: string): Promise<ActionResult> {
  await requireAuth();

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      customer: true,
      createdBy: true,
      items: true,
    },
  });

  if (!document) return { success: false, error: "Quotation not found." };
  if (document.status !== "DRAFT") {
    return { success: false, error: "Only DRAFT quotations can be sent." };
  }

  const targetEmail = document.customerEmail || document.customer?.email;
  if (!targetEmail) {
    return { success: false, error: "Customer has no email address specified for this quotation." };
  }

  try {
    const { renderToBuffer } = await import("@react-pdf/renderer");
    const { default: QuotationPdf } = await import("@/components/pdf/quotation-pdf");
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
      createElement(QuotationPdf, { document: document as any, totals }) as unknown as React.ReactElement<any>
    );

    const resend = new Resend(process.env.RESEND_API_KEY);

    const senderMobile = document.createdBy.phone ? `\nMobile: ${document.createdBy.phone}` : "";

    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "orders@lavenderautoparts.com",
      replyTo: document.createdBy.email,
      to: [targetEmail],
      subject: `Sales Quotation ${document.number} — Lavender Auto Spare Parts`,
      text: `Hello ${document.customer?.name || "Customer"},\n\nPlease find attached Sales Quotation ${document.number} from Lavender Auto Spare Parts.\n\nTotal: ${totals.totalFormatted}\n\nKind regards,\n${document.createdBy.name}${senderMobile}\nLavender Auto Spare Parts`,
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
        snapshotCustomerName: document.customer?.name ?? null,
        snapshotCustomerAddress: document.customer?.address ?? null,
        snapshotCustomerEmail: targetEmail,
        snapshotCustomerPhone: document.customer?.phone ?? null,
        snapshotCustomerTaxId: document.customer?.taxId ?? null,
      },
    });

    revalidatePath("/quotations");
    revalidatePath(`/quotations/${documentId}`);
    return { success: true, id: documentId };
  } catch (err: unknown) {
    console.error("sendQuotation error:", err);
    return { success: false, error: "An unexpected error occurred while sending email." };
  }
}
