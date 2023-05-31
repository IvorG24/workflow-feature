import { FormType } from "@/utils/types";
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
  signerList: FormType["form_signer"];
};

const RequestFormSigner = ({ signerList }: Props) => {
  const signerStatusMessage = (action: string, fullname: string) => {
    return `Will be signed as ${action} by ${fullname}`;
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
              <ThemeIcon color="blue" size="xs" radius="xl">
                <IconCircleDashed />
              </ThemeIcon>
              <Text size="sm">
                {signerStatusMessage(
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

export default RequestFormSigner;
