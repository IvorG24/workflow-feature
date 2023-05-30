import { FormType } from "@/utils/types";
import { Badge, Flex, Paper, Stack, Text, Title } from "@mantine/core";
import { IconCheck, IconLoader } from "@tabler/icons-react";

type Props = {
  signerList: FormType["form_signer"];
};

const RequestFormSigner = ({ signerList }: Props) => {
  const signerStatusMessage = (action: string, fullname: string) => {
    return `To be ${action} by ${fullname}`;
  };

  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        Signers
      </Title>
      <Stack mt="xl">
        {signerList.map((signer) => {
          return (
            <Flex key={signer.signer_id} align="center">
              <Flex
                align="center"
                p={3}
                justify="center"
                sx={{ backgroundColor: "#339AF0", borderRadius: 100 }}
              >
                <IconLoader color="white" size={16} />
              </Flex>
              <Text ml="sm" size="sm">
                {signerStatusMessage(
                  signer.signer_action,
                  `${signer.signer_team_member.team_member_user.user_first_name} ${signer.signer_team_member.team_member_user.user_last_name}`
                )}
              </Text>
              {signer.signer_is_primary_signer ? (
                <Badge ml="sm" variant="outline">
                  <Flex align="center" justify="center" gap={2}>
                    <IconCheck size={14} />
                    Primary
                  </Flex>
                </Badge>
              ) : null}
            </Flex>
          );
        })}
      </Stack>
    </Paper>
  );
};

export default RequestFormSigner;
