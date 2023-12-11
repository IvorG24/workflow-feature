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
    borderColor: "#DEE2E6",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#DEE2E6",
  },
  tableCell: {
    margin: 5,
    fontSize: 8,
  },
  tableHeader: {
    margin: 5,
    fontSize: 8,
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
  badge: {
    padding: "0px 4px",
    borderRadius: "8px",
    fontSize: "7px",
    fontWeight: "bold",
    border: "solid 1px green",
    margin: 5,
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
    width: "100%",
    padding: 10,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  Signature: {
    width: "20%",
  },
  "Full Name": {
    width: "20%",
  },
  Position: {
    width: "20%",
  },
  "Approval Status": {
    width: "20%",
  },
  "Date Approved": {
    width: "20%",
  },
  icon: {
    width: "12px",
    height: "12px",
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
  additional?: string;
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
    jobDescription: string | null;
    signature: string | null;
  }[];
};

const PdfDocumentTableVersion = ({
  requestDetails,
  requestorDetails,
  requestIDs,
  requestItems,
  approverDetails,
}: Props) => {
  const formatStatus = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <View style={[styles.badge, styles.approved]}>
            <View style={styles.flex}>
              <Text>APPROVED</Text>
              <Image src="/check.png" style={styles.icon} />
            </View>
          </View>
        );
      case "REJECTED":
        return (
          <View style={[styles.badge, styles.rejected]}>
            <View style={styles.flex}>
              <Text>REJECTED</Text>
              <Image src="/cross.png" style={styles.icon} />
            </View>
          </View>
        );
      case "PENDING":
        return (
          <View style={[styles.badge, styles.pending]}>
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
                {detail.additional && (
                  <Text style={{ color: "#868E96" }}>
                    ({detail.additional})
                  </Text>
                )}
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
            <View style={[styles.tableRow, { backgroundColor: "#A5D8FF" }]}>
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

        <Fragment>
          <View style={styles.divider} />
          <Text style={{ fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
            Approvers
          </Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, { backgroundColor: "#A5D8FF" }]}>
              <View style={[styles.tableCol, styles["Signature"]]}>
                <Text style={styles.tableHeader}>Signature</Text>
              </View>
              <View style={[styles.tableCol, styles["Full Name"]]}>
                <Text style={styles.tableHeader}>Full Name</Text>
              </View>
              <View style={[styles.tableCol, styles["Position"]]}>
                <Text style={styles.tableHeader}>Position</Text>
              </View>
              <View style={[styles.tableCol, styles["Approval Status"]]}>
                <Text style={styles.tableHeader}>Approval Status</Text>
              </View>
              <View style={[styles.tableCol, styles["Date Approved"]]}>
                <Text style={styles.tableHeader}>Date Approved</Text>
              </View>
            </View>
            {approverDetails.map((approver, index) => {
              return (
                <View style={styles.tableRow} key={index}>
                  <View style={[styles.tableCol, styles["Signature"]]}>
                    {approver.signature && (
                      <Image
                        src={approver.signature}
                        style={{ height: "50px", width: "75px" }}
                      />
                    )}
                  </View>
                  <View style={[styles.tableCol, styles["Full Name"]]}>
                    <Text style={styles.tableCell}>{approver.name}</Text>
                  </View>
                  <View style={[styles.tableCol, styles["Position"]]}>
                    <Text style={styles.tableCell}>
                      {approver.jobDescription}
                    </Text>
                  </View>
                  <View style={[styles.tableCol, styles["Approval Status"]]}>
                    {formatStatus(approver.status)}
                  </View>
                  <View style={[styles.tableCol, styles["Date Approved"]]}>
                    <Text style={styles.tableCell}>
                      {approver.date
                        ? new Date(approver.date).toLocaleDateString()
                        : ""}
                    </Text>
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
