import { deleteComment } from "@/backend/api/delete";
import { updateComment } from "@/backend/api/update";
import { TEMP_TEAM_MEMBER_ID } from "@/utils/dummyData";
import { RequestWithResponseType } from "@/utils/types";
import {
  Box,
  Button,
  Group,
  LoadingOverlay,
  Paper,
  Spoiler,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";

type Comment = RequestWithResponseType["request_comment"][0];

type RequestCommentProps = {
  comment: Comment;
  setCommentList: Dispatch<SetStateAction<Comment[]>>;
};

type CommentFormProps = {
  comment: string;
};

const RequestComment = ({ comment, setCommentList }: RequestCommentProps) => {
  const supabaseClient = useSupabaseClient();
  const [commentContent, setCommentContent] = useState(comment.comment_content);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [isCommentEdited, setIsCommentEdited] = useState(false);
  const { team_member_user: commenter } = comment.comment_team_member;
  const isUserOwner = comment.comment_team_member_id === TEMP_TEAM_MEMBER_ID;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CommentFormProps>({
    defaultValues: { comment: comment.comment_content },
  });

  const handleEditComment = async (data: CommentFormProps) => {
    try {
      setIsLoading(true);
      await updateComment(supabaseClient, {
        commentId: comment.comment_id,
        newComment: data.comment,
      });
      setCommentContent(data.comment);
      setIsCommentEdited(true);
    } catch (e) {
      notifications.show({
        title: "Update comment failed.",
        message: `Please try again later.`,
        color: "red",
      });
    } finally {
      setIsLoading(false);
      setIsEditingComment(false);
    }
  };
  const handleDeleteComment = async () => {
    try {
      await deleteComment(supabaseClient, {
        commentId: comment.comment_id,
      });
      setCommentList((prev) =>
        prev.filter(
          (commentItem) => commentItem.comment_id !== comment.comment_id
        )
      );
      notifications.show({
        message: "Comment deleted.",
        color: "green",
      });
    } catch (e) {
      notifications.show({
        title: "Failed to delete comment.",
        message: `Please try again later.`,
        color: "red",
      });
    }
  };

  const openPromptDeleteModal = () =>
    modals.openConfirmModal({
      title: "Are you sure you want to delete this comment?",
      labels: { confirm: "Confirm", cancel: "Cancel" },
      centered: true,
      confirmProps: { color: "red" },
      onCancel: () => console.log("Cancel"),
      onConfirm: async () => await handleDeleteComment(),
    });

  return (
    <Paper p="md" mt="xl">
      <Box pos="relative">
        <LoadingOverlay visible={isLoading} overlayBlur={2} />

        {isEditingComment ? (
          <form
            onSubmit={handleSubmit(handleEditComment)}
            style={{ position: "relative" }}
          >
            <Textarea
              placeholder="Your comment"
              label="Add comment"
              error={errors.comment?.message}
              {...register("comment", {
                required: "Comment must not be empty.",
              })}
            />
            <Group mt="sm" position="right">
              <Button
                variant="default"
                onClick={() => setIsEditingComment(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </Group>
          </form>
        ) : (
          <Stack spacing={8}>
            <Text
              weight={600}
            >{`${commenter.user_first_name} ${commenter.user_last_name}`}</Text>
            <Spoiler maxHeight={120} showLabel="Show more" hideLabel="Hide">
              {commentContent}{" "}
              {comment.comment_last_updated || isCommentEdited
                ? "(edited)"
                : ""}
            </Spoiler>
            {isUserOwner && (
              <Group mt="sm" position="right">
                <Button color="red" onClick={openPromptDeleteModal}>
                  Delete
                </Button>
                <Button onClick={() => setIsEditingComment(true)}>Edit</Button>
              </Group>
            )}
          </Stack>
        )}
      </Box>
    </Paper>
  );
};

export default RequestComment;
