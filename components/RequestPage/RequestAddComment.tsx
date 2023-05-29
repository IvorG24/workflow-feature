import { createComment, createNotification } from "@/backend/api/post";
import { useUserProfile } from "@/stores/useUserStore";
import { TEMP_TEAM_MEMBER_ID } from "@/utils/dummyData";
import { RequestWithResponseType } from "@/utils/types";
import {
  Box,
  Button,
  Group,
  LoadingOverlay,
  Paper,
  Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";

type Comment = RequestWithResponseType["request_comment"][0];

type RequestCommentProps = {
  requestId: string;
  requestOwnerId: string;
  setCommentList: Dispatch<SetStateAction<Comment[]>>;
};

type CommentFormProps = {
  comment: string;
};

const RequestAddComment = ({
  requestId,
  requestOwnerId,
  setCommentList,
}: RequestCommentProps) => {
  const userProfile = useUserProfile();
  const [isLoading, setIsLoading] = useState(false);
  const supabaseClient = useSupabaseClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormProps>();

  const handleAddComment = async (data: CommentFormProps) => {
    if (!userProfile) return;
    const commenterFullName = `${userProfile.user_first_name} ${userProfile.user_last_name}`;

    try {
      setIsLoading(true);
      const { data: newComment, error } = await createComment(supabaseClient, {
        comment_request_id: requestId,
        comment_team_member_id: TEMP_TEAM_MEMBER_ID,
        comment_type: "REQUEST_COMMENT",
        comment_content: data.comment,
      });
      if (error) throw error;

      if (!error) {
        const comment = {
          ...newComment,
          comment_team_member: {
            team_member_user: {
              user_id: requestOwnerId,
              user_first_name: userProfile.user_first_name,
              user_last_name: userProfile.user_last_name,
              user_username: userProfile.user_username,
              user_avatar: userProfile.user_avatar,
            },
          },
        };
        setCommentList((prev) => [comment as Comment, ...prev]);
        reset();
        await createNotification(supabaseClient, {
          notification_app: "REQUEST",
          notification_type: "REQUEST_COMMENT",
          notification_content: `${commenterFullName} commented on your request`,
          notification_redirect_url: `/team-requests/requests/${requestId}`,
          notification_team_member_id: requestOwnerId,
        });
        notifications.show({
          message: "Comment created.",
          color: "green",
        });
        return;
      }
    } catch (e) {
      notifications.show({
        title: "Submit comment failed.",
        message: `Please try again later.`,
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper p="sm" mt="xl">
      <Box pos="relative">
        <form
          onSubmit={handleSubmit(handleAddComment)}
          style={{ position: "relative" }}
        >
          <LoadingOverlay visible={isLoading} overlayBlur={2} />
          <Textarea
            placeholder="Your comment"
            label="Add comment"
            error={errors.comment?.message}
            {...register("comment", {
              required: "Comment must not be empty.",
            })}
          />
          <Group mt="sm" position="right">
            <Button type="submit">Submit</Button>
          </Group>
        </form>
      </Box>
    </Paper>
  );
};

export default RequestAddComment;
