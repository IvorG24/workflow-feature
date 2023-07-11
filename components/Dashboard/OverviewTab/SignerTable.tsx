import { getAvatarColor, getStatusToColor } from "@/utils/styling";
import {
  Avatar,
  Badge,
  Box,
  Center,
  Group,
  Paper,
  Progress,
  ScrollArea,
  Stack,
  Text,
  Title,
  createStyles,
} from "@mantine/core";
import { IconShieldCheckFilled } from "@tabler/icons-react";
import { startCase } from "lodash";
import { RequestorAndSignerDataType } from "./Overview";

const useStyles = createStyles(() => ({
  withBorderBottom: {
    borderBottom: "0.0625rem solid #dee2e6",
  },
}));

type SignerTableProps = {
  signerList: RequestorAndSignerDataType[];
  totalRequestCount: number;
};

const SignerTable = ({ signerList, totalRequestCount }: SignerTableProps) => {
  const { classes } = useStyles();
  const sortSignerListByTotalRequests = signerList.sort(
    (a, b) => b.request.total - a.request.total
  );

  return (
    <ScrollArea w="100%" h="100%">
      <Paper w={{ base: "100%" }} mih={450} withBorder>
        <Group p="md" className={classes.withBorderBottom}>
          <Box c="green">
            <IconShieldCheckFilled />
          </Box>
          <Title order={4}>Top Signer</Title>
        </Group>

        <Stack p="lg" mb="sm" spacing={32}>
          {totalRequestCount > 0 ? (
            sortSignerListByTotalRequests.map((signer) => {
              const statusCount = Object.entries(signer.request);
              const progressSections = statusCount.map(([key, value]) => ({
                value: (value / totalRequestCount) * 100,
                color: `${getStatusToColor(key) || "dark"}`,
                tooltip: `${startCase(key)}: ${value}`,
              }));

              return (
                <Stack key={signer.user_id} spacing="xs">
                  <Group position="apart">
                    <Group spacing="xs">
                      <Avatar
                        size="sm"
                        radius="xl"
                        src={signer.user_avatar ?? null}
                        color={getAvatarColor(
                          Number(`${signer.user_id.charCodeAt(0)}`)
                        )}
                      >
                        {!signer.user_avatar &&
                          `${signer.user_first_name[0]}${signer.user_last_name[0]}`}
                      </Avatar>
                      <Text
                        weight={500}
                      >{`${signer.user_first_name} ${signer.user_last_name}`}</Text>
                    </Group>

                    <Badge size="sm" variant="filled" color="dark">
                      Total: {signer.request.total}
                    </Badge>
                  </Group>
                  <Progress
                    size="md"
                    radius="lg"
                    color="green"
                    sections={progressSections}
                  />
                </Stack>
              );
            })
          ) : (
            <Center h={175}>
              <Text size={20} color="dimmed" weight={600}>
                No data available.
              </Text>
            </Center>
          )}
        </Stack>
      </Paper>
    </ScrollArea>
  );
};

export default SignerTable;
