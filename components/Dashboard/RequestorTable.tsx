import { getAvatarColor } from "@/utils/styling";
import { Avatar, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { RequestorListType } from "./Dashboard";

type RequestorTableProps = {
  requestorList: RequestorListType;
};

const RequestorTable = ({ requestorList }: RequestorTableProps) => {
  return (
    <Paper w={{ base: "100%", sm: 320 }} mt="xl" p={{ base: "sm", sm: "md" }}>
      <Title order={4}>Requestor Ranking</Title>
      <Group mt="md" position="apart">
        <Text weight={600}>Requestor</Text>
        <Text weight={600}>Requests</Text>
      </Group>

      <Stack mt="sm">
        {requestorList.map((requestor) => (
          <Group key={requestor.user_id} position="apart">
            <Group spacing="xs">
              <Avatar
                size="sm"
                radius="xl"
                src={requestor.user_avatar ?? null}
                color={getAvatarColor(
                  Number(`${requestor.user_id.charCodeAt(0)}`)
                )}
              >
                {!requestor.user_avatar &&
                  `${requestor.user_first_name[0]}${requestor.user_last_name[0]}`}
              </Avatar>
              <Text
                weight={500}
              >{`${requestor.user_first_name} ${requestor.user_last_name}`}</Text>
            </Group>
            <Text>{requestor.count}</Text>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
};

export default RequestorTable;
