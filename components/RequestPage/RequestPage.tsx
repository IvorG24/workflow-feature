import { deleteRequest } from "@/backend/api/delete";
import { approveOrRejectRequest, cancelRequest } from "@/backend/api/update";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { TEMP_TEAM_MEMBER_ID, TEMP_USER_ID } from "@/utils/dummyData";
import {
  FormStatusType,
  ReceiverStatusType,
  RequestWithResponseType,
} from "@/utils/types";
import { Container, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useState } from "react";
import RequestActionSection from "./RequestActionSection";
import RequestCommentList from "./RequestCommentList";
import RequestDetailsSection from "./RequestDetailsSection";
import RequestSection from "./RequestSection";
import RequestSingerSection from "./RequestSignerSection";

type Props = {
  request: RequestWithResponseType;
};

const RequestPage = ({ request }: Props) => {
  const supabaseClient = useSupabaseClient();
  console.log(request);

  const { setIsLoading } = useLoadingActions();
  const [requestStatus, setRequestStatus] = useState(request.request_status);
  const requestor = request.request_team_member.team_member_user;
  const sectionList = request.request_form.form_section;
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

  const isUserOwner = requestor.user_id === TEMP_USER_ID;
  const isUserSigner = signerList.find(
    (signer) => signer.signer_team_member.team_member_id === TEMP_TEAM_MEMBER_ID
  );

  const handleUpdateRequest = async (status: "APPROVED" | "REJECTED") => {
    try {
      setIsLoading(true);
      const approver = isUserSigner;
      const approverFullName = `${approver?.signer_team_member.team_member_user.user_first_name} ${approver?.signer_team_member.team_member_user.user_last_name}`;
      if (!approver) {
        notifications.show({
          message: "Invalid approver.",
          color: "red",
        });
        return;
      }

      await approveOrRejectRequest(supabaseClient, {
        requestAction: status,
        requestId: request.request_id,
        isPrimarySigner: approver.signer_is_primary_signer,
        requestSignerId: approver.signer_id,
        requestOwnerId: request.request_team_member_id as string,
        signerFullName: approverFullName,
        formName: request.request_form.form_name,
        memberId: TEMP_TEAM_MEMBER_ID,
      });

      setRequestStatus(status);
      notifications.show({
        title: "Update request successful.",
        message: `You have ${status} this request`,
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
        memberId: TEMP_TEAM_MEMBER_ID,
      });

      setRequestStatus("CANCELED");
      notifications.show({
        title: "Update request successful.",
        message: `You have CANCELED this request`,
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
        message: `You have DELETED this request`,
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
      onCancel: () => console.log("Cancel"),
      onConfirm: async () => await handleDeleteRequest(),
    });

  return (
    <Container>
      <Stack spacing="xl">
        <RequestDetailsSection
          request={request}
          requestor={requestor}
          requestDateCreated={requestDateCreated}
          requestStatus={requestStatus as FormStatusType}
        />

        {sectionList.map((section, index) => {
          const duplicateSectionIdList = section.section_field[0].field_response
            .map(
              (response) => response.request_response_duplicatable_section_id
            )
            .filter((id) => id !== null);
          // if duplicateSectionIdList is empty, use section_id instead
          const newSectionIdList =
            duplicateSectionIdList.length > 0
              ? duplicateSectionIdList
              : [section.section_id];

          return (
            <React.Fragment key={index}>
              {newSectionIdList.map((sectionId) => (
                <RequestSection
                  key={sectionId}
                  duplicateSectionId={sectionId}
                  section={section}
                />
              ))}
            </React.Fragment>
          );
        })}

        <RequestActionSection
          isUserOwner={isUserOwner}
          requestStatus={requestStatus as FormStatusType}
          requestId={request.request_id}
          handleCancelRequest={handleCancelRequest}
          openPromptDeleteModal={openPromptDeleteModal}
          isUserSigner={Boolean(isUserSigner)}
          handleUpdateRequest={handleUpdateRequest}
        />
        <RequestSingerSection signerList={signerList} />
      </Stack>
      <RequestCommentList
        requestData={{
          requestId: request.request_id,
          requestOwnerId: request.request_team_member_id as string,
        }}
        requestCommentList={request.request_comment}
      />
    </Container>
  );
};

export default RequestPage;
