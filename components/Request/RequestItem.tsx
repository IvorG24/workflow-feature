import {
  getRequestWithAttachmentUrlList,
  GetRequestWithAttachmentUrlList,
  GetTeamRequestList,
} from "@/utils/queries-new";
import {
  Avatar,
  Box,
  Button,
  CloseButton,
  Divider,
  Group,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconDotsVertical } from "@tabler/icons";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import AttachmentPill from "../RequestsPage/AttachmentPill";
import RequestComment from "./RequestComment";

type Props = {
  request: GetTeamRequestList[0];
  setSelectedRequest: Dispatch<SetStateAction<GetTeamRequestList[0] | null>>;
};

const RequestItem = ({ request, setSelectedRequest }: Props) => {
  const [attachmentUrlList, setAttachmentUrlList] =
    useState<GetRequestWithAttachmentUrlList>();

  const supabaseClient = useSupabaseClient();

  const attachments = request.request_attachment_filepath_list?.map(
    (filepath, i) => {
      return {
        filepath,
        url: attachmentUrlList ? attachmentUrlList[i] : null,
      };
    }
  );

  useEffect(() => {
    async () => {
      try {
        const data = await getRequestWithAttachmentUrlList(
          supabaseClient,
          request.request_id as number
        );
        setAttachmentUrlList(data);
      } catch (error) {
        console.log(error);
        showNotification({
          title: "Error!",
          message: "Failed to fetch request information",
          color: "red",
        });
      }
    };
  }, [request, supabaseClient]);

  return (
    <Box>
      <Group position="apart">
        <Title order={4}>{request.request_title}</Title>
        <CloseButton
          aria-label="close-request"
          onClick={() => setSelectedRequest(null)}
        />
      </Group>
      <Group my="sm" position="apart">
        <Group>
          <Avatar color="blue" radius="xl" />
          <Box>
            <Text fw={500}>{request.username}</Text>
            <Text fz="xs" c="dimmed">
              {request.request_date_created?.slice(0, 10)}
            </Text>
          </Box>
        </Group>
        <Text fz="xs" c="dimmed">
          <IconDotsVertical />
        </Text>
      </Group>
      <Text>{request.request_description}</Text>
      <Divider my="sm" variant="dotted" />
      {request.request_attachment_filepath_list ? (
        <>
          <Text fw={500}>Attachments</Text>
          <Group mt="xs">
            {attachments?.map((attachment, idx) => {
              const filePath = attachment.filepath;
              const fileType = attachment.filepath.split(".").pop() as string;
              const fileUrl = attachment.url as string;

              return (
                <AttachmentPill
                  key={idx}
                  filename={filePath}
                  fileType={fileType}
                  fileUrl={fileUrl}
                />
              );
            })}
          </Group>
        </>
      ) : (
        <Text c="dimmed">No attachments</Text>
      )}
      <Divider my="sm" variant="dotted" />
      <SimpleGrid cols={2} my="xl">
        <Button variant="default">Delete</Button>
        <Button color="indigo">Approve</Button>
      </SimpleGrid>
      <Divider my="sm" />
      <RequestComment />
    </Box>
  );
};

export default RequestItem;
