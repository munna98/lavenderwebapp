import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeTotals } from "@/lib/utils/totals";
import { renderToBuffer } from "@react-pdf/renderer";
import PurchaseOrderPdf from "@/components/pdf/purchase-order-pdf";
import { createElement } from "react";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAuth();
  const { id } = await params;

  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      supplier: true,
      createdBy: true,
      items: true,
    },
  });

  if (!doc) {
    return new NextResponse("Document not found", { status: 404 });
  }

  try {
    const totals = computeTotals(
      doc.items.map((i) => ({
        qty: i.qty.toString(),
        rate: i.rate.toString(),
        taxPercent: i.taxPercent.toString(),
      }))
    );

    const pdfBuffer = await renderToBuffer(
      createElement(PurchaseOrderPdf, { document: doc, totals }) as unknown as React.ReactElement<any>
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${doc.number}.pdf"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new NextResponse("Error generating PDF", { status: 500 });
  }
}
