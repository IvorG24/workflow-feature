import ActiveTeamContext from "@/contexts/ActiveTeamContext";
import RequestListContext from "@/contexts/RequestListContext";
import {
  deletePendingRequest,
  GetRequestWithAttachmentUrlList,
  getRequestWithAttachmentUrlList,
  GetTeam,
  GetTeamRequestList,
  updateRequestStatus,
} from "@/utils/queries-new";
import { setBadgeColor } from "@/utils/request";
import { RequestStatus, TeamMemberRole } from "@/utils/types-new";
import {
  Alert,
  Avatar,
  Badge,
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
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { IconAlertCircle, IconDotsVertical, IconDownload } from "@tabler/icons";
import jsPDF from "jspdf";
import { useRouter } from "next/router";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import AttachmentPill from "../RequestsPage/AttachmentPill";
import PdfPreview from "./PdfPreview";
import RequestComment from "./RequestComment";
import { ReducedRequestType } from "./RequestList";

type Props = {
  request: ReducedRequestType;
  setSelectedRequest: Dispatch<SetStateAction<GetTeamRequestList[0] | null>>;
};

const RequestItem = ({ request, setSelectedRequest }: Props) => {
  const user = useUser();
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const { requestWithApproverList, setRequestList } =
    useContext(RequestListContext);
  const [openPdfPreview, setOpenPdfPreview] = useState(false);
  const { teamMemberList } = useContext(ActiveTeamContext);
  const requestId = request.request_id as number;
  const userIdRoleDictionary = teamMemberList.reduce(
    (acc, member) => ({
      ...acc,
      [`${member.user_id}`]: member.member_role_id,
    }),
    {}
  ) as { [key: string]: TeamMemberRole };
  const approverList = requestWithApproverList[`${request.request_id}`];
  const approverIdWithStatus = approverList.find((approver) => {
    const isApprover =
      userIdRoleDictionary[approver.approver_id] === "owner" ||
      userIdRoleDictionary[approver.approver_id] === "admin";
    return isApprover;
  });
  const purchaserIdWithStatus = approverList.find((approver) => {
    const isPurchaser =
      userIdRoleDictionary[approver.approver_id] === "purchaser";
    return isPurchaser;
  });
  const approver = teamMemberList.find(
    (member) => member.user_id === approverIdWithStatus?.approver_id
  );
  const purchaser = teamMemberList.find(
    (member) => member.user_id === purchaserIdWithStatus?.approver_id
  );
  const currentUserIsOwner = request.user_id === user?.id;
  const currentUserIsApprover = approver?.user_id === user?.id;
  const currentUserIsPurchaser = purchaser?.user_id === user?.id;
  const [attachmentUrlList, setAttachmentUrlList] =
    useState<GetRequestWithAttachmentUrlList>();
  const attachments = request.request_attachment_filepath_list?.map(
    (filepath, i) => {
      return {
        filepath,
        url: attachmentUrlList ? attachmentUrlList[i] : null,
      };
    }
  );
  console.log(requestWithApproverList[`${request.request_id}`]);
  useEffect(() => {
    (async () => {
      try {
        const urlList = await getRequestWithAttachmentUrlList(
          supabaseClient,
          request.request_id as number
        );
        setAttachmentUrlList(urlList);
      } catch (e) {
        console.log(e);
        showNotification({
          title: "Error!",
          message: "Failed to fetch request information.",
          color: "red",
        });
      }
    })();
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
      y: 10,
    });
    setOpenPdfPreview(false);
    return;
  };

  const confirmationModal = (
    action: string,
    requestTitle: string,
    confirmFunction: () => Promise<void>
  ) =>
    openConfirmModal({
      title: "Please confirm your action",
      children: (
        <Text size="sm">
          Are you sure you want to {action} the {requestTitle}?
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: () => confirmFunction(),
    });

  const handleUpdateStatus = async (newStatus: RequestStatus) => {
    try {
      await updateRequestStatus(
        supabaseClient,
        requestId,
        newStatus,
        user?.id as string
      );

      setSelectedRequest({
        ...request,
        form_fact_request_status_id: newStatus,
        request_status_id: newStatus,
      });

      if (setRequestList) {
        setRequestList((prev) =>
          prev.map((prevItem) => {
            if (prevItem.request_id === requestId) {
              return {
                ...prevItem,
                form_fact_request_status_id: newStatus,
                request_status_id: newStatus,
              };
            } else {
              return prevItem;
            }
          })
        );
      }
      showNotification({
        title: "Success!",
        message: `You ${newStatus} ${request && request.request_title}`,
        color: "green",
      });
    } catch {
      showNotification({
        title: "Error!",
        message: `Failed to update status of ${
          request && request.request_title
        }`,
        color: "red",
      });
    }
  };

  const handleDelete = async () => {
    try {
      if (!request) throw Error("No request found");

      await deletePendingRequest(supabaseClient, requestId as number);

      showNotification({
        title: "Success!",
        message: `You deleted ${request && request.request_title}`,
        color: "green",
      });

      if (setRequestList) {
        setRequestList((prev) => {
          return prev.filter((request) => request.request_id !== requestId);
        });
      }
      setSelectedRequest(null);
    } catch {
      showNotification({
        title: "Error!",
        message: `Failed to delete ${request && request.request_title}`,
        color: "red",
      });
    }
  };

  return (
    <Box p="xs">
      {/* PDF PREVIEW */}
      {request && (
        <Modal
          opened={openPdfPreview}
          onClose={() => setOpenPdfPreview(false)}
          title="Download Preview"
        >
          {!approver?.user_signature_filepath &&
            !purchaser?.user_signature_filepath && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Notice!"
                color="red"
                mb="sm"
              >
                This document does not contain any signatures.
              </Alert>
            )}
          <PdfPreview
            request={request}
            attachments={attachments}
            approver={approver ? (approver as GetTeam[0]) : undefined}
            purchaser={approver ? (approver as GetTeam[0]) : undefined}
          />
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
        <Box
          sx={{ cursor: "pointer" }}
          onClick={() =>
            router.push(`/t/${router.query.tid}/requests/${requestId}`)
          }
        >
          <Group spacing="xs">
            <Title order={4}>{request.request_title}</Title>
            <Text td="underline" fz="xs" c="indigo">
              (View Full Page)
            </Text>
          </Group>
          <Badge
            size="sm"
            variant="filled"
            color={setBadgeColor(request.request_status_id as string)}
            w="100%"
            maw="80px"
          >
            {request.request_status_id}
          </Badge>
        </Box>
        <CloseButton
          aria-label="close-request"
          onClick={() => setSelectedRequest(null)}
        />
      </Group>
      <Group my="sm" position="apart">
        <Group>
          <Avatar src={request.user_avatar_filepath} color="blue" radius="xl" />
          <Box>
            <Text fw={500}>{request.username}</Text>
            <Text fz="xs" c="dimmed">
              {request.request_date_created?.slice(0, 10)}
            </Text>
          </Box>
        </Group>

        <Group sx={{ cursor: "pointer" }}>
          <Text
            fz="xs"
            c="dimmed"
            onClick={() => {
              if (request.request_status_id !== "approved") {
                showNotification({
                  title: "Oops!",
                  message: "Only approved requests can be downloaded as PDF.",
                  color: "orange",
                  autoClose: false,
                });
              } else {
                setOpenPdfPreview(true);
              }
            }}
          >
            <IconDownload />
          </Text>
          <Text fz="xs" c="dimmed">
            <IconDotsVertical />
          </Text>
        </Group>
      </Group>

      <Text pl={5}>{request.request_description}</Text>

      <Divider my="sm" variant="dotted" />
      <>
        <Text fw={500}>Approver</Text>
        <Group mb="xs" spacing="xs">
          <Avatar
            src={approver?.user_avatar_filepath}
            color="blue"
            radius="xl"
          />
          <Text>
            {approver?.user_first_name} {approver?.user_last_name}
          </Text>
        </Group>
      </>
      <>
        <Text fw={500}>Purchaser</Text>
        <Group mb="xs" spacing="xs">
          <Avatar
            src={purchaser?.user_avatar_filepath}
            color="blue"
            radius="xl"
          />
          <Text>
            {purchaser?.user_first_name} {purchaser?.user_last_name}
          </Text>
        </Group>
      </>
      <Divider my="sm" variant="dotted" />
      {request.request_attachment_filepath_list &&
      request.request_attachment_filepath_list.length > 0 ? (
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

      {currentUserIsApprover && request.request_status_id === "pending" && (
        <>
          <Divider my="sm" variant="dotted" />
          <SimpleGrid cols={2} my="xl">
            <Button
              variant="light"
              color="red"
              onClick={() =>
                confirmationModal(
                  "reject",
                  `${request && request.request_title}`,
                  () => handleUpdateStatus("rejected")
                )
              }
            >
              Reject
            </Button>
            <Button
              color="indigo"
              onClick={() =>
                confirmationModal(
                  "approve",
                  `${request && request.request_title}`,
                  () => handleUpdateStatus("approved")
                )
              }
            >
              Approve
            </Button>
          </SimpleGrid>
        </>
      )}
      {currentUserIsOwner && request.request_status_id === "pending" ? (
        <>
          <Divider my="sm" variant="dotted" />
          <Group>
            <Button
              color="dark"
              my="sm"
              fullWidth
              onClick={() =>
                confirmationModal(
                  "delete",
                  `${request && request.request_title}`,
                  handleDelete
                )
              }
              data-cy="request-delete"
            >
              Delete
            </Button>
          </Group>
        </>
      ) : null}
      {currentUserIsPurchaser && request.request_status_id === "approved" ? (
        <>
          <Divider mt="xl" />
          <Group>
            <Button
              color="dark"
              my="sm"
              fullWidth
              onClick={() =>
                confirmationModal(
                  "mark as purchased",
                  `${request && request.request_title}`,
                  () => handleUpdateStatus("purchased")
                )
              }
            >
              Mark as Purchased
            </Button>
          </Group>
        </>
      ) : null}
      <Divider my="sm" variant="dotted" />
      <RequestComment requestId={requestId} />
    </Box>
  );
};

export default RequestItem;
