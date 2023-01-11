import ActiveTeamContext from "@/contexts/ActiveTeamContext";
import FileUrlListContext from "@/contexts/FileUrlListContext";
import RequestContext from "@/contexts/RequestContext";
import RequestListContext from "@/contexts/RequestListContext";
import { editComment } from "@/utils/queries";
import {
  createRequestComment,
  deletePendingRequest,
  deleteRequestComment,
  GetRequest,
  getRequest,
  getRequestCommentList,
  GetRequestCommentList,
  GetRequestWithAttachmentUrlList,
  getRequestWithAttachmentUrlList,
  updateRequestComment,
  updateRequestStatus,
} from "@/utils/queries-new";
import {
  renderTooltip,
  setBadgeColor,
  setTimeDifference,
} from "@/utils/request";
import { Marks } from "@/utils/types";
import { RequestStatus, TeamMemberRole } from "@/utils/types-new";
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
  LoadingOverlay,
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
  setSelectedRequestId?: (requestId: number | null) => void;
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
  const requestListContext = useContext(RequestListContext);
  const requestContext = useContext(RequestContext);
  const { teamMemberList } = useContext(ActiveTeamContext);
  const fileUrlListContext = useContext(FileUrlListContext);
  const { setRequestList } = requestListContext;
  const { request: requestProps } = requestContext;
  const requestWithApproverList =
    view === "full"
      ? requestContext.requestWithApproverList
      : requestListContext.requestWithApproverList;
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const [comment, setComment] = useState("");
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [attachmentUrlList, setAttachmentUrlList] =
    useState<GetRequestWithAttachmentUrlList>();
  const [request, setRequest] = useState<GetRequest>(requestProps);
  const [commentList, setCommentList] = useState<GetRequestCommentList>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (!router.isReady) return;

        const [data, data2, data3] = await Promise.all([
          getRequest(supabaseClient, selectedRequestId),
          getRequestWithAttachmentUrlList(supabaseClient, selectedRequestId),
          getRequestCommentList(supabaseClient, selectedRequestId),
        ]);
        if (!data) throw new Error("Request not found");

        setRequest(data);
        setAttachmentUrlList(data2);
        setCommentList(data3);
      } catch (error) {
        console.error(error);
        showNotification({
          title: "Error!",
          message: "Failed to fetch request information",
          color: "red",
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [router, selectedRequestId, supabaseClient]);

  if (isLoading) return <LoadingOverlay visible={isLoading} overlayBlur={2} />;

  const title = request?.[0]?.request_title;
  const description = request?.[0]?.request_description;
  const requestedBy = request?.[0]?.username;
  const requestedById = request?.[0]?.user_id;
  const dateCreated = request?.[0]?.request_date_created;
  const onBehalfOf = request?.[0]?.request_on_behalf_of;
  const order = request && request[0].order_field_id_list;
  const attachments =
    request &&
    request[0]?.request_attachment_filepath_list &&
    request[0].request_attachment_filepath_list.map((filepath, i) => {
      return {
        filepath,
        url: attachmentUrlList ? attachmentUrlList[i] : null,
      };
    });
  const userIdRoleDictionary = teamMemberList.reduce(
    (acc, member) => ({
      ...acc,
      [`${member.user_id}`]: member.member_role_id,
    }),
    {}
  ) as { [key: string]: TeamMemberRole };
  const approverList = requestWithApproverList[selectedRequestId.toString()];
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

  request &&
    request.sort((a, b) => {
      if (!order) return 0;
      return (
        order.indexOf(a.field_id as number) -
        order.indexOf(b.field_id as number)
      );
    });

  const currentUserIsOwner = request?.[0]?.user_id === user?.id;
  const currentUserIsApprover = approver?.user_id === user?.id;
  const currentUserIsPurchaser = purchaser?.user_id === user?.id;
  const status = request?.[0]?.form_fact_request_status_id;

  const handleAddComment = async () => {
    if (!comment) return;
    if (!request) return;
    try {
      const createdComment = await createRequestComment(
        supabaseClient,
        comment,
        user?.id as string,
        request[0].request_id as number
      );

      setComment("");
      setCommentList((prev) => {
        const newCommentList = [...prev];
        newCommentList.push(createdComment as GetRequestCommentList[0]);
        return newCommentList;
      });

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

      setCommentList((prev) =>
        prev.filter((comment) => comment.comment_id !== commentId)
      );
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

      const updatedComment = await updateRequestComment(
        supabaseClient,
        newComment,
        editCommentId as number
      );

      const newCommentList = commentList.map((comment) =>
        comment.comment_id === updatedComment?.comment_id
          ? updatedComment
          : comment
      );

      setCommentList(() => newCommentList as GetRequestCommentList);

      setEditCommentId(null);
      setNewComment("");

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

  const handleUpdateStatus = async (newStatus: RequestStatus) => {
    try {
      await updateRequestStatus(
        supabaseClient,
        selectedRequestId,
        newStatus,
        user?.id as string
      );

      setRequest(
        request?.map((request) => ({
          ...request,
          form_fact_request_status_id: newStatus,
          request_status_id: newStatus,
        }))
      );
      // if (setRequestWithApproverListProps)
      //   setRequestWithApproverListProps((prev) => {
      //     return prev[selectedRequestId.toString()].map((approver) => {
      //       if (approver.approver_id === user?.id) {
      //         return { ...approver, status: "approved" };
      //       } else {
      //         return approver;
      //       }
      //     });
      //   });
      if (view !== "full") {
        if (setRequestList)
          setRequestList((prev) => {
            return prev.map((request) => {
              if (request.request_id === selectedRequestId) {
                return {
                  ...request,
                  form_fact_request_status_id: newStatus,
                  request_status_id: newStatus,
                };
              } else {
                return request;
              }
            });
          });
      }

      showNotification({
        title: "Success!",
        message: `You ${newStatus} ${request && request[0].request_title}`,
        color: "green",
      });
    } catch {
      showNotification({
        title: "Error!",
        message: `Failed to update status of ${
          request && request[0].request_title
        }`,
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
        if (setRequestList) {
          setRequestList((prev) => {
            return prev.filter(
              (request) => request.request_id !== selectedRequestId
            );
          });
          setSelectedRequestId && setSelectedRequestId(null);
        } else {
          router.replace(router.asPath);
        }
      }
    } catch {
      showNotification({
        title: "Error!",
        message: `Failed to delete ${request && request[0].request_title}`,
        color: "red",
      });
    }
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
          <Text>{title}</Text>
        </Stack>
        <Stack align="flex-start">
          <Title order={5}>Requested By</Title>
          <Group>
            <Avatar
              radius={100}
              src={fileUrlListContext?.avatarUrlList[requestedById as string]}
            />
            <Text>{requestedBy}</Text>
          </Group>
        </Stack>
      </Group>
      <Group mt="xl" position="apart" grow>
        <Stack align="flex-start">
          <Title order={5}>Date Created</Title>
          <Text>{dateCreated?.slice(0, 10)}</Text>
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
          <Text>{description}</Text>
        </Stack>
        <Stack align="flex-start">
          <Title order={5}>On behalf of</Title>
          <Text>{onBehalfOf || "---"}</Text>
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
                  approverIdWithStatus?.approver_status || "pending"
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
            // const mockFileSize = "234 KB";
            const filePath = attachment.filepath;
            const fileUrl = attachment.url as string;
            const fileType = attachment.filepath.split(".").pop() as string;
            const mockFileSize = "";
            const mockFile = "file";

            return (
              <Group key={idx}>
                {view === "split" ? (
                  <AttachmentPill
                    filename={filePath}
                    fileType={fileType}
                    fileUrl={fileUrl}
                  />
                ) : (
                  <AttachmentBox
                    file={mockFile}
                    fileSize={mockFileSize}
                    filename={filePath}
                    fileType={fileType}
                    fileUrl={fileUrl}
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
                  () => handleUpdateStatus("approved")
                )
              }
              fullWidth={view === "split"}
              w={view === "full" ? 200 : ""}
              size={view === "full" ? "md" : "sm"}
              data-cy="request-approve"
            >
              Approve
            </Button>
            <Button
              color="red"
              onClick={() =>
                confirmationModal(
                  "reject",
                  `${request && request[0].request_title}`,
                  () => handleUpdateStatus("rejected")
                )
              }
              fullWidth={view === "split"}
              w={view === "full" ? 200 : ""}
              size={view === "full" ? "md" : "sm"}
              data-cy="request-reject"
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
              data-cy="request-delete"
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
                  () => handleUpdateStatus("purchased")
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
            data-cy="request-input-comment"
          />
          <Group position="right" mt="xs">
            <Button
              w={100}
              onClick={handleAddComment}
              data-cy="request-submit-comment"
            >
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
                    fileUrlListContext?.avatarUrlList[
                      comment.user_request_comment_user_id as string
                    ]
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
