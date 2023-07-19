import { getAvatarColor, getStatusToColor } from "@/utils/styling";
import {
  Avatar,
  Badge,
  Group,
  Progress,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { startCase } from "lodash";
import { RequestorAndSignerDataType } from "../Overview";

type RequestorItemProps = {
  requestor: RequestorAndSignerDataType;
  totalRequest: number;
};

const RequestorItem = ({ requestor, totalRequest }: RequestorItemProps) => {
  const statusCount = Object.entries(requestor.request);
  const progressSections = statusCount.map(([key, value]) => ({
    value: (value / totalRequest) * 100,
    color: `${getStatusToColor(key) || "dark"}`,
    tooltip: `${startCase(key)}: ${value}`,
    // label: `${startCase(key)}: ${value}`,
  }));
  const progressSectionsWithoutTotal = progressSections.filter(
    (section) => !section.tooltip.includes("Total")
  );

  return (
    <Stack spacing="xs">
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
        <Tooltip
          label={progressSectionsWithoutTotal.map((section, idx) => (
            <Text key={section.tooltip + idx}>{section.tooltip}</Text>
          ))}
        >
          <Badge size="sm" variant="filled" color="dark">
            Total: {requestor.request.total}
          </Badge>
        </Tooltip>
      </Group>
      <Progress size="md" radius="lg" sections={progressSectionsWithoutTotal} />
    </Stack>
  );
};

export default RequestorItem;
