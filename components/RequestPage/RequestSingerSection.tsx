import { ReceiverStatusType, RequestWithResponseType } from "@/utils/types";
import { Badge, Flex, Paper, Stack, Text, Title } from "@mantine/core";
import {
  IconCheck,
  IconCircleCheck,
  IconCircleX,
  IconLoader,
} from "@tabler/icons-react";

type Props = {
  signerList: (RequestWithResponseType["request_signer"][0]["request_signer_signer"] & {
    signer_status: ReceiverStatusType;
  })[];
};

const RequestSingerSection = ({ signerList }: Props) => {
  const signerStatusIcon = (status: ReceiverStatusType) => {
    switch (status) {
      case "APPROVED":
        return (
          <Flex
            align="center"
            p={3}
            justify="center"
            sx={{ backgroundColor: "#51CF66", borderRadius: 100 }}
          >
            <IconCircleCheck color="white" size={16} />
          </Flex>
        );
      case "PENDING":
        return (
          <Flex
            align="center"
            p={3}
            justify="center"
            sx={{ backgroundColor: "#339AF0", borderRadius: 100 }}
          >
            <IconLoader color="white" size={16} />
          </Flex>
        );
      case "REJECTED":
        return (
          <Flex
            align="center"
            p={3}
            justify="center"
            sx={{ backgroundColor: "#FF6B6B", borderRadius: 100 }}
          >
            <IconCircleX color="white" size={16} />
          </Flex>
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
    }
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
              {signerStatusIcon(signer.signer_status)}
              <Text ml="sm" size="sm">
                {signerStatusMessage(
                  signer.signer_status,
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

export default RequestSingerSection;
