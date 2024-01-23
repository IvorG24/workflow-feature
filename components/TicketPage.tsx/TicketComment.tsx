import { getCommentAttachment } from "@/backend/api/get";
import { Database } from "@/utils/database";
import {
  getAvatarColor,
  getFileType,
  getFileTypeColor,
  shortenFileName,
} from "@/utils/styling";
import { TicketType } from "@/utils/types";
import {
  ActionIcon,
  Alert,
  Avatar,
  Card,
  Flex,
  Group,
  Stack,
  Text,
  TypographyStylesProvider,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconDownload } from "@tabler/icons-react";
import moment from "moment";
import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  comment: TicketType["ticket_comment"][0];
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
  const supabaseClient = createPagesBrowserClient<Database>();
  const commenter = comment.ticket_comment_team_member;
  const [attachmentList, setAttachmentList] = useState<CommentAttachmentType[]>(
    comment.ticket_comment_attachment
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
      color: "yellow",
    },
  ];

  const hasCommentActionType = commentActionTypeList.includes(
    `${comment.ticket_comment_type}`
  );

  const commentActionType = commentActionList.find(
    (action) => action.type === comment.ticket_comment_type
  );

  useEffect(() => {
    const fetchCommentAttachment = async () => {
      const commentAttachmentList = await getCommentAttachment(supabaseClient, {
        commentId: comment.ticket_comment_id,
      });

      if (commentAttachmentList) {
        setAttachmentList(commentAttachmentList);
      }
    };
    fetchCommentAttachment();
  }, [comment, supabaseClient]);

  return (
    <Card p={0} w="100%" sx={{ cursor: "pointer" }}>
      {hasCommentActionType ? (
        <Flex align="top" gap="sm" mt="lg">
          <Avatar
            size={40}
            src={commenter.team_member_user.user_avatar}
            color={getAvatarColor(
              Number(`${commenter.team_member_user.user_id.charCodeAt(0)}`)
            )}
            radius="xl"
          >
            {(
              commenter.team_member_user.user_first_name[0] +
              commenter.team_member_user.user_last_name[0]
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
                  {comment.ticket_comment_type === "ACTION_OVERRIDE" ? (
                    <TypographyStylesProvider>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: comment.ticket_comment_content,
                        }}
                      />
                    </TypographyStylesProvider>
                  ) : (
                    <Flex direction="column">
                      {comment.ticket_comment_content
                        .split("\n")
                        .map((line, id) => (
                          <Text span key={id}>
                            {line}
                          </Text>
                        ))}
                    </Flex>
                  )}
                </Text>
                <Text color="dimmed" size={12}>
                  {moment(comment.ticket_comment_date_created).fromNow()},{" "}
                  {moment(new Date(comment.ticket_comment_date_created)).format(
                    "YYYY-MM-DD"
                  )}
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
            src={commenter.team_member_user.user_avatar}
            color={getAvatarColor(
              Number(`${commenter.team_member_user.user_id.charCodeAt(0)}`)
            )}
          >
            {(
              commenter.team_member_user.user_first_name[0] +
              commenter.team_member_user.user_last_name[0]
            ).toUpperCase()}
          </Avatar>
          <Stack spacing={4}>
            <Group>
              <Text size={14}>
                {`${commenter.team_member_user.user_first_name} ${commenter.team_member_user.user_last_name}`}
              </Text>
              <Text size={14} color="dimmed">
                {moment(comment.ticket_comment_date_created).format(
                  "YYYY-MM-DD"
                )}
              </Text>
            </Group>
            <Flex direction="column">
              {comment.ticket_comment_content.split("\n").map((line, id) => (
                <Text key={id}>{line}</Text>
              ))}
            </Flex>
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
