import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Standard fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhjp-Ek-_EeA.woff' }, // 400
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZJhjp-Ek-_EeA.woff', fontWeight: 600 }, // 600
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZJhjp-Ek-_EeA.woff', fontWeight: 700 }, // 700
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontFamily: 'Helvetica', // fallback to Helvetica since Inter WOFF might not load instantly in all environments
    backgroundColor: '#ffffff',
    color: '#1c1917', // brand-dark
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 60,
  },
  logoSection: {
    flexDirection: 'column',
    width: '40%',
  },
  logoImage: {
    width: 120,
    marginBottom: 12,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 9,
    color: '#78716c',
    lineHeight: 1.5,
  },
  quoteMeta: {
    textAlign: 'right',
  },
  quoteTitle: {
    fontSize: 28,
    fontWeight: 'light',
    color: '#d4af37', // brand-warm approximation
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  metaText: {
    fontSize: 10,
    color: '#57534e',
    marginBottom: 4,
  },
  billToSection: {
    marginBottom: 40,
    borderLeftWidth: 2,
    borderLeftColor: '#e7e5e4',
    paddingLeft: 12,
  },
  billToLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#a8a29e',
    marginBottom: 6,
  },
  clientName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  clientDetails: {
    fontSize: 10,
    color: '#57534e',
    lineHeight: 1.4,
  },
  table: {
    width: '100%',
    marginBottom: 40,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1c1917',
    paddingBottom: 8,
    marginBottom: 12,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#1c1917',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f4',
    paddingVertical: 12,
  },
  col1: { width: '40%' },
  col2: { width: '20%' },
  col3: { width: '15%' },
  col4: { width: '25%', textAlign: 'right' },
  itemTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemSpecs: {
    fontSize: 9,
    color: '#57534e',
    lineHeight: 1.4,
  },
  cellText: {
    fontSize: 10,
    color: '#1c1917',
  },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  totalsBox: {
    width: '40%',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f4',
  },
  totalsLabel: {
    fontSize: 10,
    color: '#57534e',
  },
  totalsValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 4,
    borderTopWidth: 2,
    borderTopColor: '#1c1917',
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    left: 60,
    right: 60,
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4',
    paddingTop: 16,
  },
  footerTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  footerText: {
    fontSize: 8,
    color: '#78716c',
    lineHeight: 1.5,
  }
});

// Helper for formatting currency dynamically
const formatMoney = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount || 0);
};

export default function QuotePDFTemplate({ quoteData }) {
  const {
    id = 'EST-001',
    date = new Date().toLocaleDateString(),
    leadName = '',
    leadEmail = '',
    leadPhone = '',
    items = [],
    engineeringFee = 0,
    logisticsFee = 0,
    installationFee = 0,
    currency = 'USD',
    taxPercentage = 0,
  } = quoteData;

  const itemsTotal = items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.unitPrice)) + Number(item.moldFee), 0);
  const subTotalBeforeTax = itemsTotal + Number(engineeringFee) + Number(logisticsFee) + Number(installationFee);
  const taxAmount = subTotalBeforeTax * (Number(taxPercentage) / 100);
  const grandTotal = subTotalBeforeTax + taxAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            {/* The absolute URL ensures react-pdf can fetch it regardless of route */}
            <Image 
              src={`${window.location.origin}/assets/logo_new.png`} 
              style={styles.logoImage} 
            />
            <Text style={styles.companyName}>TASHKEL GFRC</Text>
            <Text style={styles.companyDetails}>Damascus, Syria</Text>
            <Text style={styles.companyDetails}>+963 944 000 000</Text>
            <Text style={styles.companyDetails}>info@tashkelgfrc.com</Text>
          </View>
          <View style={styles.quoteMeta}>
            <Text style={styles.quoteTitle}>Estimate</Text>
            <Text style={styles.metaText}>Ref: {id}</Text>
            <Text style={styles.metaText}>Date: {date}</Text>
            <Text style={styles.metaText}>Valid until: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.billToSection}>
          <Text style={styles.billToLabel}>Prepared For</Text>
          <Text style={styles.clientName}>{leadName}</Text>
          {leadEmail && <Text style={styles.clientDetails}>{leadEmail}</Text>}
          {leadPhone && <Text style={styles.clientDetails}>{leadPhone}</Text>}
        </View>

        {/* Line Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.col1]}>Element Specification</Text>
            <Text style={[styles.tableHeaderCell, styles.col2]}>Fabrication / Mold</Text>
            <Text style={[styles.tableHeaderCell, styles.col3]}>Qty / Rate</Text>
            <Text style={[styles.tableHeaderCell, styles.col4]}>Line Total</Text>
          </View>

          {items.map((item, index) => {
            const lineTotal = (Number(item.qty) * Number(item.unitPrice)) + Number(item.moldFee);
            return (
              <View key={index} style={styles.tableRow}>
                <View style={styles.col1}>
                  <Text style={styles.itemTitle}>{item.category || 'Custom Element'}</Text>
                  <Text style={styles.itemSpecs}>Dims: {item.length}m L x {item.width}m W x {item.depth}mm D</Text>
                  <Text style={styles.itemSpecs}>Struct: {item.structural}</Text>
                  <Text style={styles.itemSpecs}>Inserts: {item.inserts} pcs</Text>
                </View>
                <View style={styles.col2}>
                  <Text style={styles.itemSpecs}>Mold: {item.moldComplexity}</Text>
                  <Text style={styles.itemSpecs}>Finish: {item.texture}</Text>
                  <Text style={styles.itemSpecs}>Color: {item.pigment}</Text>
                  <Text style={styles.itemSpecs}>Mold Fee: {formatMoney(item.moldFee, currency)}</Text>
                </View>
                <View style={styles.col3}>
                  <Text style={styles.cellText}>{Number(item.qty)} {item.metricType}</Text>
                  <Text style={[styles.itemSpecs, { marginTop: 4 }]}>@ {formatMoney(item.unitPrice, currency)}/{item.metricType}</Text>
                </View>
                <View style={styles.col4}>
                  <Text style={[styles.cellText, { fontWeight: 'bold' }]}>{formatMoney(lineTotal, currency)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Elements Subtotal</Text>
              <Text style={styles.totalsValue}>{formatMoney(itemsTotal, currency)}</Text>
            </View>
            
            {Number(engineeringFee) > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Engineering & Shop Drawings</Text>
                <Text style={styles.totalsValue}>{formatMoney(engineeringFee, currency)}</Text>
              </View>
            )}
            
            {Number(logisticsFee) > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Logistics & Freight</Text>
                <Text style={styles.totalsValue}>{formatMoney(logisticsFee, currency)}</Text>
              </View>
            )}
            
            {Number(installationFee) > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Installation Services</Text>
                <Text style={styles.totalsValue}>{formatMoney(installationFee, currency)}</Text>
              </View>
            )}

            {Number(taxPercentage) > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Tax/VAT ({taxPercentage}%)</Text>
                <Text style={styles.totalsValue}>{formatMoney(taxAmount, currency)}</Text>
              </View>
            )}

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>{formatMoney(grandTotal, currency)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Terms & Conditions</Text>
          <Text style={styles.footerText}>
            1. This estimate is valid for 30 days from the date of issue.
          </Text>
          <Text style={styles.footerText}>
            2. Production lead time begins upon receipt of a 50% deposit and approval of shop drawings.
          </Text>
          <Text style={styles.footerText}>
            3. Final balance is due prior to dispatch from the factory.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
