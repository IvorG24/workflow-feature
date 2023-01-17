import FileUrlListContext from "@/contexts/FileUrlListContext";
import useFetchRequestCommentList from "@/hooks/useFetchRequestCommentList";
import { editComment } from "@/utils/queries";
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
  Flex,
  Group,
  Menu,
  Paper,
  Text,
  Textarea,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons";
import { useContext, useState } from "react";

type Props = {
  requestId: number;
};

const RequestComment = ({ requestId }: Props) => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const fileUrlListContext = useContext(FileUrlListContext);
  const [comment, setComment] = useState("");
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const {
    requestCommentList: commentList,
    setRequestCommentList: setCommentList,
  } = useFetchRequestCommentList(requestId);

  const handleAddComment = async () => {
    if (!comment) return;
    try {
      // replace with correct comment attachment
      const commentAttachment = "";
      const createdComment = await createRequestComment(
        supabaseClient,
        comment,
        user?.id as string,
        requestId as number,
        commentAttachment
      );
      setComment("");
      setCommentList((prev) => {
        return [
          ...(prev as GetRequestCommentList),
          createdComment as GetRequestCommentList[0],
        ];
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

  const handleEditComment = async () => {
    try {
      if (!newComment) return;
      if (!editComment) return;
      // replace with correct comment attachment path
      const commentAttachmentPath = "";
      const updatedComment = await updateRequestComment(
        supabaseClient,
        newComment,
        editCommentId as number,
        commentAttachmentPath
      );

      const newCommentList = (commentList as GetRequestCommentList).map(
        (comment) =>
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
          <Paper bg="#f8f8f8" px="xs" pb="xs">
            <Textarea
              placeholder="Type your comment here"
              variant="unstyled"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Group position="right" mt="xs">
              <Button
                onClick={handleAddComment}
                data-cy="request-submit-comment"
              >
                Send
              </Button>
            </Group>
          </Paper>
          {commentList && commentList.length > 0 && (
            <>
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
                            setEditCommentId(comment.comment_id);
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
                    {comment.comment_id === editCommentId ? (
                      <Paper bg="#f8f8f8" px="xs" pb="xs" w="100%">
                        <Textarea
                          placeholder="Type your comment here"
                          variant="unstyled"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                        <Group position="right" mt="xs" spacing={5}>
                          <Button
                            onClick={() => {
                              setEditCommentId(null);
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
                        <Text>{comment.comment_content}</Text>
                      </>
                    )}
                  </Flex>
                </Box>
              ))}
            </>
          )}
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default RequestComment;
