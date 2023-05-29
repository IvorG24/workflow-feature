import { createComment, createNotification } from "@/backend/api/post";
import { useUserProfile } from "@/stores/useUserStore";
import { TEMP_TEAM_MEMBER_ID } from "@/utils/dummyData";
import { RequestWithResponseType } from "@/utils/types";
import { Divider, Paper, Space, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import RequestComment from "./RequestComment";
import RequestCommentForm, { CommentFormProps } from "./RequestCommentForm";

type Comment = RequestWithResponseType["request_comment"][0];

type RequestCommentListProps = {
  requestData: {
    requestId: string;
    requestOwnerId: string;
  };
  requestCommentList: Comment[];
};

const RequestCommentList = ({
  requestData,
  requestCommentList,
}: RequestCommentListProps) => {
  const userProfile = useUserProfile();
  const supabaseClient = useSupabaseClient();
  const [isLoading, setIsLoading] = useState(false);
  const [commentList, setCommentList] = useState(requestCommentList);

  // create comment
  const addCommentFormMethods = useForm<CommentFormProps>();
  const handleAddComment = async (data: CommentFormProps) => {
    if (!userProfile) return;
    const commenterFullName = `${userProfile.user_first_name} ${userProfile.user_last_name}`;

    try {
      setIsLoading(true);
      const { data: newComment, error } = await createComment(supabaseClient, {
        comment_request_id: requestData.requestId,
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
              user_id: requestData.requestOwnerId,
              user_first_name: userProfile.user_first_name,
              user_last_name: userProfile.user_last_name,
              user_username: userProfile.user_username,
              user_avatar: userProfile.user_avatar,
            },
          },
        };
        setCommentList((prev) => [comment as Comment, ...prev]);
        // create notification
        await createNotification(supabaseClient, {
          notification_app: "REQUEST",
          notification_type: "REQUEST_COMMENT",
          notification_content: `${commenterFullName} commented on your request`,
          notification_redirect_url: `/team-requests/requests/${requestData.requestId}`,
          notification_team_member_id: requestData.requestOwnerId,
        });
        notifications.show({
          message: "Comment created.",
          color: "green",
        });
        // reset comment form
        addCommentFormMethods.reset();
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
    <Stack>
      <Paper p="xl" shadow="xs" mt="xl">
        <Title order={4} color="dimmed">
          Comments
        </Title>
        <Space h="xl" />
        <FormProvider {...addCommentFormMethods}>
          <RequestCommentForm
            onSubmit={handleAddComment}
            textAreaProps={{
              placeholder: "Enter your comment here",
              disabled: isLoading,
            }}
            submitButtonProps={{
              loading: isLoading,
              children: "Comment",
            }}
          />
        </FormProvider>

        <Divider my="xl" />

        {commentList.map((comment) => (
          <RequestComment
            key={comment.comment_id}
            comment={comment}
            setCommentList={setCommentList}
          />
        ))}
      </Paper>
    </Stack>
  );
};
export default RequestCommentList;
