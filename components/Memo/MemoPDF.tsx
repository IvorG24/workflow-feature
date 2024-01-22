import { MemoFormatType, MemoType } from "@/utils/types";
import {
  Document,
  Image,
  Line,
  Page,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import { marked } from "marked";
import moment from "moment";
import Html from "react-pdf-html";

const styles = StyleSheet.create({
  memoHeader: {
    marginLeft: "12px",
  },
  memoHeaderInput: {
    display: "flex",
    flexDirection: "row",
    gap: "16px",
  },
  divider: {
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    marginTop: "8px",
  },
  memoBody: {
    marginTop: "8px",
    marginLeft: "12px",
    marginRight: "12px",
    fontSize: "10pt",
  },
  memoLineItem: {
    lineHeight: 1,
    marginBottom: "8px",
  },
  memoSigner: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: "24px",
    marginLeft: "12px",
    marginRight: "12px",
    marginTop: "48px",
  },
  logo: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  noSignature: {
    border: "1px solid gray",
    backgroundColor: "#f8f9fa",
    marginBottom: "4px",
    height: "50px",
    width: "75px",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
  },
});

type Props = {
  memo: MemoType;
  currentSignedSignerList: MemoType["memo_signer_list"];
  sortMemoLineItems: MemoType["memo_line_item_list"];
  memoFormat: MemoFormatType;
};

const MemoPDF = ({
  memo,
  sortMemoLineItems,
  currentSignedSignerList,
  memoFormat,
}: Props) => {
  const lineItemStyleSheet = {
    "*": {
      fontSize: "10pt",
      margin: "4px 0px 8px 0px",
    },
  };
  const memoAuthorFullname = `${memo.memo_author_user.user_first_name} ${memo.memo_author_user.user_last_name}`;

  const renderLineItems = sortMemoLineItems.map((lineItem, lineItemIndex) => {
    const lineItemContentHtml = marked(lineItem.memo_line_item_content);

    return (
      <View key={lineItem.memo_line_item_id} style={styles.memoLineItem}>
        <Html stylesheet={lineItemStyleSheet}>
          {lineItemContentHtml as string}
        </Html>
        <View>
          {lineItem.memo_line_item_attachment
            ?.memo_line_item_attachment_name && (
            <View>
              <Text style={{ fontWeight: 600, marginBottom: 4 }}>
                Figure {lineItemIndex + 1}
              </Text>
              <Image
                src={
                  lineItem.memo_line_item_attachment
                    .memo_line_item_attachment_public_url
                }
                style={{
                  height: "200px",
                  width: "100%",
                  objectFit: "contain",
                }}
              />
              {lineItem.memo_line_item_attachment
                .memo_line_item_attachment_caption && (
                <Text>
                  {`Caption ${lineItemIndex + 1}: ${
                    lineItem.memo_line_item_attachment
                      .memo_line_item_attachment_caption
                  }`}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    );
  });

  const renderSignerList = currentSignedSignerList.map((signer) => {
    const signerFullname = `${signer.memo_signer_team_member.user.user_first_name} ${signer.memo_signer_team_member.user.user_last_name}`;
    return (
      <View key={signer.memo_signer_id}>
        {signer.memo_signer_signature_public_url ? (
          <Image
            src={signer.memo_signer_signature_public_url}
            style={{ height: "50px", width: "75px", objectFit: "contain" }}
          />
        ) : (
          <View style={styles.noSignature}>
            <Text>{"NO\nSIGNATURE"}</Text>
          </View>
        )}
        <Text style={{ fontWeight: 600, marginBottom: "2px" }}>
          {signerFullname}
        </Text>
        <Text>{signer.memo_signer_team_member.user.user_job_title}</Text>
      </View>
    );
  });

  const dynamicStyles = StyleSheet.create({
    header: {
      display: "flex",
      alignItems: getFlexJustify(memoFormat.header.logoPosition),
      margin: `${memoFormat.header.top}px ${memoFormat.header.right}px ${memoFormat.header.bottom}px ${memoFormat.header.left}px`,
      flex: "0 1 auto",
    },
    body: {
      margin: `${memoFormat.body.top}px ${memoFormat.body.right}px ${memoFormat.body.bottom}px ${memoFormat.body.left}px`,
      flex: "1 1 auto",
    },
    footer: {
      margin: `${memoFormat.footer.top}px ${memoFormat.footer.right}px ${memoFormat.footer.bottom}px ${memoFormat.footer.left}px`,
      color: "#495057",
      flexDirection: "row",
      justifyContent: "space-between",
      flex: "0 1 auto",
    },
  });

  return (
    <Document>
      <Page
        size="A4"
        style={{
          fontFamily: "Open Sans",
          fontSize: "10pt",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <View style={dynamicStyles.header} fixed>
          <Image
            src="/logo-scic.png"
            style={{ width: 90, height: 30, objectFit: "contain" }}
          />
        </View>
        <View style={dynamicStyles.body}>
          <View style={styles.memoHeader}>
            <Text
              style={{
                fontWeight: 600,
                fontSize: "12px",
                marginBottom: "12px",
              }}
            >
              MEMORANDUM
            </Text>
            <View style={styles.memoHeaderInput}>
              <Text style={{ fontWeight: 600, width: "54px" }}>Ref. No.</Text>
              <Text>:</Text>
              <Text>{memo.memo_reference_number}</Text>
            </View>
            <View style={styles.memoHeaderInput}>
              <Text style={{ fontWeight: 600, width: "54px" }}>Date</Text>
              <Text>:</Text>
              <Text>{moment(memo.memo_date_created).format("YYYY-MM-DD")}</Text>
            </View>
            <View style={styles.memoHeaderInput}>
              <Text style={{ fontWeight: 600, width: "54px" }}>From</Text>
              <Text>:</Text>
              <Text>
                {memoAuthorFullname} - {memo.memo_author_user.user_job_title}
              </Text>
            </View>
            <View style={styles.memoHeaderInput}>
              <Text style={{ fontWeight: 600, width: "54px" }}>Subject</Text>
              <Text>:</Text>
              <Text style={{ fontWeight: 600 }}>{memo.memo_subject}</Text>
            </View>
          </View>
          <View style={styles.divider}>
            <Svg height="2" width="100%">
              <Line
                x1="0"
                y1="0"
                x2="1000"
                y2="0"
                strokeWidth={2}
                stroke="rgb(0,0,0)"
              />
            </Svg>
            <Svg height="4" width="100%">
              <Line
                x1="0"
                y1="0"
                x2="1000"
                y2="0"
                strokeWidth={5}
                stroke="rgb(0,0,0)"
              />
            </Svg>
          </View>
          <View style={styles.memoBody}>{renderLineItems}</View>
          <View style={styles.memoSigner}>{renderSignerList}</View>
        </View>
        <View style={dynamicStyles.footer} fixed>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
          <View style={styles.logo}>
            <Text style={{ fontSize: 8 }}>Powered by</Text>
            <Image
              src="/logo-request-light.png"
              style={{ width: 45, height: 15 }}
            />
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default MemoPDF;

const getFlexJustify = (memoFormatLogoPosition: string) => {
  switch (memoFormatLogoPosition.toLowerCase()) {
    case "left":
      return "flex-start";

    case "center":
      return "center";

    case "right":
      return "flex-end";

    default:
      return "flex-start";
  }
};
