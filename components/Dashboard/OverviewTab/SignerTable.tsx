import { getAvatarColor } from "@/utils/styling";
import { RequestSignerListType } from "@/utils/types";
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

const useStyles = createStyles(() => ({
  withBorderBottom: {
    borderBottom: "0.0625rem solid #dee2e6",
  },
}));

type SignerTableProps = {
  signerList: RequestSignerListType[];
};
const SignerTable = ({ signerList }: SignerTableProps) => {
  const { classes } = useStyles();
  const sortSignerListByTotalRequests = signerList.sort(
    (a, b) => b.count - a.count
  );

  return (
    <ScrollArea w="100%" h="100%">
      <Paper w={{ base: "100%" }} withBorder>
        <Group p="md" className={classes.withBorderBottom}>
          <Box c="green">
            <IconShieldCheckFilled />
          </Box>
          <Title order={4}>Top Signer</Title>
        </Group>

        <Stack p="lg" mb="sm">
          {signerList.length > 0 ? (
            sortSignerListByTotalRequests.map((signer) => {
              const user = signer.signer_team_member.team_member_user;
              return (
                <Stack key={signer.signer_id}>
                  <Group position="apart">
                    <Group spacing="xs">
                      <Avatar
                        size="sm"
                        radius="xl"
                        src={user.user_avatar ?? null}
                        color={getAvatarColor(
                          Number(`${signer.signer_id.charCodeAt(0)}`)
                        )}
                      >
                        {!user.user_avatar &&
                          `${user.user_first_name[0]}${user.user_last_name[0]}`}
                      </Avatar>
                      <Text
                        weight={500}
                      >{`${user.user_first_name} ${user.user_last_name}`}</Text>
                    </Group>

                    <Badge size="sm" variant="filled" color="dark">
                      Total: {signer.count}
                    </Badge>
                  </Group>
                  <Progress
                    size="xl"
                    radius="lg"
                    color="green"
                    value={(signer.count / signerList.length) * 100}
                    label={`Total: ${signer.count}`}
                  />
                </Stack>
              );
            })
          ) : (
            <Center h={300}>
              <Text size={24} color="dimmed" weight={600}>
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
