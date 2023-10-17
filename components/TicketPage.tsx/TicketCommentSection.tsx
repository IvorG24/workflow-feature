import { useUserProfile } from "@/stores/useUserStore";
import {
  getFileType,
  getFileTypeColor,
  shortenFileName,
} from "@/utils/styling";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Card,
  FileButton,
  Flex,
  Group,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import TicketComment from "./TicketComment";

export type TicketCommentType = {
  ticket_comment_id: string;
  ticket_comment_content: string;
  ticket_comment_is_edited: boolean;
  ticket_comment_is_disabled: boolean;
  ticket_comment_date_created: string;
  ticket_comment_type?: string;
  ticket_comment_team_member: {
    team_member_id: string;
    user: {
      user_id: string;
      user_first_name: string;
      user_last_name: string;
      user_avatar: string;
    };
  };
};

type Props = {
  commentList: TicketCommentType[];
};

const TicketCommentSection = ({ commentList }: Props) => {
  const attachmentMaxFileSize = 5242880;
  const currentUser = useUserProfile();
  const [commentAttachment, setCommentAttachment] = useState<File[]>([]);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isAttachmentOverSize, setIsAttachmentOverSize] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<{ comment: string }>();

  const handleAddComment = (data: { comment: string }) => {
    // can refer to: RequestCommentList Line 60 - 120
    try {
      setIsSubmittingForm(true);
      console.log(data);
      console.log({ comment_attachment: commentAttachment });
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleAddAttachment = (attachmentList: File[]) => {
    if (setCommentAttachment) {
      const updatedAttachmentList = [
        ...attachmentList,
        ...(commentAttachment as File[]),
      ];
      setCommentAttachment(updatedAttachmentList);
    }
  };

  const handleRemoveAttachment = (attachmentName: string) => {
    if (setCommentAttachment) {
      const prevCommentAttachment = commentAttachment || [];
      const updatedAttachmentList = prevCommentAttachment.filter(
        (attachment) => attachment.name !== attachmentName
      );

      setCommentAttachment(updatedAttachmentList);
    }
  };

  const convertBytesToReadableValue = (bytes: number) => {
    const mb = bytes / (1024 * 1024);

    if (mb >= 1) {
      return mb.toFixed(2) + " MB";
    } else {
      const kb = bytes / 1024;
      return kb.toFixed(2) + " KB";
    }
  };

  const renderCommentFormAttachments = () =>
    commentAttachment &&
    commentAttachment.length > 0 && (
      <Stack spacing="xs">
        <Text size="sm" mt="sm">
          Selected attachments:
        </Text>

        {commentAttachment.map((attachment, index) => {
          const isOverSize = attachment.size > attachmentMaxFileSize;
          return (
            <Card key={index} withBorder bg={isOverSize ? "red.3" : "white"}>
              <Flex align="center" gap="sm">
                <Group sx={{ flex: 1 }}>
                  <Avatar size="sm" color={getFileTypeColor(attachment.name)}>
                    {getFileType(attachment.name)}
                  </Avatar>
                  <Text>{shortenFileName(attachment.name, 60)}</Text>
                  <Text size="xs" c="dimmed">
                    {convertBytesToReadableValue(attachment.size)}
                  </Text>
                </Group>
                <ActionIcon
                  color="red"
                  onClick={() => handleRemoveAttachment(attachment.name)}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Flex>
            </Card>
          );
        })}
      </Stack>
    );

  useEffect(() => {
    const currentCommentAttachment = commentAttachment || [];

    const isOverSize = currentCommentAttachment.some(
      (file) => file.size > attachmentMaxFileSize
    );
    if (isOverSize) {
      setError("root", {
        type: "custom",
        message:
          "One of your attachments exceeds the size limit. Please review and ensure that each attachment is under 5 MB.",
      });
      setIsAttachmentOverSize(true);
    } else {
      clearErrors();
      setIsAttachmentOverSize(false);
    }
  }, [commentAttachment, clearErrors, setError]);

  return (
    <Stack>
      <Title order={4} color="dimmed">
        Comments
      </Title>
      {currentUser && (
        <Box mt="xl">
          <form onSubmit={handleSubmit(handleAddComment)}>
            <Textarea
              placeholder="Enter your comment here"
              disabled={isSubmittingForm}
              error={errors.comment?.message}
              {...register("comment", {
                required: "Comment must not be empty.",
              })}
            />
            {renderCommentFormAttachments()}
            <Group mt="sm" position="right">
              <FileButton onChange={handleAddAttachment} multiple>
                {(props) => (
                  <Button
                    variant="default"
                    {...props}
                    disabled={isSubmittingForm}
                  >
                    Add attachment
                  </Button>
                )}
              </FileButton>
              <Button type="submit" disabled={isAttachmentOverSize}>
                Comment
              </Button>
            </Group>
          </form>
        </Box>
      )}

      {commentList.length > 0 && (
        <Stack spacing={36}>
          {commentList.map((comment) => (
            <TicketComment key={comment.ticket_comment_id} comment={comment} />
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default TicketCommentSection;
