import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Document as PrismaDocument, Supplier, User, DocumentItem } from "@prisma/client";

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
  totals: Totals;
};

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1A1917",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#E4E2DC",
    borderBottomStyle: "solid",
    paddingBottom: 16,
    marginBottom: 20,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F5C4E",
    marginBottom: 4,
  },
  companySub: {
    fontSize: 8,
    color: "#70766F",
  },
  docTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
    color: "#1F5C4E",
  },
  docMeta: {
    fontSize: 9,
    color: "#70766F",
    textAlign: "right",
    marginTop: 4,
  },
  addressGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  addressCol: {
    width: "48%",
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#70766F",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  partyName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4,
  },
  addressText: {
    color: "#4A4D4A",
    lineHeight: 1.4,
  },
  table: {
    width: "100%",
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F5F4F0",
    borderBottomWidth: 1,
    borderBottomColor: "#E4E2DC",
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E4E2DC",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  colSlNo: { width: "6%", textAlign: "center" },
  colPartNo: { width: "30%" },
  colDesc: { width: "42%" },
  colQty: { width: "10%", textAlign: "right" },
  colRate: { width: "12%", textAlign: "right" },

  notesSection: {
    borderTopWidth: 1,
    borderTopColor: "#E4E2DC",
    paddingTop: 12,
    marginTop: 12,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    textAlign: "center",
    fontSize: 8,
    color: "#9BA09A",
    borderTopWidth: 1,
    borderTopColor: "#E4E2DC",
    paddingTop: 8,
  },
});

export default function PurchaseOrderPdf({ document: doc }: Props) {
  const supplierName = doc.snapshotSupplierName || doc.supplier.name;
  const supplierAddress = doc.snapshotSupplierAddress || doc.supplier.address;
  const supplierPhone = doc.snapshotSupplierPhone || doc.supplier.phone;
  const supplierEmail = doc.snapshotSupplierEmail || doc.supplier.email;
  const supplierTaxId = doc.snapshotSupplierTaxId || doc.supplier.taxId;

  const dateStr = (doc.sentAt || doc.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Document title={`PO_${doc.number}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>Lavender Auto Parts</Text>
            <Text style={styles.companySub}>orders@lavenderautoparts.com</Text>
          </View>
          <View>
            <Text style={styles.docTitle}>PURCHASE ORDER</Text>
            <Text style={styles.docMeta}>PO Number: {doc.number}</Text>
            <Text style={styles.docMeta}>Date: {dateStr}</Text>
          </View>
        </View>

        {/* Vendor & Delivery info */}
        <View style={styles.addressGrid}>
          <View style={styles.addressCol}>
            <Text style={styles.sectionLabel}>Vendor / Supplier</Text>
            <Text style={styles.partyName}>{supplierName}</Text>
            {supplierAddress && <Text style={styles.addressText}>{supplierAddress}</Text>}
            {supplierPhone && <Text style={styles.addressText}>Phone: {supplierPhone}</Text>}
            {supplierEmail && <Text style={styles.addressText}>Email: {supplierEmail}</Text>}
            {supplierTaxId && <Text style={styles.addressText}>Tax ID: {supplierTaxId}</Text>}
          </View>
          <View style={styles.addressCol}>
            <Text style={styles.sectionLabel}>Issued By</Text>
            <Text style={styles.partyName}>Lavender Auto Parts</Text>
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

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for your business. For inquiries regarding this purchase order, please contact {doc.createdBy.email}.
        </Text>
      </Page>
    </Document>
  );
}
