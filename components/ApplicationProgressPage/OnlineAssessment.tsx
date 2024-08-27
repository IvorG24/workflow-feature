import { formatDate } from "@/utils/constant";
import { getStatusToColor } from "@/utils/styling";
import { RequestViewRow } from "@/utils/types";
import { Badge, Button, Group, Stack, Text, Title } from "@mantine/core";
import { IconMaximize } from "@tabler/icons-react";

type Props = {
  onlineAssessmentData: RequestViewRow;
};
const OnlineAssessment = ({ onlineAssessmentData }: Props) => {
  return (
    <Stack spacing="xl" sx={{ flex: 1 }}>
      <Title order={3}>Online Application</Title>
      <Stack>
        <Group>
          <Text>Request ID: </Text>
          <Title order={5}>{onlineAssessmentData.request_formsly_id}</Title>
        </Group>
        <Group>
          <Text>Date Created: </Text>
          <Title order={5}>
            {formatDate(
              new Date(onlineAssessmentData.request_date_created ?? "")
            )}
          </Title>
        </Group>
        <Group>
          <Text>Status: </Text>
          <Badge
            color={getStatusToColor(onlineAssessmentData.request_status ?? "")}
          >
            {onlineAssessmentData.request_status}
          </Badge>
          <Text color="dimmed">
            on{" "}
            {formatDate(
              new Date(onlineAssessmentData.request_status_date_updated ?? "")
            )}
          </Text>
        </Group>
        <Group>
          <Text>Request: </Text>
          <Button
            rightIcon={<IconMaximize size={16} />}
            variant="light"
            onClick={() => {
              window.open(
                `/user/requests/${onlineAssessmentData.request_formsly_id}`,
                "_blank"
              );
            }}
          >
            View Request
          </Button>
        </Group>
      </Stack>
    </Stack>
  );
};

export default OnlineAssessment;
