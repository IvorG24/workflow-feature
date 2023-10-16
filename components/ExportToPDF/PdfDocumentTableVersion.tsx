import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { Fragment } from "react";

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
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 2,
    fontSize: 10,
  },
  tableHeader: {
    margin: 2,
    fontSize: 10,
    fontWeight: "bold",
  },
  "General Name": {
    width: "15%",
  },
  "Base Unit of Measurement": {
    width: "8%",
  },
  Quantity: {
    width: "10%",
  },
  "GL Account": {
    width: "10%",
  },
  "CSI Code Description": {
    width: "10%",
  },
  "CSI Code": {
    width: "7%",
  },
  Description: {
    width: "40%",
  },
});

type ColumnType =
  | "General Name"
  | "Base Unit of Measurement"
  | "Quantity"
  | "GL Account"
  | "CSI Code Description"
  | "CSI Code";

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
};

const PdfDocumentTableVersion = ({
  requestDetails,
  requestorDetails,
  requestIDs,
  requestItems,
}: Props) => {
  return (
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

        <Fragment>
          {
            <View wrap={false}>
              <View style={styles.divider} />
              <Text style={{ fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
                {requestItems[0].title}
              </Text>
              <View style={styles.column}>
                {requestItems[0].fields.map((detail, i) => (
                  <View key={i} style={styles.rowItem}>
                    <Text>{detail.label}</Text>
                    <Text style={{ fontWeight: 600 }}>{detail.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          }

          <View style={styles.divider} />
          <Text style={{ fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
            Item
          </Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, styles["General Name"]]}>
                <Text style={styles.tableHeader}>Item</Text>
              </View>
              <View
                style={[styles.tableCol, styles["Base Unit of Measurement"]]}
              >
                <Text style={styles.tableHeader}>Unit</Text>
              </View>
              <View style={[styles.tableCol, styles["Quantity"]]}>
                <Text style={styles.tableHeader}>Quantity</Text>
              </View>
              <View style={[styles.tableCol, styles["GL Account"]]}>
                <Text style={styles.tableHeader}>GL Account</Text>
              </View>
              <View style={[styles.tableCol, styles["CSI Code Description"]]}>
                <Text style={styles.tableHeader}>CSI Description</Text>
              </View>
              <View style={[styles.tableCol, styles["CSI Code"]]}>
                <Text style={styles.tableHeader}>CSI Code</Text>
              </View>
              <View style={[styles.tableCol, styles["Description"]]}>
                <Text style={styles.tableHeader}>Item Description</Text>
              </View>
            </View>
            {requestItems.slice(1).map((item, index) => {
              let description = "";
              item.fields.slice(9).forEach((field) => {
                if (field.value) {
                  description += `${field.label}: ${field.value}\n`;
                }
              });

              return (
                <View style={styles.tableRow} key={index}>
                  {item.fields.slice(0, 6).map((field, i) => (
                    <View
                      key={i}
                      style={[
                        styles.tableCol,
                        styles[field.label as ColumnType],
                      ]}
                    >
                      <Text style={styles.tableCell}>{field.value}</Text>
                    </View>
                  ))}
                  <View style={[styles.tableCol, styles.Description]}>
                    <Text style={styles.tableCell}>{description}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Fragment>
        <Footer />
      </Page>
    </Document>
  );
};

export default PdfDocumentTableVersion;

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
