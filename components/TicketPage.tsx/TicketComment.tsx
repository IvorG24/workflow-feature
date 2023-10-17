import { TEMP_TICKET_COMMENT_ATTACHMENT_LIST } from "@/pages/team-requests/tickets/[ticketId]";
import {
  getAvatarColor,
  getFileType,
  getFileTypeColor,
  shortenFileName,
} from "@/utils/styling";
import {
  ActionIcon,
  Alert,
  Avatar,
  Card,
  Flex,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDownload } from "@tabler/icons-react";
import moment from "moment";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TicketCommentType } from "./TicketCommentSection";

type Props = {
  comment: TicketCommentType;
};

type CommentAttachmentType = {
  attachment_bucket: string;
  attachment_date_created: string;
  attachment_id: string;
  attachment_is_disabled: boolean;
  attachment_name: string;
  attachment_value: string;
  attachment_public_url: string;
};

const TicketComment = ({ comment }: Props) => {
  const commenter = comment.ticket_comment_team_member;
  const [attachmentList, setAttachmentList] = useState<CommentAttachmentType[]>(
    []
  );

  const commentActionTypeList = [
    "ACTION_CLOSED",
    "ACTION_UNDER_REVIEW",
    "ACTION_INCORRECT",
    "ACTION_OVERRIDE",
  ];

  const commentActionList = [
    {
      type: "ACTION_UNDER_REVIEW",
      title: "Under Review",
      color: "orange",
    },
    {
      type: "ACTION_CLOSED",
      title: "Closed",
      color: "green",
    },
    {
      type: "ACTION_INCORRECT",
      title: "Incorrect",
      color: "red",
    },
    {
      type: "ACTION_OVERRIDE",
      title: "Override",
      color: "orange",
    },
  ];

  const hasCommentActionType = commentActionTypeList.includes(
    `${comment.ticket_comment_type}`
  );

  const commentActionType = commentActionList.find(
    (action) => action.type === comment.ticket_comment_type
  );

  useEffect(() => {
    // reference: RequestCommentList Line 37 - 55
    const fetchCommentAttachment = () => {
      const commentAttachmentList = TEMP_TICKET_COMMENT_ATTACHMENT_LIST.filter(
        (attachment) =>
          attachment.attachment_value.includes(comment.ticket_comment_id)
      );

      if (commentAttachmentList) {
        setAttachmentList(commentAttachmentList);
      }
    };
    fetchCommentAttachment();
  }, [comment]);

  return (
    <Card p={0} w="100%" sx={{ cursor: "pointer" }}>
      {hasCommentActionType ? (
        <Flex align="center" gap="sm" mt="lg">
          <Avatar
            size={40}
            src={commenter.user.user_avatar}
            color={getAvatarColor(
              Number(`${commenter.user.user_id.charCodeAt(0)}`)
            )}
            radius="xl"
          >
            {(
              commenter.user.user_first_name[0] +
              commenter.user.user_last_name[0]
            ).toUpperCase()}
          </Avatar>

          <Alert
            w="100%"
            color={commentActionType?.color}
            title={commentActionType?.title}
          >
            <Flex align="center" gap="md">
              <Stack m={0} p={0} spacing={0}>
                <Text>
                  {comment.ticket_comment_content} on{" "}
                  {new Date(comment.ticket_comment_date_created).toDateString()}
                </Text>
                <Text color="dimmed" size={12}>
                  {moment(comment.ticket_comment_date_created).fromNow()}
                </Text>
              </Stack>
            </Flex>
          </Alert>
        </Flex>
      ) : (
        <Flex gap="sm">
          <Avatar
            size={40}
            radius="xl"
            src={commenter.user.user_avatar}
            color={getAvatarColor(
              Number(`${commenter.team_member_id.charCodeAt(0)}`)
            )}
          >
            {(
              commenter.user.user_first_name[0] +
              commenter.user.user_last_name[0]
            ).toUpperCase()}
          </Avatar>
          <Stack spacing={4}>
            <Group>
              <Text size={14}>
                {`${commenter.user.user_first_name} ${commenter.user.user_last_name}`}
              </Text>
              <Text size={14}>
                {moment(comment.ticket_comment_date_created).format(
                  "MMM DD, YYYY"
                )}
              </Text>
            </Group>
            <Text>{comment.ticket_comment_content}</Text>
          </Stack>
        </Flex>
      )}
      {attachmentList && attachmentList.length > 0 && (
        <Stack mt="sm" spacing="xs">
          {attachmentList.map((attachment) => (
            <Card p="xs" key={attachment.attachment_id} withBorder>
              <Group position="apart">
                <Flex
                  sx={{ flex: 1 }}
                  align="center"
                  gap="sm"
                  onClick={() =>
                    window.open(attachment.attachment_public_url, "_blank")
                  }
                >
                  <Avatar
                    size="sm"
                    color={getFileTypeColor(attachment.attachment_name)}
                  >
                    {getFileType(attachment.attachment_name)}
                  </Avatar>
                  <Text c="dark" size="xs">
                    {shortenFileName(attachment.attachment_name, 60)}
                  </Text>
                </Flex>
                <Link
                  href={`${
                    attachment.attachment_public_url
                  }?download=${encodeURIComponent(attachment.attachment_name)}`}
                >
                  <ActionIcon
                    size="sm"
                    color="green"
                    onClick={() =>
                      notifications.show({
                        title: "File downloaded.",
                        message: "Please check your Downloads folder.",
                        color: "green",
                      })
                    }
                  >
                    <IconDownload size={16} />
                  </ActionIcon>
                </Link>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Card>
  );
};

export default TicketComment;
