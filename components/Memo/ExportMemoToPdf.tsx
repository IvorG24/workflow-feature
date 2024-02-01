import { MemoType } from "@/utils/types";
import { Box, Button } from "@mantine/core";

import { Font, usePDF } from "@react-pdf/renderer/lib/react-pdf.browser.cjs";
import moment from "moment";
import { MemoFormatFormValues } from "../MemoFormatEditor/MemoFormatEditor";
import MemoPDF from "./MemoPDF";

type Props = {
  memo: MemoType;
  currentSignedSignerList: MemoType["memo_signer_list"];
  sortMemoLineItems: MemoType["memo_line_item_list"];
  memoFormat: MemoFormatFormValues["formatSection"];
};

Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf",
      fontWeight: 600,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-italic.ttf",
      fontStyle: "italic",
    },
  ],
});

const ExportMemoToPdf = ({
  memo,
  currentSignedSignerList,
  sortMemoLineItems,
  memoFormat,
}: Props) => {
  const authorFullname =
    memo.memo_author_user.user_first_name +
    " " +
    memo.memo_author_user.user_last_name;
  const referenceNumber = memo.memo_reference_number;
  const pdfFileName = `${moment(memo.memo_date_created).format(
    "YYYY-MM-DD"
  )}-${referenceNumber}-${authorFullname}`;

  const [instance] = usePDF({
    document: (
      <MemoPDF
        memo={memo}
        sortMemoLineItems={sortMemoLineItems}
        currentSignedSignerList={currentSignedSignerList}
        memoFormat={memoFormat}
      />
    ),
  });

  return (
    <Box>
      {!instance.loading && (
        <Button
          variant="light"
          component="a"
          href={instance.url ? instance.url : "#"}
          download={pdfFileName}
        >
          Export to PDF
        </Button>
      )}
    </Box>
  );
};

export default ExportMemoToPdf;
