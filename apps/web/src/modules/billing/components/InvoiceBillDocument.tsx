import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { AddressInput } from '@agridealer/contracts'
import { formatDate, formatMoney } from '@/utils/format'
import type { Invoice } from '../api/invoicesApi'

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: 'Helvetica' },
  dealerName: { fontSize: 16, fontWeight: 700, marginBottom: 2 },
  muted: { color: '#555555' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  section: { marginBottom: 12 },
  label: { color: '#555555', fontSize: 9 },
  table: { marginTop: 8 },
  tableHeaderRow: { flexDirection: 'row', borderBottom: '1 solid #333333', paddingBottom: 4, marginBottom: 4 },
  tableRow: { flexDirection: 'row', borderBottom: '1 solid #dddddd', paddingVertical: 4 },
  colProduct: { flex: 3 },
  colQty: { flex: 1, textAlign: 'right' },
  colPrice: { flex: 1.3, textAlign: 'right' },
  colDiscount: { flex: 1.3, textAlign: 'right' },
  colTax: { flex: 1, textAlign: 'right' },
  colTotal: { flex: 1.4, textAlign: 'right' },
  totals: { marginTop: 12, alignItems: 'flex-end' },
  totalsRow: { flexDirection: 'row', width: 220, justifyContent: 'space-between', marginBottom: 2 },
  grandTotalRow: { flexDirection: 'row', width: 220, justifyContent: 'space-between', marginTop: 4, paddingTop: 4, borderTop: '1 solid #333333' },
  bold: { fontWeight: 700 },
})

export interface BillLabels {
  bill: string
  invoiceNumber: string
  date: string
  billTo: string
  walkInCustomer: string
  product: string
  quantity: string
  unitPrice: string
  discount: string
  tax: string
  total: string
  subtotal: string
  discountTotal: string
  taxTotal: string
  grandTotal: string
  amountPaid: string
  balanceDue: string
  gstin: string
  phone: string
}

export interface DealerInfo {
  name: string
  address?: AddressInput
  gstin?: string
  phone?: string
}

export function InvoiceBillDocument({
  invoice,
  dealer,
  locale,
  labels,
}: {
  invoice: Invoice
  dealer: DealerInfo
  locale: string
  labels: BillLabels
}) {
  const addressLines = dealer.address
    ? [dealer.address.line1, dealer.address.line2, `${dealer.address.city}, ${dealer.address.state} ${dealer.address.pincode}`].filter(Boolean)
    : []

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.row}>
          <View>
            <Text style={styles.dealerName}>{dealer.name}</Text>
            {addressLines.map((line, i) => (
              <Text key={i} style={styles.muted}>{line}</Text>
            ))}
            {dealer.gstin && <Text style={styles.muted}>{labels.gstin}: {dealer.gstin}</Text>}
            {dealer.phone && <Text style={styles.muted}>{labels.phone}: {dealer.phone}</Text>}
          </View>
          <View>
            <Text style={styles.bold}>{labels.invoiceNumber}: {invoice.invoiceNumber}</Text>
            <Text style={styles.muted}>{labels.date}: {formatDate(invoice.createdAt, locale)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{labels.billTo}</Text>
          <Text style={styles.bold}>{invoice.customerName ?? labels.walkInCustomer}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colProduct, styles.bold]}>{labels.product}</Text>
            <Text style={[styles.colQty, styles.bold]}>{labels.quantity}</Text>
            <Text style={[styles.colPrice, styles.bold]}>{labels.unitPrice}</Text>
            <Text style={[styles.colDiscount, styles.bold]}>{labels.discount}</Text>
            <Text style={[styles.colTax, styles.bold]}>{labels.tax}</Text>
            <Text style={[styles.colTotal, styles.bold]}>{labels.total}</Text>
          </View>
          {invoice.lines.map((line, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colProduct}>{line.productName}</Text>
              <Text style={styles.colQty}>{line.quantity}</Text>
              <Text style={styles.colPrice}>{formatMoney(line.unitPricePaise, locale)}</Text>
              <Text style={styles.colDiscount}>{formatMoney(line.discountPaise, locale)}</Text>
              <Text style={styles.colTax}>{line.taxRatePercent}%</Text>
              <Text style={styles.colTotal}>{formatMoney(line.lineTotalPaise, locale)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <Text>{labels.subtotal}</Text>
            <Text>{formatMoney(invoice.subtotalPaise, locale)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text>{labels.discountTotal}</Text>
            <Text>{formatMoney(invoice.discountTotalPaise, locale)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text>{labels.taxTotal}</Text>
            <Text>{formatMoney(invoice.taxTotalPaise, locale)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.bold}>{labels.grandTotal}</Text>
            <Text style={styles.bold}>{formatMoney(invoice.grandTotalPaise, locale)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text>{labels.amountPaid}</Text>
            <Text>{formatMoney(invoice.amountPaidPaise, locale)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.bold}>{labels.balanceDue}</Text>
            <Text style={styles.bold}>{formatMoney(invoice.grandTotalPaise - invoice.amountPaidPaise, locale)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
