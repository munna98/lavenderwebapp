import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type { Document as PrismaDocument, Supplier, User, DocumentItem } from "@prisma/client";
import path from "path";

type DocumentWithRelations = PrismaDocument & {
  supplier: Supplier;
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
};

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 70,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#000000",
    backgroundColor: "#FFFFFF",
  },
  headerBannerContainer: {
    width: "100%",
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E2DC",
    paddingBottom: 4,
  },
  headerBannerImage: {
    width: "100%",
    height: 82,
    objectFit: "contain",
  },
  titleContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    marginBottom: 6,
  },
  centerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#000000",
  },
  addressGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 2,
  },
  addressCol: {
    width: "48%",
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#000000",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  partyName: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#000000",
  },
  addressText: {
    color: "#222222",
    fontSize: 8.5,
    lineHeight: 1.25,
    marginBottom: 1,
  },
  table: {
    width: "100%",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F5F4F0",
    borderBottomWidth: 1,
    borderBottomColor: "#E4E2DC",
    paddingVertical: 5,
    paddingHorizontal: 6,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E4E2DC",
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  colSlNo: { width: "6%", textAlign: "center" },
  colPartNo: { width: "30%" },
  colDesc: { width: "42%" },
  colQty: { width: "10%", textAlign: "right" },
  colRate: { width: "12%", textAlign: "right" },

  notesSection: {
    borderTopWidth: 1,
    borderTopColor: "#E4E2DC",
    paddingTop: 8,
    marginTop: 8,
  },
  footerBannerContainer: {
    position: "absolute",
    bottom: 12,
    left: 8,
    right: 8,
    alignItems: "center",
  },
  footerBannerImage: {
    width: "100%",
    height: 52,
    objectFit: "contain",
  },
});

export default function PurchaseOrderPdf({ document: doc }: Props) {
  const supplierName = doc.snapshotSupplierName || doc.supplier.name;
  const supplierAddress = doc.snapshotSupplierAddress || doc.supplier.address;
  const supplierPhone = doc.snapshotSupplierPhone || doc.supplier.phone;
  const supplierEmail = doc.supplierEmail || doc.snapshotSupplierEmail || doc.supplier.email;
  const supplierTaxId = doc.snapshotSupplierTaxId || doc.supplier.taxId;

  const dateStr = (doc.sentAt || doc.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const headerBannerPath = path.join(process.cwd(), "public", "images", "header-banner.png");
  const footerBannerPath = path.join(process.cwd(), "public", "images", "footer-banner.png");

  return (
    <Document title={`PO_${doc.number}`}>
      <Page size="A4" style={styles.page}>
        {/* Official Header Banner */}
        <View style={styles.headerBannerContainer}>
          <Image src={headerBannerPath} style={styles.headerBannerImage} />
        </View>

        {/* Centered Document Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.centerTitle}>PURCHASE ORDER</Text>
        </View>

        {/* Supplier & PO Details */}
        <View style={styles.addressGrid}>
          <View style={styles.addressCol}>
            <Text style={styles.sectionLabel}>Supplier</Text>
            <Text style={styles.partyName}>{supplierName}</Text>
            {supplierAddress && <Text style={styles.addressText}>{supplierAddress}</Text>}
            {supplierPhone && <Text style={styles.addressText}>Phone: {supplierPhone}</Text>}
            {supplierEmail && <Text style={styles.addressText}>Email: {supplierEmail}</Text>}
            {supplierTaxId && <Text style={styles.addressText}>Tax ID: {supplierTaxId}</Text>}
          </View>

          <View style={styles.addressCol}>
            <Text style={styles.sectionLabel}>PO Details</Text>
            <Text style={styles.partyName}>{doc.number}</Text>
            <Text style={styles.addressText}>Date: {dateStr}</Text>
            <Text style={styles.addressText}>Issued By: Lavender Auto Parts</Text>
            <Text style={styles.addressText}>Prepared by: {doc.createdBy.name}</Text>
            <Text style={styles.addressText}>Email: {doc.createdBy.email}</Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colSlNo}>#</Text>
            <Text style={styles.colPartNo}>Part #</Text>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colRate}>Rate</Text>
          </View>

          {doc.items.map((item, idx) => {
            const qty = Number(item.qty);
            const rate = Number(item.rate);

            return (
              <View key={item.id || idx} style={styles.tableRow}>
                <Text style={styles.colSlNo}>{idx + 1}</Text>
                <Text style={styles.colPartNo}>{item.partNumber}</Text>
                <Text style={styles.colDesc}>{item.name || "—"}</Text>
                <Text style={styles.colQty}>{qty.toString()}</Text>
                <Text style={styles.colRate}>{rate.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        {/* Notes */}
        {doc.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionLabel}>Notes & Instructions</Text>
            <Text style={styles.addressText}>{doc.notes}</Text>
          </View>
        )}

        {/* Official Footer Banner */}
        <View style={styles.footerBannerContainer}>
          <Image src={footerBannerPath} style={styles.footerBannerImage} />
        </View>
      </Page>
    </Document>
  );
}
