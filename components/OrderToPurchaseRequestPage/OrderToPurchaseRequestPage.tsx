import { deleteRequest } from "@/backend/api/delete";
import { approveOrRejectRequest, cancelRequest } from "@/backend/api/update";
import RequestActionSection from "@/components/RequestPage/RequestActionSection";
import RequestCommentList from "@/components/RequestPage/RequestCommentList";
import RequestDetailsSection from "@/components/RequestPage/RequestDetailsSection";
import RequestSection from "@/components/RequestPage/RequestSection";
import RequestSingerSection from "@/components/RequestPage/RequestSignerSection";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useUserProfile, useUserTeamMemberId } from "@/stores/useUserStore";
import { generateSectionWithDuplicateList } from "@/utils/arrayFunctions";
import {
  FormStatusType,
  ReceiverStatusType,
  RequestWithResponseType,
} from "@/utils/types";
import { Container, Stack, Text, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { lowerCase } from "lodash";
import { useState } from "react";

type Props = {
  request: RequestWithResponseType;
};

const OrderToPurchaseRequestPage = ({ request }: Props) => {
  const supabaseClient = useSupabaseClient();

  const { setIsLoading } = useLoadingActions();
  const teamMemberId = useUserTeamMemberId();
  const user = useUserProfile();

  const [requestStatus, setRequestStatus] = useState(request.request_status);

  const requestor = request.request_team_member.team_member_user;

  const signerList = request.request_signer.map((signer) => {
    return {
      ...signer.request_signer_signer,
      signer_status: signer.request_signer_status as ReceiverStatusType,
    };
  });
  const requestDateCreated = new Date(
    request.request_date_created
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isUserOwner = requestor.user_id === user?.user_id;
  const isUserSigner = signerList.find(
    (signer) => signer.signer_team_member.team_member_id === teamMemberId
  );

  const originalSectionList = request.request_form.form_section;
  const sectionWithDuplicateList =
    generateSectionWithDuplicateList(originalSectionList);

  const handleUpdateRequest = async (status: "APPROVED" | "REJECTED") => {
    try {
      setIsLoading(true);
      const signer = isUserSigner;
      const signerFullName = `${signer?.signer_team_member.team_member_user.user_first_name} ${signer?.signer_team_member.team_member_user.user_last_name}`;
      if (!signer) {
        notifications.show({
          message: "Invalid signer.",
          color: "red",
        });
        return;
      }

      await approveOrRejectRequest(supabaseClient, {
        requestAction: status,
        requestId: request.request_id,
        isPrimarySigner: signer.signer_is_primary_signer,
        requestSignerId: signer.signer_id,
        requestOwnerId: request.request_team_member.team_member_user.user_id,
        signerFullName: signerFullName,
        formName: request.request_form.form_name,
        memberId: teamMemberId,
        teamId: request.request_team_member.team_member_team_id,
      });

      setRequestStatus(status);
      notifications.show({
        title: "Update request successful.",
        message: `You have ${lowerCase(status)} this request`,
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Updating request failed",
        message: `Please try again later.`,
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      setIsLoading(true);
      await cancelRequest(supabaseClient, {
        requestId: request.request_id,
        memberId: teamMemberId,
      });

      setRequestStatus("CANCELED");
      notifications.show({
        title: "Update request successful.",
        message: `You have canceled this request`,
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Updating request failed",
        message: `Please try again later.`,
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRequest = async () => {
    try {
      setIsLoading(true);
      await deleteRequest(supabaseClient, {
        requestId: request.request_id,
      });

      setRequestStatus("DELETED");
      notifications.show({
        title: "Delete request successful.",
        message: `You have deleted this request`,
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Delete request failed.",
        message: `Please try again later.`,
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openPromptDeleteModal = () =>
    modals.openConfirmModal({
      title: "Are you sure you want to delete this request?",
      children: (
        <Text size="sm">
          This action is so important that you are required to confirm it with a
          modal. Please click one of these buttons to proceed.
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      centered: true,
      confirmProps: { color: "red" },
      onConfirm: async () => await handleDeleteRequest(),
    });

  return (
    <Container>
      <Title order={2} color="dimmed">
        Request
      </Title>
      <Stack spacing="xl" mt="xl">
        <RequestDetailsSection
          request={request}
          requestor={requestor}
          requestDateCreated={requestDateCreated}
          requestStatus={requestStatus as FormStatusType}
        />

        {sectionWithDuplicateList.map((section, idx) => (
          <RequestSection
            key={section.section_id + idx}
            section={section}
            isFormslyForm={true}
            isOnlyWithResponse
          />
        ))}

        {(isUserOwner &&
          (requestStatus === "PENDING" || requestStatus === "CANCELED")) ||
        (isUserSigner && requestStatus === "PENDING") ? (
          <RequestActionSection
            isUserOwner={isUserOwner}
            requestStatus={requestStatus as FormStatusType}
            requestId={request.request_id}
            handleCancelRequest={handleCancelRequest}
            openPromptDeleteModal={openPromptDeleteModal}
            isUserSigner={Boolean(isUserSigner)}
            handleUpdateRequest={handleUpdateRequest}
          />
        ) : null}

        <RequestSingerSection signerList={signerList} />
      </Stack>
      <RequestCommentList
        requestData={{
          requestId: request.request_id,
          requestOwnerId: request.request_team_member.team_member_user.user_id,
          teamId: request.request_team_member.team_member_team_id,
        }}
        requestCommentList={request.request_comment}
      />
    </Container>
  );
};

export default OrderToPurchaseRequestPage;
