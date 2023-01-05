import RequestListContext from "@/contexts/RequestListContext";
import { editComment } from "@/utils/queries";
import {
  createRequestComment,
  deletePendingRequest,
  deleteRequestComment,
  GetRequestAttachmentUrlList,
  getRequestAttachmentUrlList,
  GetTeamMemberAvatarUrlList,
  getTeamMemberAvatarUrlList,
  updateRequestComment,
  updateRequestStatus,
} from "@/utils/queries-new";
import {
  renderTooltip,
  setBadgeColor,
  setTimeDifference,
} from "@/utils/request";
import { Marks } from "@/utils/types";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Group,
  MultiSelect,
  NumberInput,
  Paper,
  Popover,
  Select,
  Slider,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { DatePicker, DateRangePicker, TimeInput } from "@mantine/dates";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { startCase } from "lodash";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Close, Dots, Maximize } from "../Icon";
import AttachmentBox from "../RequestsPage/AttachmentBox";
import AttachmentPill from "../RequestsPage/AttachmentPill";
import styles from "./Request.module.scss";

type Props = {
  view: "split" | "full";
  selectedRequestId: number;
  setSelectedRequestId: (requestId: number | null) => void;
};

const MARKS: Marks[] = [
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

const Request = ({ view, selectedRequestId, setSelectedRequestId }: Props) => {
  const router = useRouter();
  const requestListContex = useContext(RequestListContext);
  const {
    requestIdList,
    requestList,
    requestCommentList,
    requestApproverList,
  } = requestListContex || {};
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const [comment, setComment] = useState("");
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [attachmentUrlList, setAttachmentUrlList] =
    useState<GetRequestAttachmentUrlList | null>(null);
  const [avatarUrlList, setavatarUrlList] =
    useState<GetTeamMemberAvatarUrlList | null>(null);

  useEffect(() => {
    (async () => {
      if (!router.isReady) return;
      if (!requestIdList) return;
      if (requestIdList && requestIdList.length === 0) return;

      const data = await getRequestAttachmentUrlList(
        supabaseClient,
        requestIdList as number[]
      );

      const data2 = await getTeamMemberAvatarUrlList(supabaseClient, [
        router.query.tid as string,
      ]);

      setAttachmentUrlList(data);

      setavatarUrlList(data2);
    })();
  }, [router]);

  const request =
    view === "full"
      ? requestList
      : requestList?.filter(
          (request) => request.request_id === selectedRequestId
        );

  const order = request && request[0].order_field_id_list;

  request &&
    request.sort((a, b) => {
      if (!order) return 0;
      return (
        order.indexOf(a.field_id as number) -
        order.indexOf(b.field_id as number)
      );
    });

  const attachments =
    request &&
    request[0]?.request_attachment_filepath_list &&
    request[0].request_attachment_filepath_list.map((filepath, i) => {
      return {
        filepath,
        url: attachmentUrlList?.[selectedRequestId]?.[i],
      };
    });

  // Loookup comment list of the selected request.
  const commentList =
    requestCommentList &&
    requestCommentList.filter(
      (comment) => comment.request_id === selectedRequestId
    );

  // Loookup approvers list of the selected request.
  const approverList =
    requestApproverList &&
    requestApproverList.filter(
      (approver) => approver.request_id === selectedRequestId
    );

  const approver = approverList?.find((approver) => approver.is_approver);
  const purchaser = approverList?.find((approver) => approver.is_purchaser);

  const currentUserIsOwner = request?.[0]?.user_id === user?.id;
  const currentUserIsApprover = approver?.user_id === user?.id;
  const currentUserIsPurchaser = purchaser?.user_id === user?.id;

  const status = request?.[0]?.form_fact_request_status_id;

  const handleAddComment = async () => {
    if (!comment) return;
    if (!request) return;
    try {
      await createRequestComment(
        supabaseClient,
        comment,
        user?.id as string,
        request[0].request_id as number
      );

      setComment("");
      router.replace(router.asPath);
      showNotification({
        title: "Success!",
        message: "Comment created",
        color: "green",
      });
    } catch {
      showNotification({
        title: "Error!",
        message: "Failed to create comment",
        color: "red",
      });
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteRequestComment(supabaseClient, commentId);
      router.replace(router.asPath);
      showNotification({
        title: "Success!",
        message: "Comment deleted",
        color: "green",
      });
    } catch {
      showNotification({
        title: "Error!",
        message: "Failed to delete comment",
        color: "red",
      });
    }
  };

  const handleEditComment = async () => {
    try {
      if (!newComment) return;
      if (!editComment) return;

      await updateRequestComment(
        supabaseClient,
        newComment,
        editCommentId as number
      );
      router.replace(router.asPath);
      showNotification({
        title: "Success!",
        message: "Comment edited",
        color: "green",
      });
    } catch {
      showNotification({
        title: "Error!",
        message: "Failed to edit comment",
        color: "red",
      });
    }
  };

  const handleApprove = async () => {
    try {
      await updateRequestStatus(
        supabaseClient,
        selectedRequestId,
        "approved",
        user?.id as string
      );

      showNotification({
        title: "Success!",
        message: `You approved ${request && request[0].request_title}`,
        color: "green",
      });
      router.replace(router.asPath);
    } catch {
      showNotification({
        title: "Error!",
        message: `Failed to approve ${request && request[0].request_title}`,
        color: "red",
      });
    }
  };
  const handleReject = async () => {
    try {
      await updateRequestStatus(
        supabaseClient,
        selectedRequestId,
        "rejected",
        user?.id as string
      );

      showNotification({
        title: "Success!",
        message: `You rejected ${request && request[0].request_title}`,
        color: "green",
      });
      router.replace(router.asPath);
    } catch {
      showNotification({
        title: "Error!",
        message: `Failed to reject ${request && request[0].request_title}`,
        color: "red",
      });
    }
  };

  const handleDelete = async () => {
    try {
      if (!request) throw Error("No request found");

      await deletePendingRequest(
        supabaseClient,
        request[0].request_id as number
      );

      showNotification({
        title: "Success!",
        message: `You deleted ${request && request[0].request_title}`,
        color: "green",
      });
      if (view === "full") {
        router.push(`/t/${router.query.tid}/requests`);
      } else {
        router.replace(router.asPath);
      }
    } catch {
      showNotification({
        title: "Error!",
        message: `Failed to delete ${request && request[0].request_title}`,
        color: "red",
      });
    }
  };

  const handlePurchase = async () => {
    try {
      await updateRequestStatus(
        supabaseClient,
        selectedRequestId,
        "purchased",
        user?.id as string
      );
      router.replace(router.asPath);
      showNotification({
        title: "Success!",
        message: `You marked as purchased ${
          request && request[0].request_title
        }`,
        color: "green",
      });
    } catch {
      showNotification({
        title: "Error!",
        message: `Failed to mark as purchased ${
          request && request[0].request_title
        }`,
        color: "red",
      });
    }
  };

  const confirmationModal = (
    action: string,
    requestTitle: string,
    confirmFunction: () => void
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

  // isLoading && <LoadingOverlay visible={isLoading} overlayBlur={2} />;
  return (
    <Container
      p={view === "full" ? "xl" : 0}
      m={0}
      className={styles.container}
      fluid
    >
      {view === "split" ? (
        <Container m={0} p={0} className={styles.closeIcon}>
          <Group spacing={0}>
            <ActionIcon
              onClick={() =>
                router.push(
                  `/t/${router.query.tid}/requests/${selectedRequestId}`
                )
              }
            >
              <Maximize />
            </ActionIcon>
            <ActionIcon
              onClick={() => {
                if (setSelectedRequestId) {
                  setSelectedRequestId(null);
                }
              }}
            >
              <Close />
            </ActionIcon>
          </Group>
        </Container>
      ) : null}
      <Group position="apart" grow>
        <Stack align="flex-start">
          <Title order={5}>Request Title</Title>
          <Text>{request && request[0].request_title}</Text>
        </Stack>
        <Stack align="flex-start">
          <Title order={5}>Requested By</Title>
          <Group>
            <Avatar radius={100} />
            <Text>{request && request[0].username}</Text>
          </Group>
        </Stack>
      </Group>
      <Group mt="xl" position="apart" grow>
        <Stack align="flex-start">
          <Title order={5}>Date Created</Title>
          <Text>
            {request && request[0].request_date_created?.slice(0, 10)}
          </Text>
        </Stack>
        <Stack align="flex-start">
          <Title order={5}>Status</Title>
          <Badge color={setBadgeColor(`${status}`)}>
            {startCase(`${status}`)}
          </Badge>
        </Stack>
      </Group>
      <Group mt="xl" position="apart" grow>
        <Stack mt="xl" align="flex-start">
          <Title order={5}>Request Description</Title>
          <Text>{request && request[0].request_description}</Text>
        </Stack>
        <Stack align="flex-start">
          <Title order={5}>On behalf of</Title>
          <Text>{(request && request[0].request_on_behalf_of) || "---"}</Text>
        </Stack>
      </Group>

      <Divider mt="xl" />
      <Group mt="xl" position="apart" grow>
        <Stack>
          <Title order={5}>Approver</Title>
          <Group align="apart" grow>
            <Group>
              <Badge
                color={setBadgeColor(
                  `${approver?.request_approver_request_status_id}`
                )}
              />
              <Text>{approver?.username}</Text>
            </Group>
          </Group>
        </Stack>
        {purchaser ? (
          <Stack>
            <Title order={5}>Purchaser</Title>
            <Group align="apart" grow>
              <Group>
                <Badge color={status === "purchased" ? "green" : "blue"} />
                <Text>{purchaser.username}</Text>
              </Group>
            </Group>
          </Stack>
        ) : null}
      </Group>
      <Divider mt="xl" />
      <Stack mt="xl">
        <Title order={5}>Attachment</Title>
        {!attachments && <Text>---</Text>}
        {attachments &&
          attachments.map((attachment, idx) => {
            const attachmentUrl = attachment.url;
            // const mockFileSize = "234 KB";
            const mockFileSize = "";
            const mockFile = "file";

            return (
              <Group key={idx}>
                {view === "split" ? (
                  <AttachmentPill
                    filename={attachment.filepath}
                    fileType={attachment.filepath.split(".").pop() as string}
                    fileUrl={attachment.url as string}
                  />
                ) : (
                  <AttachmentBox
                    filename={attachment.filepath}
                    fileType={attachment.filepath.split(".").pop() as string}
                    fileUrl={attachment.url as string}
                    file={mockFile}
                    fileSize={mockFileSize}
                  />
                )}
              </Group>
            );
          })}
      </Stack>

      {currentUserIsApprover && status === "pending" ? (
        <>
          <Divider mt="xl" />
          <Flex mt="xl" wrap="wrap" gap="xs" align="center" justify="flex-end">
            <Button
              color="green"
              onClick={() =>
                confirmationModal(
                  "approve",
                  `${request && request[0].request_title}`,
                  handleApprove
                )
              }
              fullWidth={view === "split"}
              w={view === "full" ? 200 : ""}
              size={view === "full" ? "md" : "sm"}
            >
              Approve
            </Button>
            <Button
              color="red"
              onClick={() =>
                confirmationModal(
                  "reject",
                  `${request && request[0].request_title}`,
                  handleReject
                )
              }
              fullWidth={view === "split"}
              w={view === "full" ? 200 : ""}
              size={view === "full" ? "md" : "sm"}
            >
              Reject
            </Button>
          </Flex>
        </>
      ) : null}

      {currentUserIsOwner && status === "pending" ? (
        <>
          <Divider mt="xl" />{" "}
          <Flex mt="xl" wrap="wrap" gap="xs" align="center" justify="flex-end">
            <Button
              color="dark"
              onClick={() =>
                confirmationModal(
                  "delete",
                  `${request && request[0].request_title}`,
                  handleDelete
                )
              }
              fullWidth={view === "split"}
              w={view === "full" ? 200 : ""}
              size={view === "full" ? "md" : "sm"}
            >
              Delete
            </Button>
          </Flex>
        </>
      ) : null}

      {currentUserIsPurchaser && status === "approved" ? (
        <>
          <Divider mt="xl" />{" "}
          <Flex mt="xl" wrap="wrap" gap="xs" align="center" justify="flex-end">
            <Button
              onClick={() =>
                confirmationModal(
                  "mark as purchased",
                  `${request && request[0].request_title}`,
                  handlePurchase
                )
              }
              fullWidth={view === "split"}
              w={view === "full" ? 200 : ""}
              size={view === "full" ? "md" : "sm"}
            >
              Mark as Purchased
            </Button>
          </Flex>
        </>
      ) : null}

      <Divider mt="xl" />
      <Title mt="xl" order={5}>
        Request Fields
      </Title>
      {request?.map((field) => {
        const fieldType = field.request_field_type;
        const fieldLabel = field.field_name;
        const fieldResponse = `${field.response_value}`;
        const fieldOptions = field.field_options;

        if (fieldType === "section") {
          return (
            <Divider
              key={field.field_id}
              label={fieldLabel}
              labelPosition="center"
              mt="xl"
            />
          );
        } else if (fieldType === "text" || fieldType === "email") {
          return (
            <Box key={field.field_id} py="sm">
              {renderTooltip(
                <TextInput
                  label={fieldLabel}
                  withAsterisk={Boolean(field.field_is_required)}
                  value={`${field.response_value}`}
                  readOnly
                />,
                `${field.field_tooltip}`
              )}
            </Box>
          );
        } else if (fieldType === "number") {
          return (
            <Box key={field.field_id} py="sm">
              {renderTooltip(
                <NumberInput
                  label={fieldLabel}
                  withAsterisk={Boolean(field.field_is_required)}
                  value={Number(fieldResponse)}
                  readOnly
                />,
                `${field.field_tooltip}`
              )}
            </Box>
          );
        } else if (fieldType === "date") {
          return (
            <Box key={field.field_id} py="sm">
              {renderTooltip(
                <DatePicker
                  label={fieldLabel}
                  withAsterisk={Boolean(field.field_is_required)}
                  placeholder={"Choose date"}
                  value={new Date(fieldResponse)}
                  readOnly
                />,
                `${field.field_tooltip}`
              )}
            </Box>
          );
        } else if (fieldType === "daterange") {
          return (
            <Box key={field.field_id} py="sm">
              {renderTooltip(
                <DateRangePicker
                  label={fieldLabel}
                  withAsterisk={Boolean(field.field_is_required)}
                  placeholder={"Choose a date range"}
                  value={[
                    new Date(fieldResponse.split(",")[0]),
                    new Date(fieldResponse.split(",")[1]),
                  ]}
                  readOnly
                />,
                `${field.field_tooltip}`
              )}
            </Box>
          );
        } else if (fieldType === "time") {
          return (
            <Box key={field.field_id} py="sm">
              {renderTooltip(
                <TimeInput
                  label={fieldLabel}
                  withAsterisk={Boolean(field.field_is_required)}
                  placeholder={"Choose time"}
                  format="12"
                  value={new Date(fieldResponse)}
                />,
                `${field.field_tooltip}`
              )}
            </Box>
          );
        } else if (fieldType === "slider") {
          return (
            <Box my="md" key={field.field_id} py="sm">
              {renderTooltip(
                <Text component="label" color="dark">
                  {fieldLabel}
                </Text>,
                `${field.field_tooltip}`
              )}
              <Slider
                label={fieldLabel}
                placeholder={"Slide to choose value"}
                marks={MARKS}
                min={1}
                max={5}
                labelAlwaysOn={false}
                value={Number(fieldResponse)}
              />
            </Box>
          );
        } else if (fieldType === "multiple" && fieldOptions !== null) {
          return renderTooltip(
            <MultiSelect
              key={field.field_id}
              data={fieldOptions.map((option) => {
                return { value: `${option}`, label: `${option}` };
              })}
              label={fieldLabel}
              withAsterisk={Boolean(field.field_is_required)}
              placeholder={"Choose multiple"}
              value={fieldResponse.split(",")}
              py="sm"
            />,
            `${field.field_tooltip}`
          );
        } else if (fieldType === "select" && fieldOptions !== null) {
          return renderTooltip(
            <Select
              key={field.field_id}
              data={fieldOptions.map((option) => {
                return { value: `${option}`, label: `${option}` };
              })}
              searchable
              clearable
              label={fieldLabel}
              withAsterisk={Boolean(field.field_is_required)}
              placeholder={"Choose one"}
              value={fieldResponse}
              py="sm"
            />,
            `${field.field_tooltip}`
          );
        }
      })}

      {/* fields and comments na now */}

      <Divider mt="xl" />
      <Stack mt="xl">
        <Title order={5}>Comments</Title>
        <Paper withBorder p="xs">
          <Textarea
            placeholder="Type your comment here"
            variant="unstyled"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Group position="right" mt="xs">
            <Button w={100} onClick={handleAddComment}>
              Send
            </Button>
          </Group>
        </Paper>
        {commentList &&
          commentList.map((comment) => (
            <Paper shadow="sm" key={comment.comment_id} p="xl" withBorder>
              <Flex gap="xs" wrap="wrap" align="center">
                <Avatar
                  radius={100}
                  src={
                    avatarUrlList && avatarUrlList[comment.user_id as string]
                  }
                  size="sm"
                />
                <Text fw={500}>{comment.username}</Text>
                {comment.comment_is_edited ? (
                  <Text c="dimmed">(edited)</Text>
                ) : null}
                <Text c="dimmed">
                  {setTimeDifference(
                    new Date(`${comment.comment_date_created}`)
                  )}
                </Text>
                {comment.user_id === user?.id ? (
                  <Popover position="bottom" shadow="md">
                    <Popover.Target>
                      <Button ml="auto" variant="subtle">
                        <Dots />
                      </Button>
                    </Popover.Target>
                    <Popover.Dropdown p={0}>
                      <Flex>
                        <Button
                          radius={0}
                          variant="subtle"
                          onClick={() => {
                            setNewComment(`${comment.comment_content}`);
                            setEditCommentId(comment.comment_id);
                          }}
                        >
                          Edit
                        </Button>
                        <Divider orientation="vertical" />
                        <Button
                          radius={0}
                          variant="subtle"
                          onClick={() =>
                            handleDeleteComment(comment.comment_id as number)
                          }
                        >
                          Delete
                        </Button>
                      </Flex>
                    </Popover.Dropdown>
                  </Popover>
                ) : null}
              </Flex>
              {comment.comment_id === editCommentId ? (
                <Paper withBorder p="xs" mt="sm">
                  <Textarea
                    placeholder="Type your new comment here"
                    variant="unstyled"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Group position="right" mt="xs" spacing={5}>
                    <Button
                      w={100}
                      onClick={() => {
                        setEditCommentId(null);
                        setNewComment("");
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button w={100} onClick={handleEditComment}>
                      Submit
                    </Button>
                  </Group>
                </Paper>
              ) : null}
              {comment.comment_id !== editCommentId ? (
                <Text mt="xs">{comment.comment_content}</Text>
              ) : null}
            </Paper>
          ))}
      </Stack>
    </Container>
  );
};

export default Request;
