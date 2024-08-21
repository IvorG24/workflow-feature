import { formatDate } from "@/utils/constant";
import { JoyRideNoSSR } from "@/utils/functions";
import { getStatusToColor } from "@/utils/styling";
import { RequestViewRow } from "@/utils/types";
import {
  Badge,
  Button,
  Group,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { IconMaximize, IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/router";

type Props = {
  onlineApplicationData: RequestViewRow;
  isWithNextStep: boolean;
};
const OnlineApplication = ({
  onlineApplicationData,
  isWithNextStep,
}: Props) => {
  const router = useRouter();
  const { colors } = useMantineTheme();

  return (
    <Stack spacing="xl" sx={{ flex: 1 }}>
      <JoyRideNoSSR
        steps={[
          {
            target: ".online-assessment",
            content: (
              <Text>
                You can now continue with the online assessment since your
                online application has been approved. To continue, simply click
                the &ldquo;Create Request&ldquo; button.
              </Text>
            ),
            disableBeacon: true,
          },
        ]}
        run={true}
        hideCloseButton
        disableCloseOnEsc
        disableOverlayClose
        hideBackButton
        styles={{ buttonNext: { backgroundColor: colors.blue[6] } }}
      />
      <Title order={3}>Online Application</Title>
      <Stack>
        <Group>
          <Text>Request ID: </Text>
          <Title order={5}>{onlineApplicationData.request_formsly_id}</Title>
        </Group>
        <Group>
          <Text>Date Created: </Text>
          <Title order={5}>
            {formatDate(
              new Date(onlineApplicationData.request_date_created ?? "")
            )}
          </Title>
        </Group>
        <Group>
          <Text>Status: </Text>
          <Badge
            color={getStatusToColor(onlineApplicationData.request_status ?? "")}
          >
            {onlineApplicationData.request_status}
          </Badge>
          <Text color="dimmed">
            on{" "}
            {formatDate(
              new Date(onlineApplicationData.request_status_date_updated ?? "")
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
                `/user/requests/${onlineApplicationData.request_formsly_id}`,
                "_blank"
              );
            }}
          >
            View Request
          </Button>
        </Group>
        {isWithNextStep && (
          <Group>
            <Text>Next Step: </Text>
            <Button
              rightIcon={<IconPlus size={16} />}
              className="online-assessment"
              onClick={() => {
                router.push(
                  `/public-form/cc410201-f5a6-49ce-a06c-c2ce2c169436/create?onlineApplicationId=${onlineApplicationData.request_formsly_id}`
                );
              }}
            >
              Create Request
            </Button>
          </Group>
        )}
      </Stack>
    </Stack>
  );
};

export default OnlineApplication;
