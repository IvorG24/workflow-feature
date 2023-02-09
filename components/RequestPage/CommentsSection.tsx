import {
  addComment,
  deleteComment,
  editComment,
  GetCommentList,
  getCommentList,
} from "@/utils/queries";
import {
  ActionIcon,
  Button,
  Container,
  createStyles,
  Group,
  Loader,
  Menu,
  Text,
  Textarea,
  ThemeIcon,
  Timeline,
} from "@mantine/core";
import moment from "moment";

import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import {
  IconCircleCheck,
  IconCircleDashed,
  IconCircleMinus,
  IconDots,
  IconQuote,
} from "@tabler/icons";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";

const useStyles = createStyles((theme) => ({
  container: {
    // add subtle background and border design.
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    maxWidth: theme.breakpoints.sm,
  },
}));

export type CommentsSectionProps = {
  isFetchingCommentList: boolean;
  setIsFetchingCommentList: Dispatch<SetStateAction<boolean>>;
  commentList: GetCommentList;
  setCommentList: Dispatch<SetStateAction<GetCommentList>>;
};

export default function CommentsSection({
  isFetchingCommentList,
  setIsFetchingCommentList,
  commentList,
  setCommentList,
}: CommentsSectionProps) {
  const { classes } = useStyles();
  const user = useUser();
  const userId = user?.id;
  const [newComment, setNewComment] = useState("");
  const [editedComment, setEditedComment] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  // const [isFetchingCommentList, setIsFetchingCommentList] = useState(true);
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const requestId = router.query.requestId
    ? Number(router.query.requestId)
    : null;
  // const [commentList, setCommentList] = useState<GetCommentList>([]);
  const [isEditingCommentIndex, setIsEditingCommentIndex] = useState(-1);
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);

  const handleAddComment = async (
    requestId: number,
    comment: string,
    userId: string
  ) => {
    try {
      setIsUpdatingComment(true);

      if (!requestId) throw new Error("requestId is null");
      if (!userId) throw new Error("userId is null");
      if (!comment) throw new Error("comment is null");

      await addComment(
        supabaseClient,
        requestId,
        userId,
        comment,
        "comment",
        null
      );

      const commentList = await getCommentList(supabaseClient, requestId);
      setNewComment("");
      setCommentList(commentList);
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsUpdatingComment(false);
    }
  };
  const handleDeleteComment = async (requestId: number, commentId: number) => {
    try {
      setIsUpdatingComment(true);

      await deleteComment(supabaseClient, commentId);

      const commentList = await getCommentList(supabaseClient, requestId);

      setCommentList(commentList);
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsUpdatingComment(false);
    }
  };

  const handleEditComment = async (
    requestId: number,
    commentId: number,
    comment: string
  ) => {
    try {
      setIsUpdatingComment(true);

      await editComment(supabaseClient, commentId, comment);

      const commentList = await getCommentList(supabaseClient, requestId);

      setIsEditingCommentIndex(-1);

      setCommentList(commentList);
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsUpdatingComment(false);
    }
  };

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       setIsFetchingCommentList(true);
  //       if (!requestId) throw new Error("requestId is null");
  //       const commentList = await getCommentList(supabaseClient, requestId);

  //       setCommentList(commentList);
  //     } catch (error) {
  //       console.error(error);
  //       showNotification({
  //         title: "Error",
  //         message: "Something went wrong. Please try again later.",
  //         color: "red",
  //       });
  //     } finally {
  //       setIsFetchingCommentList(false);
  //     }
  //   })();
  // }, []);

  return (
    <Container
      className={classes.container}
      style={{ border: "1px solid #ccc", boxShadow: "2px 2px 5px #ccc" }}
    >
      {isFetchingCommentList && (
        <Group noWrap position="center">
          <Loader />
        </Group>
      )}

      {!isFetchingCommentList && (
        <>
          <Timeline>
            {commentList.map((comment, index) => {
              const date = moment(comment.comment_date_created);
              const formattedDate = date.format("MMM D, YYYY");

              if (comment.comment_type_id === "comment") {
                return (
                  <Timeline.Item
                    key={comment.comment_id}
                    //   title="Icon"
                    bulletSize={24}
                    bullet={<IconQuote size={14} />}
                  >
                    <Group noWrap position="apart">
                      <Text color="dimmed" size="sm">
                        <b>{comment.username}</b> commented on{" "}
                        <b>{formattedDate}</b>
                      </Text>
                      <Menu shadow="md" position="bottom-end">
                        <Menu.Target>
                          <ActionIcon size="xs">
                            <IconDots size={18} stroke={1.5} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Item
                            onClick={() => {
                              setIsEditingCommentIndex(index);
                              setEditedComment(
                                comment.comment_content as string
                              );
                            }}
                          >
                            Edit comment
                          </Menu.Item>
                          <Menu.Item
                            onClick={() =>
                              handleDeleteComment(
                                comment.request_id as number,
                                comment.comment_id as number
                              )
                            }
                          >
                            Delete comment
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                    {isEditingCommentIndex !== index && (
                      <Text color="dimmed" size="sm">
                        {comment.comment_content}
                      </Text>
                    )}
                    {isEditingCommentIndex === index && (
                      <>
                        <Textarea
                          color="dimmed"
                          size="xs"
                          placeholder="Edit comment"
                          value={editedComment}
                          mt="xl"
                          onChange={(e) =>
                            setEditedComment(e.currentTarget.value)
                          }
                        />
                        <Group noWrap position="right" mt="xs">
                          <Button
                            disabled={isUpdatingComment}
                            color="red"
                            onClick={() => setIsEditingCommentIndex(-1)}
                          >
                            Cancel
                          </Button>
                          <Button
                            disabled={isUpdatingComment}
                            onClick={() =>
                              handleEditComment(
                                comment.request_id as number,
                                comment.comment_id as number,
                                editedComment
                              )
                            }
                          >
                            Update Comment
                          </Button>
                        </Group>
                      </>
                    )}
                  </Timeline.Item>
                );
              }
              if (comment.comment_type_id === "uncanceled") {
                return (
                  <Timeline.Item
                    key={comment.comment_id}
                    //   title="Icon"
                    bulletSize={24}
                    bullet={
                      <ThemeIcon
                        size={22}
                        // variant="gradient"
                        //   gradient={{ from: "lime", to: "cyan" }}
                        // blue gradientd
                        // gradient={{ from: "blue", to: "cyan" }}
                        // gradient={{ from: "red", to: "yellow" }}
                        color="dark"
                        radius="xl"
                      >
                        <IconCircleDashed size={14} />
                      </ThemeIcon>
                    }
                  >
                    <Text color="dimmed" size="sm">
                      <b>{comment.username}</b> uncanceled this request on{" "}
                      <b>{formattedDate}</b>
                    </Text>
                    <Text color="dimmed" size="sm">
                      {comment.comment_content}
                    </Text>
                  </Timeline.Item>
                );
              }
              if (comment.comment_type_id === "undo") {
                return (
                  <Timeline.Item
                    key={comment.comment_id}
                    //   title="Icon"
                    bulletSize={24}
                    bullet={
                      <ThemeIcon
                        size={22}
                        // variant="gradient"
                        color="dark"
                        //   gradient={{ from: "lime", to: "cyan" }}
                        // blue gradientd
                        // gradient={{ from: "blue", to: "cyan" }}
                        // gradient={{ from: "red", to: "yellow" }}
                        radius="xl"
                      >
                        <IconCircleDashed size={14} />
                      </ThemeIcon>
                    }
                  >
                    <Text color="dimmed" size="sm">
                      <b>{comment.username}</b> undid this request status change
                      on <b>{formattedDate}</b>
                    </Text>
                    <Text color="dimmed" size="sm">
                      {comment.comment_content}
                    </Text>
                  </Timeline.Item>
                );
              }
              if (comment.comment_type_id === "approved") {
                return (
                  <Timeline.Item
                    key={comment.comment_id}
                    //   title="Icon"
                    bulletSize={24}
                    bullet={
                      <ThemeIcon
                        size={22}
                        variant="gradient"
                        gradient={{ from: "lime", to: "cyan" }}
                        radius="xl"
                      >
                        <IconCircleCheck size={14} />
                      </ThemeIcon>
                    }
                  >
                    <Text color="dimmed" size="sm">
                      <b>{comment.username}</b> approved this request on{" "}
                      <b>{formattedDate}</b>
                    </Text>
                    <Text color="dimmed" size="sm">
                      {comment.comment_content}
                    </Text>
                  </Timeline.Item>
                );
              }
              if (comment.comment_type_id === "rejected") {
                return (
                  <Timeline.Item
                    key={comment.comment_id}
                    //   title="ThemeIcon"
                    bulletSize={24}
                    bullet={
                      <ThemeIcon
                        size={22}
                        // variant="gradient"
                        //   gradient={{ from: "lime", to: "cyan" }}
                        // gradient={{ from: "red", to: "r" }}
                        color="red"
                        radius="xl"
                      >
                        <IconCircleMinus size={14} />
                      </ThemeIcon>
                    }
                  >
                    <Text color="dimmed" size="sm">
                      <b>{comment.username}</b> rejected this request on{" "}
                      <b>{formattedDate}</b>
                    </Text>
                  </Timeline.Item>
                );
              }
              if (comment.comment_type_id === "canceled") {
                return (
                  <Timeline.Item
                    key={comment.comment_id}
                    //   title="Icon"
                    bulletSize={24}
                    bullet={
                      <ThemeIcon
                        size={22}
                        // variant="gradient"
                        //   gradient={{ from: "lime", to: "cyan" }}
                        // blue gradientd
                        // gradient={{ from: "blue", to: "cyan" }}
                        // gradient={{ from: "red", to: "yellow" }}
                        color="dark"
                        radius="xl"
                      >
                        <IconCircleDashed size={14} />
                      </ThemeIcon>
                    }
                  >
                    <Text color="dimmed" size="sm">
                      <b>{comment.username}</b> canceled this request on{" "}
                      <b>{formattedDate}</b>
                    </Text>
                    <Text color="dimmed" size="sm">
                      {comment.comment_content}
                    </Text>
                  </Timeline.Item>
                );
              }
              if (comment.comment_type_id === "request_created") {
                return (
                  <Timeline.Item
                    key={comment.comment_id}
                    //   title="Icon"
                    bulletSize={24}
                    bullet={
                      <ThemeIcon
                        size={22}
                        variant="gradient"
                        //   gradient={{ from: "lime", to: "cyan" }}
                        // blue gradientd
                        gradient={{ from: "blue", to: "cyan" }}
                        radius="xl"
                      >
                        <IconCircleDashed size={14} />
                      </ThemeIcon>
                    }
                  >
                    <Text color="dimmed" size="sm">
                      <b>{comment.username}</b> created this request on{" "}
                      <b>{formattedDate}</b>
                    </Text>
                    <Text color="dimmed" size="sm">
                      {comment.comment_content}
                    </Text>
                  </Timeline.Item>
                );
              }
            })}
          </Timeline>

          <Textarea
            placeholder="Leave a comment"
            value={newComment}
            mt="xl"
            onChange={(e) => setNewComment(e.currentTarget.value)}
          />
          <Group noWrap position="right">
            <Button
              disabled={isUpdatingComment}
              mt="xs"
              onClick={() =>
                handleAddComment(
                  requestId as number,
                  newComment,
                  userId as string
                )
              }
            >
              Comment
            </Button>
          </Group>
        </>
      )}
    </Container>
  );
}
