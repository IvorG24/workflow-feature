import { GetTeamRequestList } from "@/utils/queries-new";
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
import { IconDotsVertical } from "@tabler/icons";
import { Dispatch, SetStateAction } from "react";
import RequestComment from "./RequestComment";

type Props = {
  request: GetTeamRequestList[0];
  setSelectedRequest: Dispatch<SetStateAction<GetTeamRequestList[0] | null>>;
};

const RequestItem = ({ request, setSelectedRequest }: Props) => {
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
        <Group>Attachments here</Group>
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
