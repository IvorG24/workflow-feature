import { Close, Dots, Maximize } from "@/components/Icon";
import {
  createComment,
  deleteComment,
  editComment,
  retrieveRequestComments,
} from "@/utils/queries";
import {
  renderTooltip,
  setBadgeColor,
  setTimeDifference,
} from "@/utils/request";
import type {
  Database,
  Marks,
  RequestCommentTableRow,
  RequestFields,
  RequestType,
  UserProfileTableRow,
} from "@/utils/types";
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
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { DatePicker, DateRangePicker, TimeInput } from "@mantine/dates";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { startCase } from "lodash";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import styles from "./RequestTable.module.scss";

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

type RetrievedRequestComments = RequestCommentTableRow & {
  owner: UserProfileTableRow;
};

type Props = {
  requestList: RequestType[];
  selectedRequest: RequestType | null;
  setSelectedRequest: Dispatch<SetStateAction<RequestType | null>>;
  isApprover: boolean;
  handleApprove: () => void;
  // handleSendToRevision: () => void;
  handleReject: () => void;
  handleDelete: () => void;
  confirmationModal: (
    action: string,
    requestTitle: string,
    confirmFunction: () => void
  ) => void;
};

const RequestTable = ({
  requestList,
  selectedRequest,
  setSelectedRequest,
  isApprover,
  handleApprove,
  // handleSendToRevision,
  handleReject,
  handleDelete,
  confirmationModal,
}: Props) => {
  const { width } = useViewportSize();
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

  useEffect(() => {
    const fetchComments = async () => {
      const commentList = await retrieveRequestComments(
        supabase,
        Number(selectedRequest?.request_id)
      );
      setCommentList(commentList);
    };
    fetchComments();
  }, [supabase, selectedRequest]);

  const handleSetSelectedRequest = async (request: RequestType) => {
    if (width < 1200) {
      router.push(`/t/${router.query.tid}/requests/${request.request_id}`);
    } else {
      try {
        const { data: requestFields, error: requestFieldsError } =
          await supabase
            .from("request_response_table")
            .select("*, field: field_id(*)")
            .eq("request_id", request.request_id);

        if (requestFieldsError) throw requestFieldsError;

        setSelectedRequest(request);
        setSelectedRequestFields(requestFields as unknown as RequestFields[]);
      } catch {
        showNotification({
          title: "Error!",
          message: "Failed to fetch Request",
          color: "red",
        });
      }
    }
  };

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

  const rows = requestList.map((request) => {
    return (
      <tr
        key={request.request_id}
        className={styles.row}
        onClick={() => handleSetSelectedRequest(request)}
      >
        <td>{request.request_id}</td>
        <td>{request.request_title}</td>
        <td>
          <Badge color={setBadgeColor(`${request.request_status}`)}>
            {startCase(`${request.request_status}`)}
          </Badge>
        </td>
        <td>{request.request_created_at?.slice(0, 10)}</td>
        <td>
          <Group>
            <Avatar radius={100} />
            {request.owner.full_name}
          </Group>
        </td>
        <td>
          <Group>
            <Avatar radius={100} />
            {request.approver.full_name}
          </Group>
        </td>
      </tr>
    );
  });

  return (
    <Group align="flex-start">
      <Table mt="xl" striped highlightOnHover className={styles.tableContainer}>
        <thead>
          <tr>
            <th>REF</th>
            <th>Request Title</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th>Requested By</th>
            <th>Approvers</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
      {/* todo: convert into a component and move outside request table*/}
      {selectedRequest ? (
        <Paper shadow="xl" className={styles.requestContainer}>
          <Container m={0} p={0} className={styles.closeIcon}>
            <Group spacing={0}>
              <ActionIcon
                onClick={() =>
                  router.push(
                    `/t/${router.query.tid}/requests/${selectedRequest.request_id}`
                  )
                }
              >
                <Maximize />
              </ActionIcon>
              <ActionIcon onClick={() => setSelectedRequest(null)}>
                <Close />
              </ActionIcon>
            </Group>
          </Container>
          <Group position="apart" grow>
            <Stack align="flex-start">
              <Title order={5}>Request Title</Title>
              <Text>{selectedRequest.request_title}</Text>
            </Stack>
            <Stack align="flex-start">
              <Title order={5}>Requested By</Title>
              <Group>
                <Avatar radius={100} />
                <Text>{selectedRequest.owner.full_name}</Text>
              </Group>
            </Stack>
          </Group>
          <Group mt="xl" position="apart" grow>
            <Stack align="flex-start">
              <Title order={5}>Date Created</Title>
              <Text>{selectedRequest.request_created_at?.slice(0, 10)}</Text>
            </Stack>
            <Stack align="flex-start">
              <Title order={5}>Status</Title>
              <Badge color={setBadgeColor(`${selectedRequest.request_status}`)}>
                {startCase(`${selectedRequest.request_status}`)}
              </Badge>
            </Stack>
          </Group>
          <Stack mt="xl" align="flex-start">
            <Title order={5}>Request Description</Title>
            <Text>{selectedRequest.request_description}</Text>
          </Stack>
          <Divider mt="xl" />
          <Stack mt="xl">
            <Title order={5}>Approver</Title>
            <Group align="apart" grow>
              <Group>
                <Badge
                  color={setBadgeColor(`${selectedRequest.request_status}`)}
                />
                <Text>{selectedRequest.approver.full_name}</Text>
              </Group>
            </Group>
          </Stack>
          <Divider mt="xl" />
          <Stack mt="xl">
            <Title order={5}>Attachment</Title>
            {!selectedRequest.attachments && <Text>---</Text>}
            {selectedRequest.attachments &&
              selectedRequest.attachments.length === 0 && <Text>---</Text>}
            {selectedRequest.attachments &&
              selectedRequest.attachments.map((attachmentUrl) => {
                console.log(attachmentUrl);
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
              <Stack mt="xl">
                <Button
                  color="green"
                  onClick={() =>
                    confirmationModal(
                      "approve",
                      `${selectedRequest.request_title}`,
                      handleApprove
                    )
                  }
                >
                  Approve
                </Button>
                {/* <Button
                  color="dark"
                  onClick={() =>
                    confirmationModal(
                      "revise",
                      `${selectedRequest.request_title}`,
                      handleSendToRevision
                    )
                  }
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
                >
                  Reject
                </Button>
              </Stack>
            </>
          ) : null}

          {selectedRequest.owner.user_id === user?.id &&
          (selectedRequest.request_status === "pending" ||
            selectedRequest.request_status === "stale") ? (
            <>
              <Divider mt="xl" />
              <Stack mt="xl">
                <Button
                  color="dark"
                  onClick={() =>
                    confirmationModal(
                      "delete",
                      `${selectedRequest.request_title}`,
                      handleDelete
                    )
                  }
                >
                  Delete
                </Button>
              </Stack>
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
              <Paper
                shadow="sm"
                key={comment.request_comment_id}
                p="xl"
                withBorder
              >
                <Flex gap="xs" wrap="wrap" align="center">
                  <Avatar
                    radius={100}
                    src={comment.owner.avatar_url}
                    size="sm"
                  />
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
        </Paper>
      ) : null}
    </Group>
  );
};

export default RequestTable;
