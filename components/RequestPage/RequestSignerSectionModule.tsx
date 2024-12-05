import { formatDate, formatTime } from "@/utils/constant";
import { RequestWithResponseType } from "@/utils/types";
import {
  Badge,
  Chip,
  Flex,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconCircleDashed } from "@tabler/icons-react";

export type RequestSignerType =
  RequestWithResponseType["module_request_signer"];

type Props = {
  signerList: RequestSignerType;
  groupSigners: {
    team_group_id: string;
    team_group_name: string;
  }[];
};

const RequestSignerSectionModule = ({ signerList, groupSigners }: Props) => {
  const getSignerStatusIcon = () => (
    <ThemeIcon color="blue" size="xs" radius="xl">
      <IconCircleDashed />
    </ThemeIcon>
  );

  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        Signers
      </Title>
      <Stack mt="xl" spacing={0}>
        {groupSigners && groupSigners[0].team_group_id !== null
          ? groupSigners.map((groupSigner) => (
              <Flex gap={8} key={groupSigner.team_group_id} align="center">
                {getSignerStatusIcon()}
                <Text size="sm">
                  To be {signerList?.request_action} by the members of Group{" "}
                  {groupSigner.team_group_name}
                </Text>
                <Badge>Primary Signers</Badge>
              </Flex>
            ))
          : signerList &&
            signerList.request_signer_signer.map((signer) => (
              <Group key={signer.request_signer_id} noWrap mt="xs">
                {getSignerStatusIcon()}
                <Text size="sm">
                  {`${signer.request_signer_status},
                by ${signer.signer_team_member.team_member_user.user_first_name} ${signer.signer_team_member.team_member_user.user_last_name} ${
                  signer.request_signer_status_date_updated
                    ? ` (Updated: ${formatDate(
                        new Date(signer.request_signer_status_date_updated)
                      )} ${formatTime(
                        new Date(signer.request_signer_status_date_updated)
                      )})`
                    : ""
                }`}
                </Text>
                <Chip size="xs" variant="outline" checked>
                  Primary
                </Chip>
              </Group>
            ))}
      </Stack>
    </Paper>
  );
};

export default RequestSignerSectionModule;
