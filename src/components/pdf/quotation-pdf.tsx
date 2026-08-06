import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type { Document as PrismaDocument, Customer, User, DocumentItem } from "@prisma/client";
import path from "path";

type DocumentWithRelations = PrismaDocument & {
  customer: Customer | null;
  createdBy: User;
  items: DocumentItem[];
};

type Totals = {
  subtotal: number;
  totalTax: number;
  total: number;
  subtotalFormatted: string;
  totalTaxFormatted: string;
  totalFormatted: string;
};

type Props = {
  document: DocumentWithRelations;
  totals?: Totals;
  showPartNumber?: boolean;
};

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 80,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#111111",
    backgroundColor: "#FFFFFF",
  },
  headerBannerContainer: {
    width: "100%",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E0D8",
    paddingBottom: 6,
  },
  headerBannerImage: {
    width: "100%",
    height: 75,
    objectFit: "contain",
  },
  titleContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 14,
  },
  centerTitle: {
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 3,
    color: "#111111",
  },
  addressGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    marginTop: 4,
  },
  addressColLeft: {
    width: "48%",
  },
  addressColRight: {
    width: "44%",
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#666666",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  partyName: {
    fontSize: 10.5,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000000",
  },
  addressText: {
    color: "#333333",
    fontSize: 8.5,
    lineHeight: 1.4,
    marginBottom: 2,
  },
  table: {
    width: "100%",
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F6F2",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E0D8",
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEA",
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  colSlNo: { width: "5%", textAlign: "center", color: "#666666", fontSize: 8.5 },
  colPartNo: { width: "20%", fontWeight: "bold", fontSize: 8.5 },
  colDesc: { width: "50%", fontSize: 8.5 },
  colQty: { width: "10%", textAlign: "right", fontSize: 8.5 },
  colRate: { width: "15%", textAlign: "right", fontSize: 8.5 },

  summarySectionContainer: {
    width: "100%",
    marginTop: 6,
    marginBottom: 14,
  },
  totalsContainer: {
    width: "40%",
    marginLeft: "auto",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#E2E0D8",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2.5,
  },
  totalLabel: {
    fontSize: 8.5,
    color: "#555555",
  },
  totalValue: {
    fontSize: 8.5,
    fontWeight: "bold",
    textAlign: "right",
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: "#111111",
    paddingTop: 4,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#000000",
  },
  grandTotalValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "right",
  },

  notesSection: {
    borderTopWidth: 1,
    borderTopColor: "#E2E0D8",
    paddingTop: 10,
    marginTop: 10,
  },
  notesText: {
    color: "#333333",
    fontSize: 8.5,
    lineHeight: 1.4,
  },

  footnoteSection: {
    marginTop: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E0D8",
    alignItems: "center",
  },
  footnoteText: {
    fontSize: 8,
    fontStyle: "italic",
    color: "#555555",
    textAlign: "center",
  },

  footerBannerContainer: {
    position: "absolute",
    bottom: 16,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  footerBannerImage: {
    width: "100%",
    height: 48,
    objectFit: "contain",
  },
});

export default function QuotationPdf({ document: doc, showPartNumber = false }: Props) {
  const customerName = doc.snapshotCustomerName || doc.customer?.name || "Cash Customer";
  const customerAddress = doc.snapshotCustomerAddress || doc.customer?.address;
  const customerPhone = doc.snapshotCustomerPhone || doc.customer?.phone;
  const customerEmail = doc.customerEmail || doc.snapshotCustomerEmail || doc.customer?.email;
  const customerTaxId = doc.snapshotCustomerTaxId || doc.customer?.taxId;

  const dateStr = (doc.sentAt || doc.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const headerBannerPath = path.join(process.cwd(), "public", "images", "header-banner.png");
  const footerBannerPath = path.join(process.cwd(), "public", "images", "footer-banner.png");

  // Calculate Subtotal, 5% VAT, and Grand Total
  const subtotal = doc.items.reduce((acc, item) => acc + Number(item.qty) * Number(item.rate), 0);
  const vatAmount = subtotal * 0.05;
  const grandTotal = subtotal + vatAmount;

  const fmt = (num: number) =>
    num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const colDescStyle = showPartNumber ? styles.colDesc : [styles.colDesc, { width: "70%" }];

  return (
    <Document title={`Quotation_${doc.number}`}>
      <Page size="A4" style={styles.page}>
        {/* Official Header Banner */}
        <View style={styles.headerBannerContainer} fixed>
          <Image src={headerBannerPath} style={styles.headerBannerImage} />
        </View>

        {/* Centered Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.centerTitle}>SALES QUOTATION</Text>
        </View>

        {/* Customer & Quotation Details */}
        <View style={styles.addressGrid}>
          <View style={styles.addressColLeft}>
            <Text style={styles.sectionLabel}>Customer</Text>
            <Text style={styles.partyName}>{customerName}</Text>
            {customerAddress && <Text style={styles.addressText}>{customerAddress}</Text>}
            {customerPhone && <Text style={styles.addressText}>Phone: {customerPhone}</Text>}
            {customerEmail && <Text style={styles.addressText}>Email: {customerEmail}</Text>}
            {customerTaxId && <Text style={styles.addressText}>Tax ID: {customerTaxId}</Text>}
          </View>

          <View style={styles.addressColRight}>
            <Text style={styles.sectionLabel}>Quotation Details</Text>
            <Text style={styles.partyName}>{doc.number}</Text>
            <Text style={styles.addressText}>Date: {dateStr}</Text>
            <Text style={styles.addressText}>Issued By: Lavender Auto Spare Parts</Text>
            <Text style={styles.addressText}>Prepared by: {doc.createdBy.name}</Text>
            {doc.createdBy.phone && <Text style={styles.addressText}>Mobile: {doc.createdBy.phone}</Text>}
            <Text style={styles.addressText}>Email: lavenderautospareparts@gmail.com</Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text style={styles.colSlNo}>#</Text>
            {showPartNumber && <Text style={styles.colPartNo}>Part #</Text>}
            <Text style={colDescStyle}>Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colRate}>Rate</Text>
          </View>

          {doc.items.map((item, idx) => {
            const qty = Number(item.qty);
            const rate = Number(item.rate);

            return (
              <View key={item.id || idx} style={styles.tableRow}>
                <Text style={styles.colSlNo}>{idx + 1}</Text>
                {showPartNumber && <Text style={styles.colPartNo}>{item.partNumber || "—"}</Text>}
                <Text style={colDescStyle}>{item.name || "—"}</Text>
                <Text style={styles.colQty}>{qty.toString()}</Text>
                <Text style={styles.colRate}>{fmt(rate)}</Text>
              </View>
            );
          })}
        </View>

        {/* Bottom Summary Section */}
        <View style={styles.summarySectionContainer} wrap={false}>
          <View style={styles.totalsContainer} wrap={false}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>{fmt(subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>VAT (5%):</Text>
              <Text style={styles.totalValue}>{fmt(vatAmount)}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Total (incl. VAT):</Text>
              <Text style={styles.grandTotalValue}>{fmt(grandTotal)}</Text>
            </View>
          </View>

          {/* Notes & Instructions */}
          {doc.notes && (
            <View style={styles.notesSection} wrap={false}>
              <Text style={styles.sectionLabel}>Notes & Terms</Text>
              <Text style={styles.notesText}>{doc.notes}</Text>
            </View>
          )}

          {/* Footnote */}
          <View style={styles.footnoteSection} wrap={false}>
            <Text style={styles.footnoteText}>
              Thank you for choosing Lavender Auto Spare Parts. We appreciate your business and look forward to serving you.
            </Text>
          </View>
        </View>

        {/* Official Footer Banner */}
        <View style={styles.footerBannerContainer} fixed>
          <Image src={footerBannerPath} style={styles.footerBannerImage} />
        </View>
      </Page>
    </Document>
  );
}
