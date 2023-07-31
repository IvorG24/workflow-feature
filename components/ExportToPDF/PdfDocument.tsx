import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: "30pt 30pt 54pt",
    fontFamily: "Open Sans",
    fontSize: "10pt",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  section: {
    flexDirection: "column",
    gap: 12,
  },
  column: {
    flexDirection: "column",
    gap: 10,
  },
  columnItem: {
    gap: 2,
  },
  rowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  divider: {
    borderBottom: "1px solid #495057",
    marginTop: 20,
    marginBottom: 20,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#495057",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logo: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    justifyContent: "center",
  },
});

type FieldType = {
  label: string;
  value: string;
};

type Props = {
  requestDetails: FieldType[];
  requestorDetails: FieldType[];
  requestItems: {
    title: string;
    fields: FieldType[];
  }[];
};

const PdfDocument = ({
  requestDetails,
  requestorDetails,
  requestItems,
}: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.column}>
          {requestDetails.map((detail, index) => (
            <View key={index} style={styles.columnItem}>
              <Text>{detail.label}</Text>
              <Text style={{ fontWeight: 600 }}>{detail.value}</Text>
            </View>
          ))}
        </View>
        <View style={styles.column}>
          {requestorDetails.map((detail, index) => (
            <View
              key={index}
              style={{ ...styles.columnItem, alignItems: "flex-end" }}
            >
              <Text>{detail.label}</Text>
              <Text style={{ fontWeight: 600 }}>{detail.value}</Text>
            </View>
          ))}
        </View>
      </View>
      {requestItems.map((item, index) => (
        <View key={index} wrap={false}>
          <View style={styles.divider} />
          <Text style={{ fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
            {item.title}
          </Text>
          <View style={styles.column}>
            {item.fields.map((detail, i) => (
              <View key={i} style={styles.rowItem}>
                <Text>{detail.label}</Text>
                <Text style={{ fontWeight: 600 }}>{detail.value}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
      <Footer />
    </Page>
  </Document>
);

export default PdfDocument;

const Footer = () => (
  <View style={styles.footer} fixed>
    <Text
      render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
    />
    <View style={styles.logo}>
      <Text style={{ fontSize: 8 }}>Powered by</Text>
      <Image src="/logo-request-light.png" style={{ width: 45, height: 15 }} />
    </View>
  </View>
);
