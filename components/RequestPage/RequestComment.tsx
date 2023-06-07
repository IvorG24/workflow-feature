import { deleteComment } from "@/backend/api/delete";
import { updateComment } from "@/backend/api/update";
import { useUserTeamMemberId } from "@/stores/useUserStore";
import { getAvatarColor } from "@/utils/styling";
import { RequestWithResponseType } from "@/utils/types";
import {
  ActionIcon,
  Avatar,
  Box,
  Flex,
  Menu,
  Spoiler,
  Stack,
  Text,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconDots, IconEdit, IconX } from "@tabler/icons-react";
import { capitalize } from "lodash";
import moment from "moment";
import { Dispatch, SetStateAction, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import RequestCommentForm, { CommentFormProps } from "./RequestCommentForm";

type Comment = RequestWithResponseType["request_comment"][0];

type RequestCommentProps = {
  comment: Comment;
  setCommentList: Dispatch<SetStateAction<Comment[]>>;
};
const RequestComment = ({ comment, setCommentList }: RequestCommentProps) => {
  const supabaseClient = useSupabaseClient();
  const teamMemberId = useUserTeamMemberId();

  const [commentContent, setCommentContent] = useState(comment.comment_content);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [isCommentEdited, setIsCommentEdited] = useState(false);

  const { team_member_user: commenter } = comment.comment_team_member;
  const isUserOwner = comment.comment_team_member_id === teamMemberId;

  // edit comment
  const editCommentFormMethods = useForm<CommentFormProps>({
    defaultValues: { comment: comment.comment_content },
  });
  const handleEditComment = async (data: CommentFormProps) => {
    try {
      setIsSubmittingForm(true);
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
      setIsSubmittingForm(false);
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
    <Box pos="relative" mt="sm">
      {isEditingComment ? (
        <FormProvider {...editCommentFormMethods}>
          <RequestCommentForm
            onSubmit={handleEditComment}
            textAreaProps={{ disabled: isSubmittingForm }}
            addCancelButton={{
              onClickHandler: () => setIsEditingComment(false),
            }}
            submitButtonProps={{
              loading: isSubmittingForm,
              children: "Save",
            }}
          />
        </FormProvider>
      ) : (
        <Stack spacing={8}>
          <Flex mt="lg">
            <Avatar
              size={40}
              src={commenter.user_avatar}
              color={getAvatarColor(
                Number(`${commenter.user_id.charCodeAt(0)}`)
              )}
              radius="xl"
            >
              {capitalize(commenter.user_first_name[0])}
              {capitalize(commenter.user_last_name[0])}
            </Avatar>
            <Stack spacing={0} ml="md">
              <Text size={14}>
                {`${commenter.user_first_name} ${commenter.user_last_name}`}
              </Text>
              <Text color="dimmed" size={12}>
                {commenter.user_username}
              </Text>
            </Stack>
            <Text color="dimmed" size={12} ml="xs">
              ({moment(comment.comment_date_created).fromNow()})
            </Text>
            {isUserOwner && (
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <ActionIcon ml="auto">
                    <IconDots />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    icon={<IconEdit size={14} />}
                    onClick={() => setIsEditingComment(true)}
                  >
                    Edit
                  </Menu.Item>
                  <Menu.Item
                    icon={<IconX size={14} />}
                    onClick={openPromptDeleteModal}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Flex>
          <Spoiler maxHeight={120} showLabel="Show more" hideLabel="Hide">
            <Text size={14}> {commentContent}</Text>
            <Text color="dimmed" size={12}>
              {comment.comment_last_updated || isCommentEdited
                ? "(edited)"
                : ""}
            </Text>
          </Spoiler>
        </Stack>
      )}
    </Box>
  );
};

export default RequestComment;
