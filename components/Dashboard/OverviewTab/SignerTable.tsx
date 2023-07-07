import { getAvatarColor, getStatusToColor } from "@/utils/styling";
import {
  RequestDashboardOverviewData,
  RequestSignerListType,
} from "@/utils/types";
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
import { lowerCase, startCase } from "lodash";

const useStyles = createStyles(() => ({
  withBorderBottom: {
    borderBottom: "0.0625rem solid #dee2e6",
  },
}));

type SignerTableProps = {
  requestList: RequestDashboardOverviewData[];
};

const getSignerStatusCount = (
  signer: RequestSignerListType,
  status: string
) => {
  switch (lowerCase(status)) {
    case "approved":
      signer.signerCount.approved++;
      break;

    case "rejected":
      signer.signerCount.rejected++;
      break;

    default:
      break;
  }

  return signer;
};

const SignerTable = ({ requestList }: SignerTableProps) => {
  const { classes } = useStyles();
  // get signers
  const signerStatus = ["APPROVED", "REJECTED"];
  const signerList = requestList.flatMap((request) => request.request_signer);
  const filterSignerList = signerList.filter((signer) =>
    signerStatus.includes(signer.request_signer_status)
  );

  const reducedSignerList = filterSignerList.reduce((acc, signer) => {
    const requestStatus = signer.request_signer_status;
    const duplicateSignerIndex = acc.findIndex(
      (d) =>
        d.signer_team_member.team_member_id ===
        signer.request_signer_signer.signer_team_member.team_member_id
    );

    if (duplicateSignerIndex >= 0) {
      const updateRequestor = getSignerStatusCount(
        acc[duplicateSignerIndex],
        requestStatus
      );
      acc[duplicateSignerIndex] = updateRequestor;
    } else {
      const newSigner = {
        ...signer.request_signer_signer,
        signerCount: {
          approved: requestStatus === "APPROVED" ? 1 : 0,
          rejected: requestStatus === "REJECTED" ? 1 : 0,
        },
      };
      acc.push(newSigner);
    }

    return acc;
  }, [] as RequestSignerListType[]);
  const sortSignerListByTotalRequests = reducedSignerList.sort(
    (a, b) =>
      b.signerCount.approved +
      b.signerCount.rejected -
      (a.signerCount.approved - a.signerCount.rejected)
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
          {filterSignerList.length > 0 ? (
            sortSignerListByTotalRequests.map((signer) => {
              const user = signer.signer_team_member.team_member_user;
              const totalSigned =
                signer.signerCount.approved + signer.signerCount.rejected;
              const statusCount = Object.entries(signer.signerCount);
              const progressSections = statusCount.map(([key, value]) => ({
                value: (value / signerList.length) * 100,
                color: `${getStatusToColor(key) || "dark"}`,
                tooltip: `${startCase(key)}: ${value}`,
              }));

              return (
                <Stack key={signer.signer_id} spacing="xs">
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
                      Total: {totalSigned}
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
