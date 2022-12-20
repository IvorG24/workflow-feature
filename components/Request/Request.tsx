import {
  createComment,
  deleteComment,
  deleteRequest,
  editComment,
  markAsPurchasedRequest,
  requestResponse,
  RetrievedRequestComments,
  retrieveRequestComments,
} from "@/utils/queries";
import {
  renderTooltip,
  setBadgeColor,
  setTimeDifference,
} from "@/utils/request";
import { Database, Marks, RequestFields, RequestType } from "@/utils/types";
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
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Close, Dots, Maximize } from "../Icon";
import styles from "./Request.module.scss";

type Props = {
  view: "split" | "full";
  selectedRequest: RequestType | null;
  setSelectedRequest?: Dispatch<SetStateAction<RequestType | null>>;
  setRequestList?: Dispatch<SetStateAction<RequestType[]>>;
  setIsLoading?: Dispatch<SetStateAction<boolean>>;
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

const Request = ({
  view,
  selectedRequest,
  setSelectedRequest,
  setRequestList,
  setIsLoading,
}: Props) => {
  const router = useRouter();
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const [selectedRequestFields, setSelectedRequestFields] = useState<
    RequestFields[]
  >([]);
  const [comment, setComment] = useState("");
  const [commentList, setCommentList] = useState<RetrievedRequestComments[]>(
    []
  );
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [fullViewIsLoading, setFullViewIsLoading] = useState(false);

  const isApprover =
    (selectedRequest?.request_status === "stale" ||
      selectedRequest?.request_status === "pending") &&
    selectedRequest?.approver_id === user?.id;

  const isPurchaser =
    selectedRequest?.request_status === "approved" &&
    selectedRequest?.purchaser_id === user?.id &&
    selectedRequest?.request_is_purchased !== true;

  const isOwner =
    selectedRequest?.owner.user_id === user?.id &&
    (selectedRequest?.request_status === "pending" ||
      selectedRequest?.request_status === "stale");

  useEffect(() => {
    const fetchRequestFields = async () => {
      try {
        const { data: requestFields, error: requestFieldsError } =
          await supabase
            .from("request_response_table")
            .select("*, field: field_id(*)")
            .eq("request_id", selectedRequest?.request_id);

        if (requestFieldsError) throw requestFieldsError;

        setSelectedRequestFields(requestFields as unknown as RequestFields[]);
      } catch {
        showNotification({
          title: "Error!",
          message: "Failed to fetch Request Fields",
          color: "red",
        });
      }
    };
    const fetchComments = async () => {
      const commentList = await retrieveRequestComments(
        supabase,
        Number(selectedRequest?.request_id)
      );
      setCommentList(commentList);
    };

    fetchRequestFields();
    fetchComments();
  }, [selectedRequest?.request_id, supabase]);

  const handleAddComment = async () => {
    if (!comment) return;

    try {
      const createdComment = await createComment(
        supabase,
        Number(selectedRequest?.request_id),
        comment,
        `${user?.id}`
      );
      setComment("");
      setCommentList((prev) => [...prev, createdComment]);
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

  const handleDeleteComment = async (id: number) => {
    try {
      await deleteComment(supabase, id);
      setCommentList((prev) =>
        prev.filter((comment) => comment.request_comment_id !== id)
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
    if (!newComment) return;

    try {
      await editComment(supabase, Number(editCommentId), newComment);

      setCommentList((prev) =>
        prev.map((comment) => {
          if (comment.request_comment_id === editCommentId) {
            return {
              ...comment,
              request_comment: newComment,
              request_comment_is_edited: true,
            };
          } else {
            return comment;
          }
        })
      );
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

  const handleApprove = async () => {
    setIsLoading && setIsLoading(true);
    if (view === "full") {
      setFullViewIsLoading(true);
    }
    try {
      await requestResponse(
        supabase,
        Number(selectedRequest?.request_id),
        "approved"
      );

      setRequestList &&
        setRequestList((prev) =>
          prev.map((request) => {
            if (request.request_id === selectedRequest?.request_id) {
              return {
                ...request,
                request_status: "approved",
              };
            } else {
              return request;
            }
          })
        );
      setSelectedRequest && setSelectedRequest(null);
      showNotification({
        title: "Success!",
        message: `You approved ${selectedRequest?.request_title}`,
        color: "green",
      });
      if (view === "full") {
        router.push(`/t/${router.query.tid}/requests`);
      }
    } catch {
      showNotification({
        title: "Error!",
        message: `Failed to approve ${selectedRequest?.request_title}`,
        color: "red",
      });
    }
    setIsLoading && setIsLoading(false);
    if (view === "full") {
      setFullViewIsLoading(false);
    }
  };

  // const handleSendToRevision = async () => {
  //   setIsLoading(true);
  //   try {
  //     await requestResponse(
  //       supabase,
  //       Number(selectedRequest?.request_id),
  //       "revision"
  //     );

  //     setRequestList((prev) =>
  //       prev.map((request) => {
  //         if (request.request_id === selectedRequest?.request_id) {
  //           return {
  //             ...request,
  //             request_status: "revision",
  //           };
  //         } else {
  //           return request;
  //         }
  //       })
  //     );
  //     setSelectedRequest(null);
  //     showNotification({
  //       title: "Success!",
  //       message: `${selectedRequest?.request_title} is sent to revision`,
  //       color: "green",
  //     });
  //   } catch {
  //     showNotification({
  //       title: "Error!",
  //       message: `${selectedRequest?.request_title} has failed to send to revision `,
  //       color: "red",
  //     });
  //   }
  //   setIsLoading(false);
  // };

  const handleReject = async () => {
    setIsLoading && setIsLoading(true);
    if (view === "full") {
      setFullViewIsLoading(true);
    }
    try {
      await requestResponse(
        supabase,
        Number(selectedRequest?.request_id),
        "rejected"
      );

      setRequestList &&
        setRequestList((prev) =>
          prev.map((request) => {
            if (request.request_id === selectedRequest?.request_id) {
              return {
                ...request,
                request_status: "rejected",
              };
            } else {
              return request;
            }
          })
        );
      setSelectedRequest && setSelectedRequest(null);
      showNotification({
        title: "Success!",
        message: `You rejected ${selectedRequest?.request_title}`,
        color: "green",
      });
      if (view === "full") {
        router.push(`/t/${router.query.tid}/requests`);
      }
    } catch {
      showNotification({
        title: "Error!",
        message: `Failed to reject ${selectedRequest?.request_title}`,
        color: "red",
      });
    }
    setIsLoading && setIsLoading(false);
    if (view === "full") {
      setFullViewIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading && setIsLoading(true);
    if (view === "full") {
      setFullViewIsLoading(true);
    }
    try {
      await deleteRequest(supabase, Number(selectedRequest?.request_id));

      setRequestList &&
        setRequestList((prev) =>
          prev.filter(
            (request) => request.request_id !== selectedRequest?.request_id
          )
        );
      setSelectedRequest && setSelectedRequest(null);
      showNotification({
        title: "Success!",
        message: `You deleted ${selectedRequest?.request_title}`,
        color: "green",
      });
      if (view === "full") {
        router.push(`/t/${router.query.tid}/requests`);
      }
    } catch {
      showNotification({
        title: "Error!",
        message: `Failed to delete ${selectedRequest?.request_title}`,
        color: "red",
      });
    }
    setIsLoading && setIsLoading(false);
    if (view === "full") {
      setFullViewIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    setIsLoading && setIsLoading(true);
    if (view === "full") {
      setFullViewIsLoading(true);
    }
    try {
      await markAsPurchasedRequest(
        supabase,
        Number(selectedRequest?.request_id)
      );

      setRequestList &&
        setRequestList((prev) =>
          prev.map((request) => {
            if (request.request_id === selectedRequest?.request_id) {
              return {
                ...request,
                request_is_purchased: true,
              };
            } else {
              return request;
            }
          })
        );

      setSelectedRequest && setSelectedRequest(null);
      showNotification({
        title: "Success!",
        message: `You mark as purchased ${selectedRequest?.request_title}`,
        color: "green",
      });
      if (view === "full") {
        router.push(`/t/${router.query.tid}/requests`);
      }
    } catch {
      showNotification({
        title: "Error!",
        message: `Failed to mark as purchased ${selectedRequest?.request_title}`,
        color: "red",
      });
    }
    setIsLoading && setIsLoading(false);
    if (view === "full") {
      setFullViewIsLoading(false);
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

  return (
    <Container
      p={view === "full" ? "xl" : 0}
      m={0}
      className={styles.container}
      fluid
    >
      <LoadingOverlay visible={fullViewIsLoading} overlayBlur={2} />
      {view === "split" ? (
        <Container m={0} p={0} className={styles.closeIcon}>
          <Group spacing={0}>
            <ActionIcon
              onClick={() =>
                router.push(
                  `/t/${router.query.tid}/requests/${selectedRequest?.request_id}`
                )
              }
            >
              <Maximize />
            </ActionIcon>
            <ActionIcon
              onClick={() => {
                if (setSelectedRequest) {
                  setSelectedRequest(null);
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
          <Text>{selectedRequest?.request_title}</Text>
        </Stack>
        <Stack align="flex-start">
          <Title order={5}>Requested By</Title>
          <Group>
            <Avatar radius={100} />
            <Text>{selectedRequest?.owner.full_name}</Text>
          </Group>
        </Stack>
      </Group>
      <Group mt="xl" position="apart" grow>
        <Stack align="flex-start">
          <Title order={5}>Date Created</Title>
          <Text>{selectedRequest?.request_created_at?.slice(0, 10)}</Text>
        </Stack>
        <Stack align="flex-start">
          <Title order={5}>Status</Title>
          <Badge color={setBadgeColor(`${selectedRequest?.request_status}`)}>
            {startCase(`${selectedRequest?.request_status}`)}
          </Badge>
        </Stack>
      </Group>
      <Group mt="xl" position="apart" grow>
        <Stack mt="xl" align="flex-start">
          <Title order={5}>Request Description</Title>
          <Text>{selectedRequest?.request_description}</Text>
        </Stack>
        <Stack align="flex-start">
          <Title order={5}>On behalf of</Title>
          <Text>
            {selectedRequest?.on_behalf_of
              ? selectedRequest.on_behalf_of
              : "---"}
          </Text>
        </Stack>
      </Group>

      <Divider mt="xl" />
      <Group mt="xl" position="apart" grow>
        <Stack>
          <Title order={5}>Approver</Title>
          <Group align="apart" grow>
            <Group>
              <Badge
                color={setBadgeColor(`${selectedRequest?.request_status}`)}
              />
              <Text>{selectedRequest?.approver.full_name}</Text>
            </Group>
          </Group>
        </Stack>
        {selectedRequest?.purchaser ? (
          <Stack>
            <Title order={5}>Purchaser</Title>
            <Group align="apart" grow>
              <Group>
                <Badge
                  color={
                    selectedRequest?.request_is_purchased ? "green" : "blue"
                  }
                />
                <Text>{selectedRequest?.purchaser.full_name}</Text>
              </Group>
            </Group>
          </Stack>
        ) : null}
      </Group>
      <Divider mt="xl" />
      <Stack mt="xl">
        <Title order={5}>Attachment</Title>
        {!selectedRequest?.attachments && <Text>---</Text>}
        {selectedRequest?.attachments &&
          selectedRequest.attachments.length === 0 && <Text>---</Text>}
        {selectedRequest?.attachments &&
          selectedRequest?.attachments.map((attachment) => {
            const attachmentUrl = attachment.split("|").pop();
            return (
              <a
                key={attachmentUrl}
                href={attachmentUrl}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={attachmentUrl}
                  alt="Attachment Image"
                  style={{ height: 200, width: 200 }}
                />
              </a>
            );
          })}
      </Stack>

      {isApprover ? (
        <>
          <Divider mt="xl" />
          <Flex mt="xl" wrap="wrap" gap="xs" align="center" justify="flex-end">
            <Button
              color="green"
              onClick={() =>
                confirmationModal(
                  "approve",
                  `${selectedRequest.request_title}`,
                  handleApprove
                )
              }
              fullWidth={view === "split"}
              w={view === "full" ? 200 : ""}
              size={view === "full" ? "md" : "sm"}
            >
              Approve
            </Button>
            {/* <Button
              color="dark"
              onClick={() => handleSendToRevision()}
              fullWidth={view === "split"}
            >
              Send For Revision
            </Button> */}
            <Button
              color="red"
              onClick={() =>
                confirmationModal(
                  "reject",
                  `${selectedRequest.request_title}`,
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

      {isOwner ? (
        <>
          <Divider mt="xl" />{" "}
          <Flex mt="xl" wrap="wrap" gap="xs" align="center" justify="flex-end">
            <Button
              color="dark"
              onClick={() =>
                confirmationModal(
                  "delete",
                  `${selectedRequest.request_title}`,
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

      {isPurchaser ? (
        <>
          <Divider mt="xl" />{" "}
          <Flex mt="xl" wrap="wrap" gap="xs" align="center" justify="flex-end">
            <Button
              onClick={() =>
                confirmationModal(
                  "mark as purchased",
                  `${selectedRequest.request_title}`,
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
      {selectedRequestFields?.map((field) => {
        const fieldType = field.field.field_type;
        const fieldLabel = field.field.field_name;
        const fieldResponse = `${field.response_value}`;
        const fieldOptions = field.field.field_option;

        if (fieldType === "text" || fieldType === "email") {
          return (
            <Box key={field.field_id} py="sm">
              {renderTooltip(
                <TextInput
                  label={fieldLabel}
                  withAsterisk={Boolean(field.field.is_required)}
                  value={`${field.response_value}`}
                  readOnly
                />,
                `${field.field.field_tooltip}`
              )}
            </Box>
          );
        } else if (fieldType === "number") {
          return (
            <Box key={field.field_id} py="sm">
              {renderTooltip(
                <NumberInput
                  label={fieldLabel}
                  withAsterisk={Boolean(field.field.is_required)}
                  value={Number(fieldResponse)}
                  readOnly
                />,
                `${field.field.field_tooltip}`
              )}
            </Box>
          );
        } else if (fieldType === "date") {
          return (
            <Box key={field.field_id} py="sm">
              {renderTooltip(
                <DatePicker
                  label={fieldLabel}
                  withAsterisk={Boolean(field.field.is_required)}
                  placeholder={"Choose date"}
                  value={new Date(fieldResponse)}
                  readOnly
                />,
                `${field.field.field_tooltip}`
              )}
            </Box>
          );
        } else if (fieldType === "daterange") {
          return (
            <Box key={field.field_id} py="sm">
              {renderTooltip(
                <DateRangePicker
                  label={fieldLabel}
                  withAsterisk={Boolean(field.field.is_required)}
                  placeholder={"Choose a date range"}
                  value={[
                    new Date(fieldResponse.split(",")[0]),
                    new Date(fieldResponse.split(",")[1]),
                  ]}
                  readOnly
                />,
                `${field.field.field_tooltip}`
              )}
            </Box>
          );
        } else if (fieldType === "time") {
          return (
            <Box key={field.field_id} py="sm">
              {renderTooltip(
                <TimeInput
                  label={fieldLabel}
                  withAsterisk={Boolean(field.field.is_required)}
                  placeholder={"Choose time"}
                  format="12"
                  value={new Date(fieldResponse)}
                />,
                `${field.field.field_tooltip}`
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
                `${field.field.field_tooltip}`
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
              withAsterisk={Boolean(field.field.is_required)}
              placeholder={"Choose multiple"}
              value={fieldResponse.split(",")}
              py="sm"
            />,
            `${field.field.field_tooltip}`
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
              withAsterisk={Boolean(field.field.is_required)}
              placeholder={"Choose one"}
              value={fieldResponse}
              py="sm"
            />,
            `${field.field.field_tooltip}`
          );
        }
      })}

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
        {commentList.map((comment) => (
          <Paper shadow="sm" key={comment.request_comment_id} p="xl" withBorder>
            <Flex gap="xs" wrap="wrap" align="center">
              <Avatar radius={100} src={comment.owner.avatar_url} size="sm" />
              <Text fw={500}>{comment.owner.full_name}</Text>
              {comment.request_comment_is_edited ? (
                <Text c="dimmed">(edited)</Text>
              ) : null}
              <Text c="dimmed">
                {setTimeDifference(
                  new Date(`${comment.request_comment_created_at}`)
                )}
              </Text>
              {comment.request_comment_by_id === user?.id ? (
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
                          setNewComment(`${comment.request_comment}`);
                          setEditCommentId(comment.request_comment_id);
                        }}
                      >
                        Edit
                      </Button>
                      <Divider orientation="vertical" />
                      <Button
                        radius={0}
                        variant="subtle"
                        onClick={() =>
                          handleDeleteComment(comment.request_comment_id)
                        }
                      >
                        Delete
                      </Button>
                    </Flex>
                  </Popover.Dropdown>
                </Popover>
              ) : null}
            </Flex>
            {comment.request_comment_id === editCommentId ? (
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
            {comment.request_comment_id !== editCommentId ? (
              <Text mt="xs">{comment.request_comment}</Text>
            ) : null}
          </Paper>
        ))}
      </Stack>
    </Container>
  );
};

export default Request;
