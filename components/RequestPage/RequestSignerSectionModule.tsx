import { ReceiverStatusType, RequestWithResponseType } from "@/utils/types";
import {
  Badge,
  Flex,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconCircleDashed } from "@tabler/icons-react";

export type RequestSignerType =
  RequestWithResponseType["request_signer"][0]["request_signer_signer"] & {
    request_signer_status: ReceiverStatusType;
    request_signer_status_date_updated: string | null;
    request_signer_id: string;
  };

type Props = {
  signerList: RequestSignerType[];
};

const RequestSignerSectionModule = ({ signerList }: Props) => {
  const getSignerStatusIcon = () => {
    return (
      <ThemeIcon color="blue" size="xs" radius="xl">
        <IconCircleDashed />
      </ThemeIcon>
    );
  };

  //   const getSignerStatusMessage = (
  //     status: string,
  //     action: string | undefined,
  //     fullname: string | undefined,
  //     dateUpdated: string | null
  //   ) => {
  //     return `Status: ${status}, Action: ${action ?? "unknown action"} by ${
  //       fullname ?? "unknown signer"
  //     }${
  //       dateUpdated
  //         ? ` (${formatDate(new Date(dateUpdated))} ${formatTime(
  //             new Date(dateUpdated)
  //           )})`
  //         : ""
  //     }`;
  //   };

  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        Signers
      </Title>
      <Stack mt="xl" spacing={0}>
        {signerList.map((signer) => (
          <Flex gap={8} key={`${signer.signer_id}-group`} align={"center"}>
            {getSignerStatusIcon()}
            <Text size="sm">
              To be {signerList.map((signer) => signer.signer_action)} by the
              members of Group{" "}
              {signer?.signer_team_group
                ?.map((group) => group.team_group_name)
                .join(", ")}
            </Text>
            <Badge>Primary Signers</Badge>
          </Flex>
        ))}
      </Stack>
    </Paper>
  );
};

export default RequestSignerSectionModule;
