import { useUserTeamMember } from "@/stores/useUserStore";
import { formatDate, formatTime } from "@/utils/constant";
import { ReceiverStatusType, RequestWithResponseType } from "@/utils/types";
import {
  Button,
  Chip,
  Flex,
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
  IconCircleX,
} from "@tabler/icons-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import RequestUpdateSignerModal from "./RequestUpdateSignerModal";

export type RequestSignerType =
  RequestWithResponseType["request_signer"][0]["request_signer_signer"] & {
    request_signer_status: ReceiverStatusType;
    request_signer_status_date_updated: string | null;
    request_signer_id: string;
  };

type Props = {
  signerList: RequestSignerType[];
};

const RequestSignerSection = ({ signerList }: Props) => {
  const allowedRoles = ["OWNER", "ADMIN"];
  const teamMember = useUserTeamMember();
  const isOwnerOrAdmin = allowedRoles.includes(
    `${teamMember?.team_member_role}`
  );
  const [openUpdateSignerModal, setOpenUpdateSignerModal] = useState(false);

  const updateSignerFormMethods = useForm();
  const editableSigners = signerList.filter(
    (signer) => signer.request_signer_status === "PENDING"
  );

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
    }
  };

  const signerStatusMessage = (
    status: ReceiverStatusType,
    action: string,
    fullname: string,
    dateUpdated: string
  ) => {
    switch (status) {
      case "APPROVED":
        return `Signed as ${action} by ${fullname}${
          dateUpdated ? ` (${dateUpdated})` : ""
        }`;
      case "PENDING":
        return `Will be signed as ${action} by ${fullname}`;
      case "REJECTED":
        return `Rejected to signed as ${action} by ${fullname}`;
    }
  };

  const handleCloseUpdateSignerModal = () => {
    setOpenUpdateSignerModal(false);
  };

  return (
    <Paper p="xl" shadow="xs">
      <Flex gap="md" align="center">
        <Title order={4} color="dimmed">
          Signers
        </Title>
        {isOwnerOrAdmin ? (
          <Button
            variant="light"
            onClick={() => setOpenUpdateSignerModal(true)}
          >
            Update Signers
          </Button>
        ) : null}
      </Flex>
      <Stack mt="xl" spacing={0}>
        {signerList.map((signer) => {
          return (
            <Group key={signer.signer_id} noWrap mt="xs">
              {signerStatusIcon(signer.request_signer_status)}
              <Text size="sm">
                {signerStatusMessage(
                  signer.request_signer_status,
                  signer.signer_action.toLowerCase(),
                  `${signer.signer_team_member.team_member_user.user_first_name} ${signer.signer_team_member.team_member_user.user_last_name}`,
                  signer.request_signer_status_date_updated
                    ? `${formatDate(
                        new Date(signer.request_signer_status_date_updated)
                      )} ${formatTime(
                        new Date(signer.request_signer_status_date_updated)
                      )}`
                    : ""
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
      <FormProvider {...updateSignerFormMethods}>
        <RequestUpdateSignerModal
          opened={openUpdateSignerModal}
          onClose={handleCloseUpdateSignerModal}
          initialSignerList={editableSigners}
        />
      </FormProvider>
    </Paper>
  );
};

export default RequestSignerSection;
