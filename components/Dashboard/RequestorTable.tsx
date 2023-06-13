import { getAvatarColor } from "@/utils/styling";
import {
  Avatar,
  Box,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  Title,
  createStyles,
} from "@mantine/core";
import { RequestorListType } from "./Dashboard";

const useStyles = createStyles(() => ({
  withBorderBottom: {
    borderBottom: "0.0625rem solid #dee2e6",
  },
}));

type RequestorTableProps = {
  requestorList: RequestorListType;
  totalRequest: number;
};

const RequestorTable = ({
  requestorList,
  totalRequest,
}: RequestorTableProps) => {
  const { classes } = useStyles();
  return (
    <Paper w={{ base: "100%", sm: 320 }} mt="xl" h="fit-content" withBorder>
      <Box p="sm" className={classes.withBorderBottom}>
        <Title order={4}>Requestor Ranking</Title>
      </Box>

      <Stack p="sm" my="sm">
        {requestorList.map((requestor) => (
          <Stack key={requestor.user_id}>
            <Group position="apart">
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
              <Text weight={600}>{requestor.count}</Text>
            </Group>
            <Progress
              size="sm"
              value={(requestor.count / totalRequest) * 100}
            />
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
};

export default RequestorTable;
