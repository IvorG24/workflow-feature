import { getAvatarColor, getStatusToColor } from "@/utils/styling";
import { RequestorListType } from "@/utils/types";
import { Avatar, Badge, Group, Progress, Stack, Text } from "@mantine/core";
import { startCase } from "lodash";

type RequestorItemProps = {
  requestor: RequestorListType[0];
  totalRequest: number;
};

const RequestorItem = ({ requestor, totalRequest }: RequestorItemProps) => {
  const statusCount = Object.entries(requestor.request);
  const progressSections = statusCount.map(([key, value]) => ({
    value: (value / totalRequest) * 100,
    color: `${getStatusToColor(key) || "dark"}`,
    tooltip: `${startCase(key)} - ${value}`,
    label: `${startCase(key)}: ${value}`,
  }));

  return (
    <Stack key={requestor.user_id}>
      <Group position="apart">
        <Group spacing="xs">
          <Avatar
            size="sm"
            radius="xl"
            src={requestor.user_avatar ?? null}
            color={getAvatarColor(Number(`${requestor.user_id.charCodeAt(0)}`))}
          >
            {!requestor.user_avatar &&
              `${requestor.user_first_name[0]}${requestor.user_last_name[0]}`}
          </Avatar>
          <Text
            weight={500}
          >{`${requestor.user_first_name} ${requestor.user_last_name}`}</Text>
        </Group>
        <Badge size="sm" variant="filled" color="dark">
          Total: {requestor.request.total}
        </Badge>
      </Group>
      <Progress
        size="xl"
        radius="lg"
        sections={progressSections.filter(
          (section) => !section.tooltip.includes("Total")
        )}
      />
    </Stack>
  );
};

export default RequestorItem;
