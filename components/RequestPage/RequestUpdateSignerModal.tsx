import { insertError } from "@/backend/api/post";
import { updateRequesterSigner } from "@/backend/api/update";
import { useIsLoading, useLoadingActions } from "@/stores/useLoadingStore";
import { useTeamMemberList } from "@/stores/useTeamMemberStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { isError } from "@/utils/functions";
import {
  Button,
  Chip,
  Divider,
  Flex,
  Modal,
  Select,
  Stack,
  Textarea,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
import { v4 } from "uuid";
import { RequestSignerType } from "./RequestSignerSection";

type Props = {
  opened: boolean;
  onClose: () => void;
  initialSignerList: RequestSignerType[];
  setSignerList: Dispatch<SetStateAction<RequestSignerType[]>>;
  formId: string;
  projectId: string;
  requestId: string;
};

const RequestUpdateSignerModal = ({
  opened,
  onClose,
  initialSignerList,
  setSignerList,
  formId,
  projectId,
  requestId,
}: Props) => {
  const router = useRouter();

  const teamMember = useUserTeamMember();
  const supabaseClient = createPagesBrowserClient<Database>();
  const signerList = useTeamMemberList("OWNER & APPROVER");
  const signerOptions = signerList.map(
    ({
      team_member_id,
      team_member_user: { user_first_name, user_last_name },
    }) => ({
      value: team_member_id,
      label: `${user_first_name} ${user_last_name}`,
    })
  );
  const [updatedSignerList, setUpdatedSignerList] = useState(initialSignerList);
  const [updateReason, setUpdateReason] = useState("");
  const { setIsLoading } = useLoadingActions();
  const isLoading = useIsLoading();

  const handleMakeSignerPrimary = (signerId: string) => {
    const updatedSignerListWithNewPrimary = updatedSignerList.map((signer) => {
      let currentSigner = signer;
      if (signer.signer_id === signerId) {
        currentSigner = {
          ...currentSigner,
          signer_is_primary_signer: true,
        };
      } else {
        currentSigner = { ...currentSigner, signer_is_primary_signer: false };
      }

      return currentSigner;
    });

    setUpdatedSignerList(updatedSignerListWithNewPrimary);
  };

  const handleSignerChange = (
    signerTeamMemberId: string | null,
    index: number
  ) => {
    if (!signerTeamMemberId) return;
    const prevSignerData = updatedSignerList[index];
    const teamMemberMatch = signerList.find(
      (signer) => signer.team_member_id === signerTeamMemberId
    );

    if (!teamMemberMatch) {
      notifications.show({
        message: "No match found for selected signer. Please contact IT",
        color: "orange",
      });

      return;
    }

    const newSignerData: RequestSignerType = {
      ...prevSignerData,
      signer_id: v4(),
      signer_team_member: {
        ...teamMemberMatch,
        team_member_user: {
          ...teamMemberMatch.team_member_user,
          user_job_title: null,
          user_signature_attachment_id: null,
        },
      },
    };

    setUpdatedSignerList((prev) =>
      prev.map((signer, signerIndex) =>
        signerIndex === index ? newSignerData : signer
      )
    );
  };

  const handleSubmitUpdatedSigner = async () => {
    try {
      setIsLoading(true);
      const withPrimary = updatedSignerList.some(
        (signer) => signer.signer_is_primary_signer
      );
      if (!withPrimary || updatedSignerList.length === 0) {
        notifications.show({
          message: "Primary signer is required.",
          color: "orange",
        });

        return;
      }

      if (!updateReason) {
        notifications.show({
          message: "Please state the reason for the update.",
          color: "orange",
        });

        return;
      }

      const signerListProps = updatedSignerList.map((signer) => ({
        signer_team_member_id: signer.signer_team_member.team_member_id,
        request_signer_id: signer.request_signer_id,
        signer_order: signer.signer_order,
        signer_team_department_id: signer.signer_team_department_id ?? null,
        signer_is_requester_signer:
          signer.signer_is_requester_signer === undefined
            ? false
            : signer.signer_is_requester_signer,
        signer_is_primary_signer: signer.signer_is_primary_signer,
      }));

      const commentContent = {
        team_member_id: `${teamMember?.team_member_id}`,
        content: updateReason,
      };

      await updateRequesterSigner(supabaseClient, {
        formId,
        requestId,
        projectId,
        signerList: signerListProps,
        commentContent,
      });
      setSignerList(updatedSignerList);
      notifications.show({
        message: "Signer update successful.",
        color: "green",
      });
      handleCloseModal();
    } catch (e) {
      if (isError(e)) {
        await insertError(supabaseClient, {
          errorTableRow: {
            error_message: e.message,
            error_url: router.asPath,
            error_function: "handleSubmitUpdatedSigner",
          },
        });
      }
      notifications.show({
        message: "Failed to update request signers.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setUpdatedSignerList(initialSignerList);
    setUpdateReason("");
    onClose();
  };

  return (
    <Modal
      centered
      opened={opened}
      onClose={handleCloseModal}
      withCloseButton={false}
    >
      <Stack p="sm" data-autofocus>
        <Title align="center" order={4}>
          Update Request Signer Form
        </Title>
        {updatedSignerList.map((signer, index) => {
          const signerTeamMemberId = signer.signer_team_member.team_member_id;
          return (
            <Flex key={index} align="center" gap="sm">
              <Select
                value={signerTeamMemberId}
                onChange={(value) => handleSignerChange(value, index)}
                data={signerOptions}
                sx={{ flex: 1 }}
                withinPortal
                searchable
              />
              {signer.signer_is_primary_signer ? (
                <Chip
                  size="xs"
                  variant="outline"
                  checked={signer.signer_is_primary_signer}
                  w={105}
                >
                  Primary
                </Chip>
              ) : (
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => handleMakeSignerPrimary(signer.signer_id)}
                >
                  Make Primary
                </Button>
              )}
            </Flex>
          );
        })}
        <Divider />
        <Textarea
          label="Please state the reason for this update"
          value={updateReason}
          onChange={(e) => setUpdateReason(e.currentTarget.value)}
          required
          autosize
        />
        <Divider />
        <Stack spacing={12}>
          <Button onClick={handleSubmitUpdatedSigner} disabled={isLoading}>
            Submit
          </Button>
          <Button variant="outline" onClick={handleCloseModal}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
};
export default RequestUpdateSignerModal;
