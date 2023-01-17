import CurrentUserProfileContext from "@/contexts/CurrentUserProfileContext";
import FileUrlListContext from "@/contexts/FileUrlListContext";
import useFetchRequestCommentList from "@/hooks/useFetchRequestCommentList";
import { deleteFile, getFileUrl, uploadFile } from "@/utils/file";
import {
  createRequestComment,
  deleteRequestComment,
  GetRequestCommentList,
  updateRequestComment,
} from "@/utils/queries-new";
import { setTimeDifference } from "@/utils/request";
import {
  Accordion,
  ActionIcon,
  Avatar,
  Box,
  Button,
  Divider,
  FileInput,
  Flex,
  Group,
  LoadingOverlay,
  Menu,
  Paper,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { FileIcon, Upload } from "../Icon";
import IconWrapper from "../IconWrapper/IconWrapper";

type Props = {
  requestId: number;
};

const RequestComment = ({ requestId }: Props) => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const currentUser = useContext(CurrentUserProfileContext);
  const fileUrlListContext = useContext(FileUrlListContext);
  const [comment, setComment] = useState("");
  const [newComment, setNewComment] = useState("");
  const [commentAttachment, setCommentAttachment] = useState<File | null>(null);
  const [editComment, setEditComment] = useState<
    GetRequestCommentList[0] | null
  >(null);
  const [editCommentAttachment, setEditCommentAttachment] =
    useState<File | null>(null);
  const [isEditCommentAttachmentChanged, setIsEditCommentAttachmentChanged] =
    useState(false);
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [isEditCommentLoading, setIsEditCommentLoading] = useState(false);
  const {
    requestCommentList: commentList,
    setRequestCommentList: setCommentList,
  } = useFetchRequestCommentList(requestId);

  useEffect(() => {
    setIsCommentLoading(true);
    const downloadAttachment = async () => {
      try {
        setEditCommentAttachment(null);
        setIsEditCommentAttachmentChanged(false);
        if (editComment?.comment_attachment_url) {
          axios
            .get(editComment?.comment_attachment_url, {
              responseType: "blob",
            })
            .then((response) => {
              setEditCommentAttachment({
                ...response.data,
                name: editComment.comment_attachment_filepath,
              });
            });
        }
      } catch {
        showNotification({
          title: "Error!",
          message: "Failed to fetch comment attachment",
          color: "red",
        });
      }
    };
    downloadAttachment();
    setIsCommentLoading(false);
  }, [editComment]);

  const handleAddComment = async () => {
    if (!comment && !commentAttachment) return;
    setIsCommentLoading(true);
    try {
      let attachmentPath = "";
      if (commentAttachment) {
        const file = await uploadFile(
          supabaseClient,
          commentAttachment?.name,
          commentAttachment,
          "comment_attachments"
        );
        attachmentPath = file.path;
      }
      const createdComment = await createRequestComment(
        supabaseClient,
        comment,
        user?.id as string,
        requestId as number,
        attachmentPath
      );

      setComment("");
      setCommentAttachment(null);

      let commentAttachmentUrl = "";
      if (attachmentPath) {
        commentAttachmentUrl = await getFileUrl(
          supabaseClient,
          attachmentPath,
          "comment_attachments"
        );
      }
      setCommentList((prev) => {
        const editCommentList = [...(prev as GetRequestCommentList)];
        editCommentList.push({
          ...(createdComment as GetRequestCommentList[0]),
          username: currentUser?.username || "",
          comment_attachment_filepath: attachmentPath,
          comment_attachment_url: commentAttachmentUrl,
          user_id: currentUser?.user_id || "",
        });
        return editCommentList;
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
    setIsCommentLoading(false);
  };

  const handleEditComment = async () => {
    try {
      if (!editComment && !editCommentAttachment) return;
      if (!editComment) return;
      if (
        editComment?.comment_content === newComment &&
        !isEditCommentAttachmentChanged
      ) {
        setEditComment(null);
        setNewComment("");
        return;
      }

      setIsEditCommentLoading(true);

      if (editComment?.comment_attachment_filepath) {
        await deleteFile(
          supabaseClient,
          `${editComment.comment_attachment_filepath}`,
          "comment_attachments"
        );
      }

      let commentAttachmentPath = "";
      if (editCommentAttachment) {
        const file = await uploadFile(
          supabaseClient,
          editCommentAttachment?.name,
          editCommentAttachment,
          "comment_attachments"
        );
        commentAttachmentPath = file.path;
      }

      const updatedComment = await updateRequestComment(
        supabaseClient,
        newComment,
        editComment?.comment_id as number,
        commentAttachmentPath
      );

      let commentAttachmentUrl = "";
      if (commentAttachmentPath) {
        commentAttachmentUrl = await getFileUrl(
          supabaseClient,
          commentAttachmentPath,
          "comment_attachments"
        );
      }

      const editCommentList = (commentList as GetRequestCommentList).map(
        (comment) =>
          comment.comment_id === updatedComment?.comment_id
            ? {
                ...updatedComment,
                username: currentUser ? currentUser.username : "",
                comment_attachment_filepath: commentAttachmentPath,
                comment_attachment_url: commentAttachmentUrl,
                user_id: currentUser ? currentUser?.user_id : "",
              }
            : comment
      );

      setCommentList(() => editCommentList as GetRequestCommentList);

      setEditComment(null);
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
    setIsEditCommentLoading(false);
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteRequestComment(supabaseClient, commentId);

      setCommentList((prev) =>
        (prev as GetRequestCommentList).filter(
          (comment) => comment.comment_id !== commentId
        )
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

  const confirmationModal = (
    action: string,
    description: string,
    confirmFunction: () => Promise<void>
  ) =>
    openConfirmModal({
      title: "Please confirm your action",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to {action} {description}
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => confirmFunction(),
    });

  return (
    <Accordion variant="separated">
      <Accordion.Item value="comments">
        <Accordion.Control>
          <Text fz="sm" fw={500}>
            Show Comments
          </Text>
        </Accordion.Control>
        <Accordion.Panel p={0}>
          <Paper bg="#f8f8f8" px="xs" pb="xs" sx={{ position: "relative" }}>
            <LoadingOverlay visible={isCommentLoading} />
            <Textarea
              placeholder="Type your comment here"
              variant="unstyled"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Group position="right" mt="xs">
              <FileInput
                placeholder="Add Attachment"
                withAsterisk
                value={commentAttachment}
                onChange={(value) => setCommentAttachment(value)}
                icon={
                  <IconWrapper size={14}>
                    <Upload />
                  </IconWrapper>
                }
              />
              <Button
                onClick={handleAddComment}
                data-cy="request-submit-comment"
              >
                Send
              </Button>
            </Group>
          </Paper>
          {commentList && commentList.length > 0 && (
            <Box>
              <Text my="xs">Comments</Text>
              {commentList.map((comment) => (
                <Box bg="white" key={comment.comment_id}>
                  <Group position="apart">
                    <Flex gap={5} align="center">
                      <Avatar
                        src={
                          fileUrlListContext?.avatarUrlList[
                            comment.user_request_comment_user_id as string
                          ]
                        }
                        radius="xl"
                      />
                      <Text fw={500}>{comment.username}</Text>
                      <Text fz="xs" c="dimmed">
                        {setTimeDifference(
                          new Date(`${comment.comment_date_created}`)
                        )}
                      </Text>
                    </Flex>
                    <Menu position="left" withArrow>
                      <Menu.Target>
                        <ActionIcon c="dimmed" sx={{ cursor: "pointer" }}>
                          <IconDotsVertical size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          icon={<IconEdit size={16} />}
                          onClick={() => {
                            setNewComment(`${comment.comment_content}`);
                            setEditComment(comment);
                          }}
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          icon={<IconTrash size={16} />}
                          onClick={() =>
                            confirmationModal("delete", "this comment?", () =>
                              handleDeleteComment(comment.comment_id as number)
                            )
                          }
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                  <Flex p="sm" px="md" gap={10}>
                    {comment.comment_id === editComment?.comment_id ? (
                      <Paper
                        bg="#f8f8f8"
                        px="xs"
                        pb="xs"
                        w="100%"
                        sx={{ position: "relative" }}
                      >
                        <LoadingOverlay visible={isEditCommentLoading} />
                        <Textarea
                          placeholder="Type your comment here"
                          variant="unstyled"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                        <FileInput
                          w={200}
                          placeholder="Add Attachment"
                          withAsterisk
                          value={editCommentAttachment}
                          onChange={(value) => {
                            setIsEditCommentAttachmentChanged(true);
                            setEditCommentAttachment(value);
                          }}
                          icon={
                            <IconWrapper size={14}>
                              <Upload />
                            </IconWrapper>
                          }
                        />
                        <Group position="right" mt="xs" spacing={5}>
                          <Button
                            onClick={() => {
                              setEditComment(null);
                              setNewComment("");
                            }}
                            variant="default"
                            size="xs"
                            w={80}
                            data-cy="request-submit-comment"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleEditComment}
                            data-cy="request-submit-comment"
                            size="xs"
                            w={80}
                          >
                            Save
                          </Button>
                        </Group>
                      </Paper>
                    ) : (
                      <>
                        <Divider orientation="vertical" />
                        <Stack>
                          <Text>{comment.comment_content}</Text>
                          {comment.comment_attachment_filepath &&
                          comment.comment_id !== editComment?.comment_id ? (
                            <a
                              href={comment.comment_attachment_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Button
                                mt="xs"
                                variant="outline"
                                w={200}
                                leftIcon={
                                  <IconWrapper size={14}>
                                    <FileIcon />
                                  </IconWrapper>
                                }
                              >
                                <Text c="green" lineClamp={1}>
                                  {comment.comment_attachment_filepath}
                                </Text>
                              </Button>
                            </a>
                          ) : null}
                        </Stack>
                      </>
                    )}
                  </Flex>
                </Box>
              ))}
            </Box>
          )}
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default RequestComment;
