import { MemoType } from "@/utils/types";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import moment from "moment";

const styles = StyleSheet.create({
  paper: {
    marginTop: 20,
    padding: 20,
    borderRadius: 10,
    fontFamily: "Open Sans",
  },
  heading: {
    marginBottom: 20,
    fontWeight: "bold",
  },
  details: {
    marginBottom: 10,
  },
  divider: {
    marginTop: 5,
    borderTop: "1px solid #000",
  },
  lineItem: {
    marginBottom: 5,
  },
  badge: {
    fontWeight: "bold",
    padding: 5,
  },
  signerContainer: {
    marginTop: 20,
    flexDirection: "row",
  },
  signerItem: {
    marginRight: 48,
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

type Props = {
  memo: MemoType;
  currentSignedSignerList: MemoType["memo_signer_list"];
  sortMemoLineItems: MemoType["memo_line_item_list"];
};

const MemoPDF = ({
  memo,
  currentSignedSignerList,
  sortMemoLineItems,
}: Props) => {
  const { user_first_name, user_last_name } = memo.memo_author_user;
  return (
    <Document>
      <Page size="A4" style={{ fontSize: 14 }}>
        <View style={styles.paper}>
          <Text style={styles.heading}>MEMORANDUM</Text>
          <View style={styles.details}>
            <Text>{`Reference No.: ${memo.memo_reference_number}`}</Text>
            <Text>{`Date: ${moment(memo.memo_date_created).format(
              "MMMM DD, YYYY"
            )}`}</Text>
            <Text>{`Author: ${user_first_name} ${user_last_name}`}</Text>
            <Text>{`Subject: ${memo.memo_subject}`}</Text>
            <View style={styles.divider} />
          </View>
          {sortMemoLineItems.map((lineItem) => (
            <View key={lineItem.memo_line_item_id} style={styles.lineItem}>
              <Text>{lineItem.memo_line_item_content}</Text>
            </View>
          ))}

          {currentSignedSignerList.length > 0 && (
            <View style={styles.signerContainer}>
              {currentSignedSignerList.map(
                (signer) =>
                  signer.memo_signer_status === "APPROVED" && (
                    <View key={signer.memo_signer_id} style={styles.signerItem}>
                      <Image
                        src={signer.signature_public_url}
                        style={{ height: "50px", width: "75px" }}
                      />
                      <Text
                        style={{ fontWeight: 600 }}
                      >{`${signer.memo_signer_team_member.user.user_first_name} ${signer.memo_signer_team_member.user.user_last_name}`}</Text>
                      <Text>
                        {signer.memo_signer_team_member.user.user_job_title}
                      </Text>
                    </View>
                  )
              )}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default MemoPDF;
