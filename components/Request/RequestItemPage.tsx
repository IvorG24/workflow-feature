import ActiveTeamContext from "@/contexts/ActiveTeamContext";
import RequestContext from "@/contexts/RequestContext";
import RequestListContext from "@/contexts/RequestListContext";
import {
  deletePendingRequest,
  GetRequestWithAttachmentUrlList,
  getRequestWithAttachmentUrlList,
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
import { useContext, useEffect, useState } from "react";
import AttachmentPill from "../RequestsPage/AttachmentPill";
import PdfPreview from "./PdfPreview";
import RequestComment from "./RequestComment";
import { MARKS } from "./RequestItem";
import { ReducedRequestFieldType, ReducedRequestType } from "./RequestList";

const RequestItemPage = () => {
  const router = useRouter();
  const user = useUser();
  const { requestWithApproverList, request, setRequest } =
    useContext(RequestContext);
  const { setRequestList } = useContext(RequestListContext);
  const [requestToDisplay, setRequestToDisplay] =
    useState<ReducedRequestType | null>(null);

  const supabaseClient = useSupabaseClient();

  const [openPdfPreview, setOpenPdfPreview] = useState(false);
  const { teamMemberList } = useContext(ActiveTeamContext);
  const requestId = request[0].request_id;
  const userIdRoleDictionary = teamMemberList.reduce(
    (acc, member) => ({
      ...acc,
      [`${member.user_id}`]: member.member_role_id,
    }),
    {}
  ) as { [key: string]: TeamMemberRole };
  const approverList = requestWithApproverList[`${requestId}`];
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

  const currentUserIsOwner = requestToDisplay?.user_id === user?.id;
  const currentUserIsApprover = approver?.user_id === user?.id;
  const currentUserIsPurchaser = purchaser?.user_id === user?.id;

  const [attachmentUrlList, setAttachmentUrlList] =
    useState<GetRequestWithAttachmentUrlList>();
  const attachments = request[0].request_attachment_filepath_list?.map(
    (filepath, i) => {
      return {
        filepath,
        url: attachmentUrlList ? attachmentUrlList[i] : null,
      };
    }
  );

  useEffect(() => {
    (async () => {
      try {
        const urlList = await getRequestWithAttachmentUrlList(
          supabaseClient,
          requestId as number
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
  }, [requestId, supabaseClient]);

  const handleDownloadToPdf = () => {
    const html = document.getElementById(`${requestToDisplay?.request_id}`);
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
      callback: (doc) => doc.save(`request_${requestToDisplay?.request_title}`),
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
        requestId as number,
        newStatus,
        user?.id as string
      );

      setRequestToDisplay({
        ...(requestToDisplay as ReducedRequestType),
        form_fact_request_status_id: newStatus,
        request_status_id: newStatus,
      });

      if (setRequest) {
        setRequest(
          request?.map((request) => ({
            ...request,
            form_fact_request_status_id: newStatus,
            request_status_id: newStatus,
          }))
        );
      }

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
        message: `You ${newStatus} ${
          requestToDisplay && requestToDisplay?.request_title
        }`,
        color: "green",
      });
    } catch {
      showNotification({
        title: "Error!",
        message: `Failed to update status of ${
          requestToDisplay && requestToDisplay?.request_title
        }`,
        color: "red",
      });
    }
  };

  const handleDelete = async () => {
    try {
      if (!requestToDisplay) throw Error("No request found");

      await deletePendingRequest(supabaseClient, requestId as number);

      showNotification({
        title: "Success!",
        message: `You deleted ${
          requestToDisplay && requestToDisplay?.request_title
        }`,
        color: "green",
      });

      router.push(`/t/${router.query.tid}/requests?active_tab=all&page=1`);
    } catch {
      showNotification({
        title: "Error!",
        message: `Failed to delete ${
          requestToDisplay && requestToDisplay?.request_title
        }`,
        color: "red",
      });
    }
  };

  useEffect(() => {
    if (!request) {
      router.push(`/t/${router.query.tid}/requests?active_tab=all&page=1`);
    }

    const initialFields: { label: string; value: string; type: string }[] = [];
    const initialValue = [{ ...request[0], fields: initialFields }];

    const reducedRequest = request.reduce((acc, next) => {
      const match = acc.find((a) => a.request_id === next.request_id);
      const nextFields: ReducedRequestFieldType = {
        label: next.field_name as string,
        value: next.response_value as string,
        type: next.request_field_type as string,
      };
      if (match) {
        match.fields.push(nextFields as ReducedRequestFieldType);
      } else {
        acc.push({ ...next, fields: [nextFields] });
      }
      return acc;
    }, initialValue);
    setRequestToDisplay(reducedRequest[0] as ReducedRequestType);
  }, [request, router]);

  return (
    <Box p="xs">
      {/* PDF PREVIEW */}
      {requestToDisplay && (
        <Modal
          opened={openPdfPreview}
          onClose={() => setOpenPdfPreview(false)}
          title="Download Preview"
        >
          {(!approver?.user_signature_filepath ||
            !purchaser?.user_signature_filepath) && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Notice!"
              color="red"
              mb="sm"
            >
              This document does not contain signatures from both approver and
              purchaser.
            </Alert>
          )}
          <PdfPreview
            request={requestToDisplay}
            attachments={attachments}
            approver={approver}
            purchaser={purchaser}
          />
          <SimpleGrid cols={2} mt="xl">
            <Button variant="default" onClick={() => setOpenPdfPreview(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleDownloadToPdf()}>Download</Button>
          </SimpleGrid>
        </Modal>
      )}
      <Box>
        <Title
          order={4}
          onClick={() =>
            router.push(`/t/${router.query.tid}/requests/${requestId}`)
          }
        >
          {requestToDisplay?.request_title}
        </Title>
        <Badge
          size="sm"
          variant="light"
          color={setBadgeColor(requestToDisplay?.request_status_id as string)}
          w="100%"
          maw="80px"
        >
          {requestToDisplay?.request_status_id}
        </Badge>
      </Box>
      <Group my="sm" position="apart">
        <Group>
          <Avatar
            src={requestToDisplay?.user_avatar_filepath}
            color="green"
            radius="xl"
          />
          <Box>
            <Text fw={500}>{requestToDisplay?.username}</Text>
            <Text fz="xs" c="dimmed">
              {requestToDisplay?.request_date_created?.slice(0, 10)}
            </Text>
          </Box>
        </Group>
        <Group sx={{ cursor: "pointer" }}>
          <Text fz="xs" c="dimmed" onClick={() => setOpenPdfPreview(true)}>
            <IconDownload size={20} />
          </Text>
          <Text fz="xs" c="dimmed">
            <IconDotsVertical size={20} />
          </Text>
        </Group>
      </Group>
      <Text>{requestToDisplay?.request_description}</Text>

      {approver && (
        <Box my="sm">
          <Text fw={500}>Approver</Text>
          <Group spacing="xs">
            <Avatar
              src={approver?.user_avatar_filepath}
              color="green"
              radius="xl"
            />
            {approver.user_last_name ? (
              <Text>
                {approver?.user_first_name} {approver?.user_last_name}
              </Text>
            ) : (
              <Text>{approver?.user_email}</Text>
            )}
          </Group>
        </Box>
      )}
      {purchaser && (
        <>
          <Text fw={500}>Purchaser</Text>
          <Group spacing="xs">
            <Avatar
              src={purchaser?.user_avatar_filepath}
              color="green"
              radius="xl"
            />
            {purchaser.user_last_name ? (
              <Text>
                {purchaser?.user_first_name} {purchaser?.user_last_name}
              </Text>
            ) : (
              <Text>{purchaser?.user_email}</Text>
            )}
          </Group>
        </>
      )}
      <Divider my="sm" />
      {requestToDisplay?.request_attachment_filepath_list &&
      requestToDisplay?.request_attachment_filepath_list.length > 0 ? (
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

      {requestToDisplay && (
        <>
          <Divider my="sm" />
          <Text fw={500} c="dark.9">
            Request Form Details
          </Text>
          {requestToDisplay.fields.map((f, idx: number) => {
            let valueToDisplay = f.value;
            if (f.type === "section") {
              return (
                <Box key={idx}>
                  <Group spacing="xs">
                    <Text fw={500} c="dark.9">
                      Section:
                    </Text>
                    <Text c="dark.9">{f.label}</Text>
                  </Group>
                </Box>
              );
            }
            if (f.type === "date") {
              valueToDisplay = new Date(f.value).toLocaleDateString();
            }
            if (f.type === "daterange") {
              const localeDate = f.value
                .split(",")
                .map((date) => new Date(date).toLocaleDateString());
              valueToDisplay = localeDate.join(" - ");
            }
            if (f.type === "slider") {
              valueToDisplay = MARKS[Number(f.value) - 1].label;
            }

            return (
              <Box key={idx} p="xs">
                <Group>
                  <Text fw={500} c="dark.9">
                    Q:
                  </Text>
                  <Text c="dark.9">{f.label}</Text>
                </Group>
                <Group>
                  <Text fw={500} c="dark.9">
                    A:
                  </Text>
                  {/* <Text c="dark.9">{f.value ? f.value : "N/A"}</Text> */}
                  <Text c="dark.9">
                    {valueToDisplay ? valueToDisplay : "N/A"}
                  </Text>
                </Group>
              </Box>
            );
          })}
        </>
      )}

      {currentUserIsApprover &&
        requestToDisplay?.request_status_id === "pending" && (
          <>
            <Divider my="sm" />
            <SimpleGrid cols={2} my="xl">
              <Button
                variant="light"
                color="red"
                onClick={() =>
                  confirmationModal(
                    "reject",
                    `${requestToDisplay && requestToDisplay?.request_title}`,
                    () => handleUpdateStatus("rejected")
                  )
                }
              >
                Reject
              </Button>
              <Button
                onClick={() =>
                  confirmationModal(
                    "approve",
                    `${requestToDisplay && requestToDisplay?.request_title}`,
                    () => handleUpdateStatus("approved")
                  )
                }
              >
                Approve
              </Button>
            </SimpleGrid>
          </>
        )}
      {currentUserIsPurchaser &&
      requestToDisplay?.request_status_id === "approved" ? (
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
                  `${request && requestToDisplay?.request_title}`,
                  () => handleUpdateStatus("purchased")
                )
              }
            >
              Mark as Purchased
            </Button>
          </Group>
        </>
      ) : null}
      {currentUserIsOwner &&
      requestToDisplay?.request_status_id === "pending" ? (
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
                  `${requestToDisplay && requestToDisplay?.request_title}`,
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
      <Divider my="sm" variant="dotted" />
      <RequestComment requestId={requestId as number} />
    </Box>
  );
};

export default RequestItemPage;
