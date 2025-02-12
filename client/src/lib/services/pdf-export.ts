import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import type { ValuationFormData } from "../validations";

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10
  },
  body: {
    fontSize: 12,
    marginBottom: 5
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5
  },
  label: {
    width: '40%',
    fontWeight: 'bold'
  },
  value: {
    width: '60%'
  }
});

export interface ValuationReport {
  stage: string;
  valuation: number;
  metrics: Record<string, number | string>;
  recommendations: string[];
  date: string;
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
};

export const ValuationPDFDocument = ({ data }: { data: ValuationReport }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Startup Valuation Report</Text>
        <Text style={styles.subtitle}>Generated on {data.date}</Text>
        
        <View style={styles.section}>
          <Text style={styles.subtitle}>Company Overview</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Stage:</Text>
            <Text style={styles.value}>{data.stage}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Valuation:</Text>
            <Text style={styles.value}>{formatCurrency(data.valuation)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Key Metrics</Text>
          {Object.entries(data.metrics).map(([key, value]) => (
            <View style={styles.row} key={key}>
              <Text style={styles.label}>{key}:</Text>
              <Text style={styles.value}>
                {typeof value === 'number' ? formatCurrency(value) : value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Recommendations</Text>
          {data.recommendations.map((rec, index) => (
            <Text style={styles.body} key={index}>• {rec}</Text>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

export const generateValuationPDF = (formData: ValuationFormData): ValuationReport => {
  // Transform form data into report format
  return {
    stage: formData.businessInfo.productStage,
    valuation: 1000000, // This should come from actual valuation calculation
    metrics: {
      'Revenue': formData.financialData?.revenue || 0,
      'Growth Rate': `${formData.financialData?.growthRate || 0}%`,
      'Burn Rate': formData.financialData?.burnRate || 0,
    },
    recommendations: [
      'Consider expanding your market reach',
      'Focus on reducing customer acquisition costs',
      'Improve unit economics'
    ],
    date: new Date().toLocaleDateString()
  };
};
