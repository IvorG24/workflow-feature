import { useActiveTeam } from "@/stores/useTeamStore";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  ApproverUnresolvedRequestCountType,
  RequestListFilterValues,
} from "@/utils/types";
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Progress,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { useRouter } from "next/router";

type Props = {
  approverUnresolvedRequestCount: ApproverUnresolvedRequestCountType;
};

const ApproverNotification = ({ approverUnresolvedRequestCount }: Props) => {
  const router = useRouter();
  const activeTeam = useActiveTeam();
  const { colorScheme } = useMantineTheme();
  const [localFilter, setLocalFilter] =
    useLocalStorage<RequestListFilterValues>({
      key: "formsly-request-list-filter",
      defaultValue: {
        search: "",
        requestor: [],
        approver: [],
        form: [],
        status: undefined,
        isAscendingSort: false,
        isApproversView: false,
        project: [],
        idFilter: [],
      },
    });

  const withJiraIdColor = "green";
  const withoutJiraIdColor = "yellow";

  const {
    pendingRequestCount,
    approvedRequestCount: {
      total: totalApprovedRequest,
      withJiraId,
      withoutJiraId,
    },
  } = approverUnresolvedRequestCount;

  const progressSections = [
    {
      value: (withJiraId / totalApprovedRequest) * 100,
      color: withJiraIdColor,
      label: `${withJiraId}`,
    },
    {
      value: (withoutJiraId / totalApprovedRequest) * 100,
      color: withoutJiraIdColor,
      label: `${withoutJiraId}`,
    },
  ];

  const handleResolvePendingRequestList = async () => {
    setLocalFilter({
      ...localFilter,
      isApproversView: true,
    });
    router.push(`/${formatTeamNameToUrlKey(activeTeam.team_name)}/requests`);
  };

  return (
    <Card my="md" bg={colorScheme === "dark" ? "dark.6" : "white"}>
      <Card.Section px="md" bg="blue">
        <Text color="white">Approver Notification</Text>
      </Card.Section>
      <Stack mt="sm">
        {pendingRequestCount > 0 && (
          <>
            {" "}
            <Group>
              <Text size="md">
                You have {pendingRequestCount} requests that needs approval.
              </Text>
              <Button
                size="xs"
                onClick={() => handleResolvePendingRequestList()}
              >
                Resolve
              </Button>
            </Group>
            <Divider />
          </>
        )}

        {totalApprovedRequest > 0 && (
          <Box>
            <Group fw={600} mb="sm" position="apart">
              <Text>Your Approved Requests: Jira ID vs. No Jira ID</Text>
              <Text>Total: {totalApprovedRequest}</Text>
            </Group>
            <Progress radius={0} size={40} sections={progressSections} />
            <Group mt="xs" position="apart">
              <Group spacing={4}>
                <Badge
                  size="xs"
                  variant="filled"
                  radius={0}
                  color={withJiraIdColor}
                />
                <Text>With Jira ID</Text>
              </Group>
              <Group spacing={4}>
                <Badge
                  size="xs"
                  variant="filled"
                  radius={0}
                  color={withoutJiraIdColor}
                />
                <Text>Without Jira ID</Text>
              </Group>
            </Group>
          </Box>
        )}
      </Stack>
    </Card>
  );
};

export default ApproverNotification;
