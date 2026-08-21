import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import type { InvoiceData } from './invoice.service';

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 16, fontWeight: 700 },
  section: { marginBottom: 16 },
  row: { flexDirection: 'row', borderBottom: '1 solid #e2e8f0', paddingVertical: 4 },
  headerRow: { flexDirection: 'row', borderBottom: '1 solid #0f172a', paddingVertical: 4, fontWeight: 700 },
  col: { flex: 1 },
  colRight: { flex: 1, textAlign: 'right' },
  totalsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 },
  totalsLabel: { width: 120, textAlign: 'right', marginRight: 12 },
  totalsValue: { width: 80, textAlign: 'right' },
});

function formatInr(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

export async function renderInvoicePdf(data: InvoiceData): Promise<Buffer> {
  const address = data.shippingAddress as Record<string, string> | null;

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>MarketHub</Text>
          <View>
            <Text>Tax Invoice: {data.invoiceNumber}</Text>
            <Text>{new Date(data.invoiceDate).toLocaleDateString('en-IN')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text>Billed to: {data.customerName} ({data.customerEmail})</Text>
          {address && (
            <Text>
              {address.line1 ?? ''}, {address.city ?? ''} - {address.postalCode ?? ''}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.col}>Item</Text>
            <Text style={styles.col}>Store</Text>
            <Text style={styles.colRight}>Qty</Text>
            <Text style={styles.colRight}>Unit Price</Text>
            <Text style={styles.colRight}>Total</Text>
          </View>
          {data.items.map((item, i) => (
            <View style={styles.row} key={i}>
              <Text style={styles.col}>{item.productTitle}</Text>
              <Text style={styles.col}>{item.storeName}</Text>
              <Text style={styles.colRight}>{item.quantity}</Text>
              <Text style={styles.colRight}>{formatInr(item.unitPrice)}</Text>
              <Text style={styles.colRight}>{formatInr(item.totalPrice)}</Text>
            </View>
          ))}
        </View>

        <View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{formatInr(data.financials.subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax</Text>
            <Text style={styles.totalsValue}>{formatInr(data.financials.taxAmount)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Shipping</Text>
            <Text style={styles.totalsValue}>{formatInr(data.financials.shippingAmount)}</Text>
          </View>
          {data.financials.discountAmount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Discount</Text>
              <Text style={styles.totalsValue}>-{formatInr(data.financials.discountAmount)}</Text>
            </View>
          )}
          <View style={styles.totalsRow}>
            <Text style={[styles.totalsLabel, { fontWeight: 700 }]}>Grand Total</Text>
            <Text style={[styles.totalsValue, { fontWeight: 700 }]}>{formatInr(data.financials.totalAmount)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}