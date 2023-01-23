import ActiveTeamContext from "@/contexts/ActiveTeamContext";
import RequestListContext from "@/contexts/RequestListContext";
import useFetchRequest from "@/hooks/useFetchRequest";
import {
  deletePendingRequest,
  GetRequestWithAttachmentUrlList,
  getRequestWithAttachmentUrlList,
  updateRequestStatus,
} from "@/utils/queries-new";
import { setBadgeColor } from "@/utils/request";
import { Marks } from "@/utils/types";
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
import { ReducedRequestFieldType, ReducedRequestType } from "./RequestList";
import RequestSkeleton from "./RequestSkeleton";

export const MARKS: Marks[] = [
  {
    value: 1,
    label: "0%",
  },
  {
    value: 2,
    label: "25%",
  },
  {
    value: 3,
    label: "50%",
  },
  {
    value: 4,
    label: "75%",
  },
  {
    value: 5,
    label: "100%",
  },
];

type Props = {
  selectedRequestId: number;
  setSelectedRequestId: Dispatch<SetStateAction<number | null>>;
};

const RequestItemPage = ({
  selectedRequestId,
  setSelectedRequestId,
}: Props) => {
  const router = useRouter();
  const user = useUser();
  const { request, setRequest } = useFetchRequest(selectedRequestId);
  const [isLoading, setIsLoading] = useState(true);
  const [requestToDisplay, setRequestToDisplay] =
    useState<ReducedRequestType | null>(null);

  const supabaseClient = useSupabaseClient();
  const { requestWithApproverList, setRequestList } =
    useContext(RequestListContext);
  const [openPdfPreview, setOpenPdfPreview] = useState(false);
  const { teamMemberList } = useContext(ActiveTeamContext);
  const userIdRoleDictionary = teamMemberList.reduce(
    (acc, member) => ({
      ...acc,
      [`${member.user_id}`]: member.member_role_id,
    }),
    {}
  ) as { [key: string]: TeamMemberRole };
  const approverList = requestWithApproverList[`${selectedRequestId}`];
  const approverIdWithStatus =
    approverList &&
    approverList.find((approver) => {
      const isApprover =
        userIdRoleDictionary[approver.approver_id] === "owner" ||
        userIdRoleDictionary[approver.approver_id] === "admin";
      return isApprover;
    });
  const purchaserIdWithStatus =
    approverList &&
    approverList.find((approver) => {
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
  const attachments = request?.[0].request_attachment_filepath_list?.map(
    (filepath, i) => {
      return {
        filepath,
        url: attachmentUrlList ? attachmentUrlList[i] : null,
      };
    }
  );

  useEffect(() => {
    if (request) {
      setIsLoading(false);
    }
  }, [isLoading, request]);

  useEffect(() => {
    (async () => {
      try {
        const urlList = await getRequestWithAttachmentUrlList(
          supabaseClient,
          selectedRequestId as number
        );
        setAttachmentUrlList(urlList);
      } catch (e) {
        console.log(e);
        showNotification({
          title: "Error!",
          message: "Failed to fetch attachment information.",
          color: "red",
        });
      }
    })();
  }, [selectedRequestId, supabaseClient]);

  const handleDownloadToPdf = () => {
    const html = document.getElementById(`${requestToDisplay?.request_id}`);
    const doc = new jsPDF("p", "pt", [595.28, 841.89]);
    const pdfWidth = doc.internal.pageSize.getWidth();
    html?.style.setProperty("width", `${pdfWidth - 40}px`);
    // html?.style.setProperty("padding", `37px`);

    doc.html(html as HTMLElement, {
      margin: [20, 20, 60, 20],
      callback: function (pdf) {
        pdf.setFontSize(11);
        pdf.save(`request_${requestToDisplay?.request_title}`);
      },
      // x: 37,
      // y: 37,
    });

    setOpenPdfPreview(false);
    return;
  };

  // const confirmationModal = (
  //   action: string,
  //   requestTitle: string,
  //   confirmFunction: () => Promise<void>
  // ) =>
  //   openConfirmModal({
  //     title: "Please confirm your action",
  //     children: (
  //       <Text size="sm">
  //         Are you sure you want to {action} the {requestTitle}?
  //       </Text>
  //     ),
  //     labels: { confirm: "Confirm", cancel: "Cancel" },
  //     onConfirm: () => confirmFunction(),
  //   });

  const handleUpdateStatus = async (newStatus: RequestStatus) => {
    try {
      await updateRequestStatus(
        supabaseClient,
        selectedRequestId as number,
        newStatus,
        user?.id as string
      );

      setRequestToDisplay({
        ...(requestToDisplay as ReducedRequestType),
        form_fact_request_status_id: newStatus,
        request_status_id: newStatus,
      });

      setRequest(
        request?.map((request) => ({
          ...request,
          form_fact_request_status_id: newStatus,
          request_status_id: newStatus,
        }))
      );

      if (setRequestList) {
        setRequestList((prev) =>
          prev.map((prevItem) => {
            if (prevItem.request_id === selectedRequestId) {
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

      await deletePendingRequest(supabaseClient, selectedRequestId as number);

      showNotification({
        title: "Success!",
        message: `You deleted ${
          requestToDisplay && requestToDisplay?.request_title
        }`,
        color: "green",
      });

      if (setRequestList) {
        setRequestList((prev) => {
          return prev.filter(
            (request) => request.request_id !== selectedRequestId
          );
        });
      }

      setSelectedRequestId(null);
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
    const initialFields: { label: string; value: string; type: string }[] = [];
    const initialValue = [{ ...request?.[0], fields: initialFields }];

    const reducedRequest = request?.reduce((acc, next) => {
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
    setRequestToDisplay(reducedRequest?.[0] as ReducedRequestType);
  }, [request, router]);

  return !isLoading ? (
    <Box p="xs">
      {/* PDF PREVIEW */}
      {requestToDisplay && (
        <Modal
          opened={openPdfPreview}
          onClose={() => setOpenPdfPreview(false)}
          title="Download Preview"
          data-cy="download-preview"
        >
          {!approver?.user_signature_filepath ||
            (!purchaser?.user_signature_filepath && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Notice!"
                color="red"
                mb="sm"
              >
                This document does not contain signatures from both approver and
                purchaser.
              </Alert>
            ))}
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

      <Group position="apart">
        <Box
          sx={{ cursor: "pointer" }}
          onClick={() =>
            // router.push(`/t/${router.query.tid}/requests/${selectedRequestId}`)
            // Open a new tab using the link above
            window.open(
              `/t/${router.query.tid}/requests/${selectedRequestId}`,
              "_blank"
            )
          }
        >
          <Group spacing="xs">
            <Title order={4}>{requestToDisplay?.request_title}</Title>
            <Text fz="xs" c="indigo" td="underline">
              (Full Page)
            </Text>
          </Group>
          <Badge
            size="sm"
            variant="light"
            color={setBadgeColor(requestToDisplay?.request_status_id as string)}
            w="100%"
            maw="80px"
            data-cy="request-status"
          >
            {requestToDisplay?.request_status_id}
          </Badge>
        </Box>
        <CloseButton
          aria-label="close-request"
          onClick={() => setSelectedRequestId && setSelectedRequestId(null)}
        />
      </Group>
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
          <Text
            fz="xs"
            c="dimmed"
            data-cy="download-request"
            onClick={() => {
              if (
                !["approved", "purchased"].includes(
                  requestToDisplay?.request_status_id as string
                )
              ) {
                showNotification({
                  title: "Sorry!",
                  message:
                    "Request should be approved or purchased to download receipt.",
                  color: "orange",
                  autoClose: false,
                });
              } else {
                setOpenPdfPreview(true);
              }
            }}
          >
            <IconDownload size={20} />
          </Text>
          <Text fz="xs" c="dimmed">
            <IconDotsVertical size={20} />
          </Text>
        </Group>
      </Group>
      <Text>{requestToDisplay?.request_description}</Text>

      <Divider my="sm" variant="dotted" />
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
                onClick={() => handleUpdateStatus("rejected")}
              >
                Reject
              </Button>
              <Button
                onClick={() => handleUpdateStatus("approved")}
                data-cy="approve-request"
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
              onClick={() => handleUpdateStatus("purchased")}
              data-cy="purchase-request"
            >
              Mark as Purchased
            </Button>
          </Group>
        </>
      ) : null}
      {currentUserIsOwner &&
      requestToDisplay?.request_status_id === "pending" ? (
        <>
          <Divider my="sm" />
          <Group>
            <Button
              color="dark"
              my="sm"
              fullWidth
              onClick={handleDelete}
              data-cy="request-delete"
            >
              Delete
            </Button>
          </Group>
        </>
      ) : null}
      <Divider my="sm" />
      <RequestComment requestId={selectedRequestId as number} />
    </Box>
  ) : (
    <RequestSkeleton />
  );
};

export default RequestItemPage;
