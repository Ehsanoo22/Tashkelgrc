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
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff', color: '#1c1917' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 2, borderBottomColor: '#1c1917', paddingBottom: 20, marginBottom: 30 },
  logoSection: { flexDirection: 'column', width: '50%' },
  logoImage: { width: 140, marginBottom: 12 },
  companyName: { fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  companyDetails: { fontSize: 9, color: '#57534e', marginTop: 2 },
  quoteMeta: { textAlign: 'right', width: '50%' },
  quoteTitle: { fontSize: 18, fontWeight: 'bold', color: '#d4af37', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  metaText: { fontSize: 10, color: '#57534e', marginBottom: 4, fontWeight: 'bold' },
  metaValue: { fontWeight: 'normal', color: '#1c1917' },
  
  infoSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  billToSection: { width: '45%', padding: 15, backgroundColor: '#f5f5f4', borderRadius: 4 },
  sectionTitle: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#78716c', marginBottom: 8, fontWeight: 'bold' },
  clientName: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  clientDetails: { fontSize: 10, color: '#57534e', marginBottom: 2 },
  
  projectSection: { width: '45%', padding: 15, borderLeftWidth: 2, borderLeftColor: '#d4af37' },
  projectTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  
  breakdownTable: { width: '100%', marginBottom: 30 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1c1917', paddingBottom: 8, marginBottom: 10 },
  tableHeaderCell: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, color: '#1c1917' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e7e5e4', paddingVertical: 10 },
  colDesc: { width: '70%' },
  colTotal: { width: '30%', textAlign: 'right' },
  itemTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 2 },
  itemDesc: { fontSize: 9, color: '#57534e' },
  itemValue: { fontSize: 11, fontWeight: 'bold' },
  
  totalsSection: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 40 },
  totalsBox: { width: '40%' },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  totalsLabel: { fontSize: 10, color: '#57534e' },
  totalsValue: { fontSize: 10, fontWeight: 'bold' },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, marginTop: 4, borderTopWidth: 2, borderTopColor: '#1c1917', backgroundColor: '#fafaf9', paddingHorizontal: 8 },
  grandTotalLabel: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  grandTotalValue: { fontSize: 14, fontWeight: 'bold', color: '#d4af37' },
  
  legalSection: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e7e5e4', paddingTop: 20 },
  legalCol: { width: '30%' },
  legalTitle: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  legalText: { fontSize: 8, color: '#78716c', marginBottom: 3, lineHeight: 1.4 },
  
  qrCode: { width: 80, height: 80, marginTop: 10 }
});

const formatMoney = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(amount || 0);
};

export default function QuotePDFTemplate({ quoteData }) {
  const {
    id = 'EST-001',
    date = new Date().toLocaleDateString(),
    leadName = '',
    leadEmail = '',
    leadPhone = '',
    leadCompany = '',
    items = [],
    costBreakdown = {},
    currency = 'USD',
    validityDays = 30
  } = quoteData;

  const validUntil = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toLocaleDateString();
  const mainItem = items[0] || {};
  
  // Format breakdown logic
  const renderLineItem = (title, desc, amount) => {
    if (!amount || amount <= 0) return null;
    return (
      <View style={styles.tableRow}>
        <View style={styles.colDesc}>
          <Text style={styles.itemTitle}>{title}</Text>
          {desc && <Text style={styles.itemDesc}>{desc}</Text>}
        </View>
        <View style={styles.colTotal}>
          <Text style={styles.itemValue}>{formatMoney(amount, currency)}</Text>
        </View>
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image src={`${window.location.origin}/assets/logo_new.png`} style={styles.logoImage} />
            <Text style={styles.companyName}>TASHKEL GFRC</Text>
            <Text style={styles.companyDetails}>Industrial City, Damascus, Syria</Text>
            <Text style={styles.companyDetails}>+963 933 295 100 | info@tashkelgfrc.com</Text>
            <Text style={styles.companyDetails}>www.tashkelgfrc.com</Text>
          </View>
          <View style={styles.quoteMeta}>
            <Text style={styles.quoteTitle}>Commercial Proposal</Text>
            <Text style={styles.metaText}>Reference: <Text style={styles.metaValue}>{id}</Text></Text>
            <Text style={styles.metaText}>Date of Issue: <Text style={styles.metaValue}>{date}</Text></Text>
            <Text style={styles.metaText}>Valid Until: <Text style={styles.metaValue}>{validUntil}</Text></Text>
          </View>
        </View>

        {/* Client & Project Info */}
        <View style={styles.infoSection}>
          <View style={styles.billToSection}>
            <Text style={styles.sectionTitle}>Prepared For</Text>
            <Text style={styles.clientName}>{leadCompany || leadName}</Text>
            {leadCompany && <Text style={styles.clientDetails}>Attn: {leadName}</Text>}
            <Text style={styles.clientDetails}>{leadEmail}</Text>
            <Text style={styles.clientDetails}>{leadPhone}</Text>
          </View>
          
          <View style={styles.projectSection}>
            <Text style={styles.sectionTitle}>Project Overview</Text>
            <Text style={styles.projectTitle}>{mainItem.category}</Text>
            <Text style={styles.clientDetails}>Quantity: {mainItem.qty} {mainItem.metricType}</Text>
            <Text style={styles.clientDetails}>Finish: {mainItem.texture}</Text>
            <Text style={styles.clientDetails}>Color: {mainItem.pigment}</Text>
            <Text style={styles.clientDetails}>Structural: {mainItem.structural}</Text>
          </View>
        </View>

        {/* Detailed Cost Breakdown Table */}
        <View style={styles.breakdownTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Amount</Text>
          </View>
          
          {renderLineItem("Base Manufacturing", `Manufacturing of ${mainItem.qty} ${mainItem.metricType} of GFRC ${mainItem.category}.`, costBreakdown.materialCost)}
          {renderLineItem("Custom Finish & Pigment Premium", `${mainItem.texture} texture with ${mainItem.pigment} coloration.`, costBreakdown.finishAdjustment + costBreakdown.colorAdjustment)}
          {renderLineItem("Structural Backing System", `Integration of ${mainItem.structural} support systems.`, costBreakdown.structuralAdjustment)}
          {renderLineItem("Mould Setup & Fabrication", `${mainItem.moldComplexity} complexity moulds required for production.`, costBreakdown.mouldFee)}
          {renderLineItem("Engineering & Design", "Shop drawings, structural calculations, and 3D modeling.", costBreakdown.engineeringFee)}
          {renderLineItem("Installation Services", "Professional on-site installation team and equipment.", costBreakdown.installationFee)}
          {renderLineItem("Logistics & Freight", "Transportation to site and heavy lifting requirements.", costBreakdown.logisticsFee)}
          {renderLineItem("Project Management & Contingency", "Dedicated PM and risk mitigation allocation.", costBreakdown.marginAndContingency)}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{formatMoney(costBreakdown.subtotalRaw + costBreakdown.marginAndContingency, currency)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Tax / VAT ({(quoteData.taxPercentage || 0)}%)</Text>
              <Text style={styles.totalsValue}>{formatMoney(costBreakdown.taxAmount, currency)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Estimated Total</Text>
              <Text style={styles.grandTotalValue}>{formatMoney(costBreakdown.grandTotal, currency)}</Text>
            </View>
          </View>
        </View>

        {/* Legal & Terms */}
        <View style={styles.legalSection}>
          <View style={styles.legalCol}>
            <Text style={styles.legalTitle}>Assumptions & Inclusions</Text>
            <Text style={styles.legalText}>• Assumes continuous access to site during standard hours.</Text>
            <Text style={styles.legalText}>• Includes standard quality control and strength testing.</Text>
            <Text style={styles.legalText}>• Includes protective packaging during transport.</Text>
          </View>
          <View style={styles.legalCol}>
            <Text style={styles.legalTitle}>Exclusions</Text>
            <Text style={styles.legalText}>• Primary steel structure of the building.</Text>
            <Text style={styles.legalText}>• MEP penetrations not shown in drawings.</Text>
            <Text style={styles.legalText}>• Third-party laboratory testing if requested.</Text>
            <Text style={styles.legalText}>• Local municipality permits.</Text>
          </View>
          <View style={styles.legalCol}>
            <Text style={styles.legalTitle}>Payment Terms</Text>
            <Text style={styles.legalText}>• 50% Advance Payment on order.</Text>
            <Text style={styles.legalText}>• 40% Prior to dispatch from factory.</Text>
            <Text style={styles.legalText}>• 10% Upon completion of installation.</Text>
            
            {/* Dynamic QR Code */}
            <Image src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://tashkelgfrc.com/contact`} style={styles.qrCode} />
          </View>
        </View>

      </Page>
    </Document>
  );
}
