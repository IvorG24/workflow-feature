import { ReceiverStatusType, RequestWithResponseType } from "@/utils/types";
import {
  Chip,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconCircleCheck,
  IconCircleDashed,
  IconCircleDotted,
  IconCircleX,
} from "@tabler/icons-react";

type Props = {
  signerList: (RequestWithResponseType["request_signer"][0]["request_signer_signer"] & {
    request_signer_status: ReceiverStatusType;
  })[];
};

const RequestSignerSection = ({ signerList }: Props) => {
  const signerStatusIcon = (status: ReceiverStatusType) => {
    switch (status) {
      case "APPROVED":
        return (
          <ThemeIcon color="green" size="xs" radius="xl">
            <IconCircleCheck />
          </ThemeIcon>
        );
      case "PENDING":
        return (
          <ThemeIcon color="blue" size="xs" radius="xl">
            <IconCircleDashed />
          </ThemeIcon>
        );
      case "REJECTED":
        return (
          <ThemeIcon color="red" size="xs" radius="xl">
            <IconCircleX />
          </ThemeIcon>
        );
      case "PAUSED":
        return (
          <ThemeIcon color="orange" size="xs" radius="xl">
            <IconCircleDotted />
          </ThemeIcon>
        );
    }
  };

  const signerStatusMessage = (
    status: ReceiverStatusType,
    action: string,
    fullname: string
  ) => {
    switch (status) {
      case "APPROVED":
        return `Signed as ${action} by ${fullname}`;
      case "PENDING":
        return `Will be signed as ${action} by ${fullname}`;
      case "REJECTED":
        return `Rejected to signed as ${action} by ${fullname}`;
      case "PAUSED":
        return `${fullname} paused this request`;
    }
  };

  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        Signers
      </Title>
      <Stack mt="xl" spacing={0}>
        {signerList.map((signer) => {
          return (
            <Group key={signer.signer_id} noWrap mt="xs">
              {signerStatusIcon(signer.request_signer_status)}
              <Text size="sm">
                {signerStatusMessage(
                  signer.request_signer_status,
                  signer.signer_action,
                  `${signer.signer_team_member.team_member_user.user_first_name} ${signer.signer_team_member.team_member_user.user_last_name}`
                )}
              </Text>
              {signer.signer_is_primary_signer ? (
                <Chip
                  size="xs"
                  variant="outline"
                  checked={signer.signer_is_primary_signer}
                >
                  Primary
                </Chip>
              ) : null}
            </Group>
          );
        })}
      </Stack>
    </Paper>
  );
};

export default RequestSignerSection;
