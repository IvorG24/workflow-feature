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
import { IconCircleDashed } from "@tabler/icons-react";

type Props = {
  signerList: (RequestWithResponseType["request_signer"][0]["request_signer_signer"] & {
    signer_status: ReceiverStatusType;
  })[];
};

const Signer = ({ signerList }: Props) => {
  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        Signers
      </Title>
      <Stack mt="xl" spacing={0}>
        {signerList.map((signer) => {
          return (
            <Group key={signer.signer_id} noWrap mt="xs">
              <ThemeIcon color="blue" size="xs" radius="xl">
                <IconCircleDashed />
              </ThemeIcon>
              <Text ml="sm" size="sm">
                Will be signed as {signer.signer_action} by{" "}
                {`${signer.signer_team_member.team_member_user.user_first_name} ${signer.signer_team_member.team_member_user.user_last_name}`}
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

export default Signer;
