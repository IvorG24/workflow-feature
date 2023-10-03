import { getCommentAttachment } from "@/backend/api/get";
import {
  createAttachment,
  createComment,
  createNotification,
} from "@/backend/api/post";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { RequestCommentType } from "@/utils/types";
import { Divider, Group, Paper, Space, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import RequestComment from "./RequestComment";
import RequestCommentAttachmentList from "./RequestCommentAttachmentList";
import RequestCommentForm, { CommentFormProps } from "./RequestCommentForm";

type Props = {
  requestData: {
    requestId: string;
    requestOwnerId: string;
    teamId: string;
  };
  requestCommentList: RequestCommentType[];
};

const RequestCommentList = ({ requestData, requestCommentList }: Props) => {
  const userProfile = useUserProfile();
  const teamMember = useUserTeamMember();
  const supabaseClient = useSupabaseClient();
  const user = useUserProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [commentList, setCommentList] = useState(requestCommentList);
  const [commentAttachment, setCommentAttachment] = useState<File[]>([]);

  useEffect(() => {
    const fetchCommentAttachmentList = async () => {
      const commentListWithAttachmentUrl = await Promise.all(
        requestCommentList.map(async (comment) => {
          const commentAttachmentUrlList = await getCommentAttachment(
            supabaseClient,
            { commentId: comment.comment_id }
          );

          return {
            ...comment,
            comment_attachment: commentAttachmentUrlList,
          };
        })
      );
      setCommentList(commentListWithAttachmentUrl);
    };
    fetchCommentAttachmentList();
  }, [requestCommentList, supabaseClient]);

  // create comment
  const addCommentFormMethods = useForm<CommentFormProps>();
  const handleAddComment = async (data: CommentFormProps) => {
    if (!userProfile) return;
    if (!teamMember) return;
    const commenterFullName = `${userProfile.user_first_name} ${userProfile.user_last_name}`;

    try {
      setIsLoading(true);
      const newCommentId = uuidv4();
      // upload attachments
      if (commentAttachment.length > 0) {
        for (const attachment of commentAttachment) {
          await createAttachment(supabaseClient, {
            file: attachment,
            attachmentData: {
              attachment_bucket: "COMMENT_ATTACHMENTS",
              attachment_name: attachment.name,
              attachment_value: `${newCommentId}-${attachment.name}`,
            },
          });
        }
        setCommentAttachment([]);
      }
      const { error } = await createComment(supabaseClient, {
        comment_request_id: requestData.requestId,
        comment_team_member_id: teamMember.team_member_id,
        comment_type: "REQUEST_COMMENT",
        comment_content: data.comment,
        comment_id: newCommentId,
      });

      if (error) throw error;

      if (!error) {
        if (requestData.requestOwnerId !== user?.user_id) {
          // create notification
          await createNotification(supabaseClient, {
            notification_app: "REQUEST",
            notification_type: "COMMENT",
            notification_content: `${commenterFullName} commented on your request`,
            notification_redirect_url: `/team-requests/requests/${requestData.requestId}`,
            notification_user_id: requestData.requestOwnerId,
            notification_team_id: requestData.teamId,
          });
        }
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
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack>
      <Paper p="xl" shadow="xs" mt="xl">
        <Group position="apart">
          <Title order={4} color="dimmed">
            Comments
          </Title>
          {user && <RequestCommentAttachmentList commentList={commentList} />}
        </Group>

        {user && (
          <>
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
                isSubmittingForm={isLoading}
                commentAttachment={commentAttachment}
                setCommentAttachment={setCommentAttachment}
              />
            </FormProvider>
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
                isSubmittingForm={isLoading}
                commentAttachment={commentAttachment}
                setCommentAttachment={setCommentAttachment}
              />
            </FormProvider>

            <Divider my="xl" />
          </>
        )}

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
