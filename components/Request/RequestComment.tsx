import FileUrlListContext from "@/contexts/FileUrlListContext";
import useFetchRequestCommentList from "@/hooks/useFetchRequestCommentList";
import {
  createRequestComment,
  GetRequestCommentList,
} from "@/utils/queries-new";
import { setTimeDifference } from "@/utils/request";
import {
  Accordion,
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Paper,
  Text,
  Textarea,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useContext, useState } from "react";

type Props = {
  requestId: number;
};

const RequestComment = ({ requestId }: Props) => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const fileUrlListContext = useContext(FileUrlListContext);
  const [comment, setComment] = useState("");
  // const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const {
    requestCommentList: commentList,
    setRequestCommentList: setCommentList,
  } = useFetchRequestCommentList(requestId);

  const handleAddComment = async () => {
    if (!comment) return;
    try {
      const createdComment = await createRequestComment(
        supabaseClient,
        comment,
        user?.id as string,
        requestId as number
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
                    </Flex>
                    <Text fz="xs" c="dimmed">
                      {setTimeDifference(
                        new Date(`${comment.comment_date_created}`)
                      )}
                    </Text>
                  </Group>
                  <Flex p="sm" px="md" gap={10}>
                    <Divider orientation="vertical" />
                    <Text>{comment.comment_content}</Text>
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
