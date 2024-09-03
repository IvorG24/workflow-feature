import { formatDate } from "@/utils/constant";
import { getStatusToColor } from "@/utils/styling";
import { BackgroundCheckTableRow } from "@/utils/types";
import { Badge, Group, Stack, Text, Title } from "@mantine/core";

type Props = {
  backgroundCheckData: BackgroundCheckTableRow;
};
const BackgroundCheck = ({ backgroundCheckData }: Props) => {
  return (
    <Stack spacing="xl" sx={{ flex: 1 }}>
      <Title order={3}>Background Check</Title>
      <Stack>
        <Group>
          <Text>Date Created: </Text>
          <Title order={5}>
            {formatDate(
              new Date(backgroundCheckData.background_check_date_created ?? "")
            )}
          </Title>
        </Group>
        <Group>
          <Text>Status: </Text>
          <Badge
            color={getStatusToColor(
              backgroundCheckData.background_check_status ?? ""
            )}
          >
            {backgroundCheckData.background_check_status}
          </Badge>
          {backgroundCheckData.background_check_status_date_updated && (
            <Text color="dimmed">
              on{" "}
              {formatDate(
                new Date(
                  backgroundCheckData.background_check_status_date_updated
                )
              )}
            </Text>
          )}
        </Group>
      </Stack>
    </Stack>
  );
};

export default BackgroundCheck;
