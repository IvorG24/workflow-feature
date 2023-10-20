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
  badge: {
    padding: "0px 8px",
    borderRadius: "16px",
    fontSize: "8px",
    fontWeight: "bold",
    border: "solid 1px green",
  },
  flex: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    padding: 3,
    flexDirection: "row",
  },
  approved: {
    backgroundColor: "#EBFBEE",
    color: "#40C094",
  },
  rejected: {
    backgroundColor: "#FFF5F5",
    color: "#FA5252",
  },
  pending: {
    backgroundColor: "#E7F5FF",
    color: "#228BE6",
  },
  approverContainer: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
  },
  approverColumn: {
    width: "33%",
    padding: "0px 10px",
    textAlign: "center",
  },
  icon: {
    width: "12px",
    height: "12px",
  },
});

type FieldType = {
  label: string;
  value: string;
};

type Props = {
  requestDetails: FieldType[];
  requestorDetails: FieldType[];
  requestIDs: FieldType[];
  requestItems: {
    title: string;
    fields: FieldType[];
  }[];
  approverDetails: {
    name: string;
    status: string;
    date: string | null;
  }[];
};

const formatStatus = (status: string) => {
  switch (status) {
    case "APPROVED":
      return (
        <View style={[styles.badge, styles.approved, styles.approverColumn]}>
          <View style={styles.flex}>
            <Text>APPROVED</Text>
            <Image src="/check.png" style={styles.icon} />
          </View>
        </View>
      );
    case "REJECTED":
      return (
        <View style={[styles.badge, styles.rejected, styles.approverColumn]}>
          <View style={styles.flex}>
            <Text>REJECTED</Text>
            <Image src="/cross.png" style={styles.icon} />
          </View>
        </View>
      );
    case "PENDING":
      return (
        <View style={[styles.badge, styles.pending, styles.approverColumn]}>
          <View style={styles.flex}>
            <Text>PENDING</Text>
            <Image src="/dot.png" style={styles.icon} />
          </View>
        </View>
      );
    default:
      return <Text style={{ fontWeight: 600 }}></Text>;
  }
};

const PdfDocument = ({
  requestDetails,
  requestorDetails,
  requestIDs,
  requestItems,
  approverDetails,
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
      <View style={[styles.header, { marginTop: "12px" }]}>
        <View style={styles.column}>
          {requestIDs.map((detail, index) => (
            <View
              key={index}
              style={{ ...styles.columnItem, alignItems: "flex-start" }}
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

      <View wrap={false}>
        <View style={styles.divider} />
        <Text style={{ fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
          Approvers
        </Text>
        <View style={styles.column}>
          {approverDetails.map((approver, i) => (
            <View key={i} style={styles.approverContainer}>
              <Text style={[styles.approverColumn, { textAlign: "left" }]}>
                {approver.name}
              </Text>

              {formatStatus(approver.status)}

              <Text style={[styles.approverColumn, { textAlign: "right" }]}>
                {approver.date
                  ? new Date(approver.date).toLocaleDateString()
                  : ""}
              </Text>
            </View>
          ))}
        </View>
      </View>
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
