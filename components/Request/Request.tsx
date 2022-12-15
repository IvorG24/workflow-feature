// todo: create unit test
import {
  getFileUrl,
  createComment,
  deleteComment,
  editComment,
  requestResponse,
  RetrievedRequestComments,
  retrieveRequest,
  retrieveRequestComments,
  retrieveRequestResponse,
} from "@/utils/queries";
import { renderTooltip, setBadgeColor, setTimeDifference } from "@/utils/request";
import type {
  Database,
  Marks,
  RequestFields,
  RequestType,
} from "@/utils/types";
import {
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
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { startCase } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Dots } from "../Icon";
import styles from "./Request.module.scss";

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

const Request = () => {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const user = useUser();
  const [isFetchingRequest, setIsFetchingRequest] = useState(true);
  const [request, setRequest] = useState<RequestType | null>(null);
  const [requiredFields, setRequiredFields] = useState({
    approval_status: "",
    request_title: "",
    request_description: "",
    on_behalf_of: "",
    requestedBy: "",
    approverName: "",
    approverId: "",
    created_at: "",
    attachmentUrlList: [""],
  });
  const [requestFields, setRequestFields] = useState<RequestFields[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [commentList, setCommentList] = useState<RetrievedRequestComments[]>(
    []
  );
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    setIsFetchingRequest(true);

    const fetchRequest = async () => {
      try {
        const retrievedRequest = await retrieveRequest(
          supabase,
          Number(router.query.id)
        );
        const requestFields = await retrieveRequestResponse(
          supabase,
          Number(router.query.id)
        );

        setRequest(retrievedRequest);

        const attachmentList = retrievedRequest?.attachments
          ? (retrievedRequest.attachments as never[])
          : [];

        const promises = attachmentList.map((attachment) => {
          return getFileUrl(supabase, attachment, "request_attachments");
        });

        const attachmentUrlList = await Promise.all(promises);

        setRequiredFields({
          approval_status: `${retrievedRequest.request_status}`,
          request_title: `${retrievedRequest.request_title}`,
          request_description: `${retrievedRequest.request_description}`,
          on_behalf_of: `${retrievedRequest.on_behalf_of}`,
          requestedBy: `${retrievedRequest.owner.full_name}`,
          approverName: `${retrievedRequest.approver.full_name}`,
          created_at: `${retrievedRequest.request_created_at}`,
          approverId: `${retrievedRequest.approver_id}`,
          attachmentUrlList,
        });
        setRequestFields(requestFields);
        setIsFetchingRequest(false);
      } catch {
        showNotification({
          title: "Error!",
          message: "Failed to fetch Request",
          color: "red",
        });
      }
    };

    const fetchComments = async () => {
      const commentList = await retrieveRequestComments(
        supabase,
        Number(router.query.id)
      );
      setCommentList(commentList);
    };

    fetchComments();
    fetchRequest();
  }, [supabase, router]);

  let isApprover = false;
  if (request) {
    if (
      (requiredFields.approval_status === "stale" ||
        requiredFields.approval_status === "pending") &&
      requiredFields.approverId === user?.id
    ) {
      isApprover = true;
    }
  }

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      await requestResponse(supabase, Number(router.query.id), "approved");

      showNotification({
        title: "Success!",
        message: `You approved ${requiredFields?.request_title}`,
        color: "green",
      });
      router.push(`/t/${router.query.tid}/requests`);
    } catch {
      showNotification({
        title: "Error!",
        message: `Failed to approve ${requiredFields?.request_title}`,
        color: "red",
      });
      setIsLoading(false);
    }
  };

  const handleSendToRevision = async () => {
    try {
      setIsLoading(true);
      await requestResponse(supabase, Number(router.query.id), "revision");

      showNotification({
        title: "Success!",
        message: `${requiredFields?.request_title} is sent to Revision`,
        color: "green",
      });
      router.push("/requests");
    } catch {
      showNotification({
        title: "Error!",
        message: `${requiredFields?.request_title} has failed to send to revision`,
        color: "red",
      });

      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsLoading(true);
      await requestResponse(supabase, Number(router.query.id), "rejected");

      showNotification({
        title: "Success!",
        message: `You rejected ${requiredFields?.request_title}`,
        color: "green",
      });
      router.push("/requests");
    } catch {
      showNotification({
        title: "Error!",
        message: `Failed to reject ${requiredFields?.request_title}`,
        color: "red",
      });

      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment) return;

    try {
      const createdComment = await createComment(
        supabase,
        Number(router.query.id),
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

  return (
    <Container px={8} py={16} fluid>
      <LoadingOverlay
        visible={isLoading || isFetchingRequest}
        overlayBlur={2}
      />

      <Stack>
        <Flex
          direction="row"
          justify="space-between"
          align="stretch"
          wrap="wrap"
          gap="xl"
        >
          <Stack className={styles.flex} mt={16}>
            <Title order={4}>Request Title</Title>
            <Text>{requiredFields.request_title}</Text>
          </Stack>
          <Stack className={styles.flex} mt={16}>
            <Title order={4}>Request By</Title>
            <Group>
              <Avatar radius={100} />
              <Text>{requiredFields.requestedBy}</Text>
            </Group>
          </Stack>
          <Stack className={styles.flex} mt={16}>
            <Title order={4}>Date Created</Title>
            <Text>{requiredFields.created_at?.slice(0, 10)}</Text>
          </Stack>
          <Stack className={styles.flex} mt={16}>
            <Title order={4}>Status</Title>
            <Badge color={setBadgeColor(`${requiredFields.approval_status}`)}>
              {startCase(`${requiredFields.approval_status}`)}
            </Badge>
          </Stack>
        </Flex>
        <Flex
          direction="row"
          justify="space-between"
          align="stretch"
          wrap="wrap"
          gap="xl"
          mt="lg"
        >
          <Stack className={styles.flex} mt={16}>
            <Title order={4}> Request Description</Title>
            <Text>{requiredFields.request_description}</Text>
          </Stack>

          <Stack className={styles.flex} mt={16}>
            <Title order={4}>On Behalf Of</Title>
            <Text>{requiredFields.on_behalf_of}</Text>
          </Stack>
        </Flex>

        <Divider mt="xl" />

        <Stack mt="xl">
          <Title order={5}>Approver</Title>
          <Group align="apart">
            <Badge color={setBadgeColor(`${requiredFields.approval_status}`)} />
            <Text>{requiredFields.approverName}</Text>
          </Group>
        </Stack>

        <Divider mt="xl" />

        <Stack mt="xl">
          <Title order={5}>Attachment</Title>
          {requiredFields.attachmentUrlList.length === 0 && <Text>---</Text>}
          {requiredFields.attachmentUrlList.map((attachmentUrl) => {
            return (
              // ! URL.createObjectURL does not work on Mantine Image component.
              // <Image
              //   fit="contain"
              //   width={200}
              //   height={80}
              //   src={attachmentUrl.path}
              // />
              // * URL.createObjectURL works on Mantine Avatar component and HTML image tag only.
              // <Avatar src={attachmentUrl} alt="Attachment Image" />
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

          <Divider mt="xl" />
          <Title mt="xl" order={5}>
            Request Fields
          </Title>

          {isApprover ? (
            <Group mt="xl" position="right">
              <Button color="green" onClick={() => handleApprove()} size="md">
                Approve
              </Button>
              <Button
                color="dark"
                onClick={() => handleSendToRevision()}
                size="md"
              >
                Send to Revision
              </Button>
              <Button color="red" onClick={() => handleReject()} size="md">
                Reject
              </Button>
            </Group>
          ) : null}
        </Stack>
        {requestFields?.map((field) => {
          const fieldType = field.field.field_type;
          const fieldLabel = field.field.field_name;
          const fieldResponse = `${field.response_value}`;
          const fieldOptions = field.field.field_option;

          if (fieldType === "text" || fieldType === "email") {
            return (
              <Box key={field.field_id}>
                {renderTooltip(
                  <TextInput
                    label={fieldLabel}
                    withAsterisk={Boolean(field.field.is_required)}
                    value={fieldResponse}
                  />,
                  `${field.field.field_tooltip}`
                )}
              </Box>
            );
          } else if (fieldType === "number") {
            return (
              <Box key={field.field_id}>
                {renderTooltip(
                  <NumberInput
                    label={fieldLabel}
                    withAsterisk={Boolean(field.field.is_required)}
                    value={Number(fieldResponse)}
                  />,
                  `${field.field.field_tooltip}`
                )}
              </Box>
            );
          } else if (fieldType === "date") {
            return (
              <Box key={field.field_id}>
                {renderTooltip(
                  <DatePicker
                    label={fieldLabel}
                    withAsterisk={Boolean(field.field.is_required)}
                    placeholder={"Choose date"}
                    value={new Date(fieldResponse)}
                  />,
                  `${field.field.field_tooltip}`
                )}
              </Box>
            );
          } else if (fieldType === "daterange") {
            return (
              <Box key={field.field_id}>
                {renderTooltip(
                  <DateRangePicker
                    label={fieldLabel}
                    withAsterisk={Boolean(field.field.is_required)}
                    placeholder={"Choose a date range"}
                    value={[
                      new Date(fieldResponse.split(",")[0]),
                      new Date(fieldResponse.split(",")[1]),
                    ]}
                  />,
                  `${field.field.field_tooltip}`
                )}
              </Box>
            );
          } else if (fieldType === "time") {
            return (
              <Box key={field.field_id}>
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
              <Box my="md" key={field.field_id}>
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
      </Stack>
    </Container>
  );
};

export default Request;
