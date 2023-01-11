import {
  getRequestWithAttachmentUrlList,
  GetRequestWithAttachmentUrlList,
  GetTeamRequestList,
} from "@/utils/queries-new";
import {
  Avatar,
  Box,
  Button,
  CloseButton,
  Divider,
  Group,
  Modal,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconDotsVertical, IconDownload } from "@tabler/icons";
import jsPDF from "jspdf";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import AttachmentPill from "../RequestsPage/AttachmentPill";
import PdfPreview from "./PdfPreview";
import RequestComment from "./RequestComment";

type Props = {
  request: GetTeamRequestList[0];
  setSelectedRequest: Dispatch<SetStateAction<GetTeamRequestList[0] | null>>;
};

const RequestItem = ({ request, setSelectedRequest }: Props) => {
  const requestRef = useRef<HTMLDivElement>(null);
  const [openPdfPreview, setOpenPdfPreview] = useState(false);
  const [attachmentUrlList, setAttachmentUrlList] =
    useState<GetRequestWithAttachmentUrlList>();
  const supabaseClient = useSupabaseClient();

  const attachments = request.request_attachment_filepath_list?.map(
    (filepath, i) => {
      return {
        filepath,
        url: attachmentUrlList ? attachmentUrlList[i] : null,
      };
    }
  );

  useEffect(() => {
    async () => {
      try {
        const data = await getRequestWithAttachmentUrlList(
          supabaseClient,
          request.request_id as number
        );
        setAttachmentUrlList(data);
      } catch (error) {
        console.log(error);
        showNotification({
          title: "Error!",
          message: "Failed to fetch request information",
          color: "red",
        });
      }
    };
  }, [request, supabaseClient]);

  const handleDownloadToPdf = () => {
    const html = document.getElementById(`${request.request_id}`);
    const pdfHeight =
      Number(`${html?.clientHeight}`) > 842
        ? Number(`${html?.clientHeight}`) + 2
        : 842;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [pdfHeight, 592],
    });

    doc.html(html as HTMLElement, {
      callback: (doc) => doc.save(`request_${request.request_title}`),
      x: doc.internal.pageSize.width / 6,
      y: 50,
    });
    setOpenPdfPreview(false);
    return;
  };

  return (
    <Box p="xs" ref={requestRef}>
      {/* PDF PREVIEW */}
      {request && (
        <Modal
          opened={openPdfPreview}
          onClose={() => setOpenPdfPreview(false)}
          title="Download Preview"
        >
          <PdfPreview request={request} attachments={attachments} />
          <SimpleGrid cols={2} mt="xl">
            <Button variant="default" onClick={() => setOpenPdfPreview(false)}>
              Cancel
            </Button>
            <Button color="indigo" onClick={() => handleDownloadToPdf()}>
              Download
            </Button>
          </SimpleGrid>
        </Modal>
      )}
      <Group position="apart">
        <Title order={4}>{request.request_title}</Title>
        <CloseButton
          aria-label="close-request"
          onClick={() => setSelectedRequest(null)}
        />
      </Group>
      <Group my="sm" position="apart">
        <Group>
          <Avatar color="blue" radius="xl" />
          <Box>
            <Text fw={500}>{request.username}</Text>
            <Text fz="xs" c="dimmed">
              {request.request_date_created?.slice(0, 10)}
            </Text>
          </Box>
        </Group>
        <Group sx={{ cursor: "pointer" }}>
          <Text fz="xs" c="dimmed" onClick={() => setOpenPdfPreview(true)}>
            <IconDownload />
          </Text>
          <Text fz="xs" c="dimmed">
            <IconDotsVertical />
          </Text>
        </Group>
      </Group>
      <Text>{request.request_description}</Text>
      <Divider my="sm" variant="dotted" />
      {request.request_attachment_filepath_list ? (
        <>
          <Text fw={500}>Attachments</Text>
          <Group mt="xs">
            {attachments?.map((attachment, idx) => {
              const filePath = attachment.filepath;
              const fileType = attachment.filepath.split(".").pop() as string;
              const fileUrl = attachment.url as string;

              return (
                <AttachmentPill
                  key={idx}
                  filename={filePath}
                  fileType={fileType}
                  fileUrl={fileUrl}
                />
              );
            })}
          </Group>
        </>
      ) : (
        <Text c="dimmed">No attachments</Text>
      )}
      <Divider my="sm" variant="dotted" />
      <SimpleGrid cols={2} my="xl">
        <Button variant="default">Delete</Button>
        <Button color="indigo">Approve</Button>
      </SimpleGrid>
      <Divider my="sm" />
      <RequestComment />
    </Box>
  );
};

export default RequestItem;
