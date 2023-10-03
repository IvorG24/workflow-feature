import {
  getFileType,
  getFileTypeColor,
  shortenFileName,
} from "@/utils/styling";
import { RequestCommentType } from "@/utils/types";
import {
  ActionIcon,
  Avatar,
  Button,
  Card,
  Divider,
  Drawer,
  Flex,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconDownload } from "@tabler/icons-react";
import Link from "next/link";

type Props = {
  commentList: RequestCommentType[];
};

const RequestCommentAttachmentList = ({ commentList }: Props) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>View All Attachments</Button>
      <Drawer
        title="Attachment List"
        opened={opened}
        onClose={close}
        position="right"
      >
        <Stack spacing="md">
          {commentList.map((comment) => {
            if (
              comment.comment_attachment &&
              comment.comment_attachment.length > 0
            ) {
              {
                const { user_first_name, user_last_name } =
                  comment.comment_team_member.team_member_user;

                return (
                  <Stack spacing="xs" mb="md" key={comment.comment_id}>
                    <Divider
                      label={
                        <Text size="sm">{`${user_first_name} ${user_last_name}`}</Text>
                      }
                      labelPosition="left"
                    />
                    <Stack spacing="xs">
                      {comment.comment_attachment &&
                        comment.comment_attachment.length > 0 &&
                        comment.comment_attachment.map((attachment) => (
                          <Card
                            p="xs"
                            key={attachment.attachment_id}
                            withBorder
                          >
                            <Group position="apart">
                              <Flex
                                sx={{ flex: 1 }}
                                align="center"
                                gap="sm"
                                onClick={() =>
                                  window.open(
                                    attachment.attachment_public_url,
                                    "_blank"
                                  )
                                }
                              >
                                <Avatar
                                  size="sm"
                                  color={getFileTypeColor(
                                    attachment.attachment_name
                                  )}
                                >
                                  {getFileType(attachment.attachment_name)}
                                </Avatar>
                                <Text c="dark" size="xs">
                                  {shortenFileName(
                                    attachment.attachment_name,
                                    60
                                  )}
                                </Text>
                              </Flex>
                              <Link
                                href={`${
                                  attachment.attachment_public_url
                                }?download=${encodeURIComponent(
                                  attachment.attachment_name
                                )}`}
                              >
                                <ActionIcon
                                  size="sm"
                                  color="green"
                                  onClick={() =>
                                    notifications.show({
                                      title: "File downloaded.",
                                      message:
                                        "Please check your Downloads folder.",
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
                  </Stack>
                );
              }
            } else {
              return null;
            }
          })}
        </Stack>
      </Drawer>
    </>
  );
};
export default RequestCommentAttachmentList;
