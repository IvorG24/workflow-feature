import { deleteRequest } from "@/backend/api/delete";
import { approveOrRejectRequest, cancelRequest } from "@/backend/api/update";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { generateSectionWithDuplicateList } from "@/utils/arrayFunctions/arrayFunctions";
import { FORM_CONNECTION } from "@/utils/constant";
import {
  ConnectedFormsType,
  FormStatusType,
  ReceiverStatusType,
  RequestWithResponseType,
} from "@/utils/types";
import {
  Button,
  Container,
  Flex,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { lowerCase } from "lodash";
import { useRouter } from "next/router";
import { useState } from "react";
import RequestActionSection from "./RequestActionSection";
import RequestCommentList from "./RequestCommentList";
import RequestDetailsSection from "./RequestDetailsSection";
import RequestSection from "./RequestSection";
import RequestSingerSection from "./RequestSignerSection";

type Props = {
  request: RequestWithResponseType;
  isFormslyForm?: boolean;
  connectedFormID?: string;
};

const RequestPage = ({
  request,
  isFormslyForm = false,
  connectedFormID,
}: Props) => {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();

  const user = useUserProfile();
  const teamMember = useUserTeamMember();
  const { setIsLoading } = useLoadingActions();

  const [requestStatus, setRequestStatus] = useState(request.request_status);
  const [signerList, setSignerList] = useState(
    request.request_signer.map((signer) => {
      return {
        ...signer.request_signer_signer,
        signer_status: signer.request_signer_status as ReceiverStatusType,
      };
    })
  );

  const requestor = request.request_team_member.team_member_user;

  const requestDateCreated = new Date(
    request.request_date_created
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isUserOwner = requestor.user_id === user?.user_id;
  const isUserSigner = signerList.find(
    (signer) =>
      signer.signer_team_member.team_member_id === teamMember?.team_member_id
  );

  const originalSectionList = request.request_form.form_section;
  const sectionWithDuplicateList =
    generateSectionWithDuplicateList(originalSectionList);

  const handleUpdateRequest = async (status: "APPROVED" | "REJECTED") => {
    try {
      if (!teamMember) return;
      setIsLoading(true);
      const signer = isUserSigner;
      const signerFullName = `${signer?.signer_team_member.team_member_user.user_first_name} ${signer?.signer_team_member.team_member_user.user_last_name}`;
      if (!signer) {
        notifications.show({
          message: "Invalid signer.",
          color: "orange",
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
        memberId: teamMember?.team_member_id,
        teamId: request.request_team_member.team_member_team_id,
      });

      if (signer.signer_is_primary_signer) {
        setRequestStatus(status);
      }

      setSignerList((prev) =>
        prev.map((signer) => {
          if (signer.signer_id !== signer.signer_id) return signer;
          return {
            ...signer,
            signer_status: status,
          };
        })
      );
      notifications.show({
        message: `Request ${lowerCase(status)}.`,
        color: "green",
      });
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      if (!teamMember) return;
      setIsLoading(true);
      await cancelRequest(supabaseClient, {
        requestId: request.request_id,
        memberId: teamMember.team_member_id,
      });

      setRequestStatus("CANCELED");
      notifications.show({
        message: "Request canceled",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
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
        message: "Request deleted.",
        color: "green",
      });
      router.push("/team-requests/requests");
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
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

  const handleRedirectToConnectedRequest = () => {
    switch (request.request_form.form_name) {
      case "Order to Purchase":
        return router.push(
          `/team-requests/forms/${connectedFormID}/create?otpId=${request.request_id}`
        );
      case "Purchase Order":
        return router.push(
          `/team-requests/forms/${connectedFormID}/create?otpId=${JSON.parse(
            request.request_form.form_section[0].section_field[0]
              .field_response[0].request_response
          )}&poId=${request.request_id}`
        );
      case "Invoice":
        return router.push(
          `/team-requests/forms/${connectedFormID}/create?otpId=${JSON.parse(
            request.request_form.form_section[0].section_field[0]
              .field_response[0].request_response
          )}&poId=${JSON.parse(
            request.request_form.form_section[0].section_field[1]
              .field_response[0].request_response
          )}&invoiceId=${request.request_id}`
        );
      case "Account Payable Voucher":
        return router.push(
          `/team-requests/forms/${connectedFormID}/create?otpId=${JSON.parse(
            request.request_form.form_section[0].section_field[0]
              .field_response[0].request_response
          )}&poId=${JSON.parse(
            request.request_form.form_section[0].section_field[1]
              .field_response[0].request_response
          )}&invoiceId=${JSON.parse(
            request.request_form.form_section[0].section_field[2]
              .field_response[0].request_response
          )}&apvId=${request.request_id}`
        );
    }
  };

  return (
    <Container>
      <Flex justify="space-between">
        <Title order={2} color="dimmed">
          Request
        </Title>
        {connectedFormID && requestStatus === "APPROVED" ? (
          <Group>
            <Button onClick={handleRedirectToConnectedRequest}>
              Create{" "}
              {
                FORM_CONNECTION[
                  request.request_form.form_name as ConnectedFormsType
                ]
              }
            </Button>
          </Group>
        ) : null}
      </Flex>

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
            isFormslyForm={isFormslyForm}
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

export default RequestPage;
