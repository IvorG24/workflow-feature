import { DuplicateSectionType } from "@/utils/arrayFunctions";
import { RequestWithResponseType } from "@/utils/types";
import { Box, Button, Modal, Text } from "@mantine/core";
import { useState } from "react";
import PdfPreview from "./PdfPreview";

type Props = {
  request: RequestWithResponseType;
  sectionWithDuplicateList: DuplicateSectionType[];
};
const ExportToPDfModal = ({ request, sectionWithDuplicateList }: Props) => {
  const [openPDFPreview, setOpenPDFPreview] = useState(false);

  return (
    <Box>
      <Button onClick={() => setOpenPDFPreview(true)}>Export to PDF</Button>
      <Modal
        opened={openPDFPreview}
        onClose={() => setOpenPDFPreview(false)}
        title={<Text weight={600}>Download Preview</Text>}
        size="55rem"
        styles={{
          header: {
            borderBottom: "1px solid #868E96",
          },
        }}
      >
        <PdfPreview
          request={request}
          sectionWithDuplicateList={sectionWithDuplicateList}
        />
      </Modal>
    </Box>
  );
};

export default ExportToPDfModal;
