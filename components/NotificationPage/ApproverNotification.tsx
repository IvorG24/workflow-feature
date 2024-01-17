import { useActiveTeam } from "@/stores/useTeamStore";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { ApproverUnresolvedRequestListType } from "@/utils/types";
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
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { useRouter } from "next/router";
import { RequestListLocalFilter } from "../RequestListPage/RequestListPage";

export type UnresolvedRequestType = {
  request_id: string;
  request_formsly_id: string | null;
  request_jira_id: string | null;
  request_status: string;
  request_signer_status: string;
};

type Props = {
  approverUnresolvedRequestList: ApproverUnresolvedRequestListType[];
};

const ApproverNotification = ({ approverUnresolvedRequestList }: Props) => {
  const router = useRouter();
  const activeTeam = useActiveTeam();
  const [localFilter, setLocalFilter] = useLocalStorage<RequestListLocalFilter>(
    {
      key: "formsly-request-list-filter",
      defaultValue: {
        search: "",
        requestorList: [],
        approverList: [],
        formList: [],
        status: undefined,
        isAscendingSort: false,
        isApproversView: false,
        projectList: [],
        idFilterList: [],
      },
    }
  );

  const withJiraIdColor = "green";
  const withoutJiraIdColor = "yellow";

  const pendingRequestList = approverUnresolvedRequestList.filter(
    (request) =>
      request.request_signer_status === "PENDING" &&
      request.request.request_status === "PENDING"
  );

  const approvedRequestList = approverUnresolvedRequestList.filter(
    (request) => request.request_signer_status === "APPROVED"
  );
  const approvedRequestCount = approvedRequestList.length;
  const approvedRequestWithJiraId = approvedRequestList.filter(
    (request) => request.request.request_jira_id
  );
  const approvedRequestWithoutJiraId = approvedRequestList.filter(
    (request) => request.request.request_jira_id === null
  );

  const progressSections = [
    {
      value: (approvedRequestWithJiraId.length / approvedRequestCount) * 100,
      color: withJiraIdColor,
      label: `${approvedRequestWithJiraId.length}`,
    },
    {
      value: (approvedRequestWithoutJiraId.length / approvedRequestCount) * 100,
      color: withoutJiraIdColor,
      label: `${approvedRequestWithoutJiraId.length}`,
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
    <Card my="md" bg="white">
      <Card.Section px="md" bg="blue">
        <Text color="white">Approver Notification</Text>
      </Card.Section>
      <Stack mt="sm">
        {pendingRequestList.length > 0 && (
          <>
            {" "}
            <Group>
              <Text size="md">
                You have {`(${pendingRequestList.length})`} requests that needs
                approval.
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

        {approvedRequestList.length > 0 && (
          <Box>
            <Group fw={600} mb="sm" position="apart">
              <Text>Your Approved Requests: Jira ID vs. No Jira ID</Text>
              <Text>Total: {approvedRequestList.length}</Text>
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
