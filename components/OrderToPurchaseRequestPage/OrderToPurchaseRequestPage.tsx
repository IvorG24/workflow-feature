import { deleteRequest } from "@/backend/api/delete";
import { approveOrRejectRequest, cancelRequest } from "@/backend/api/update";
import RequestActionSection from "@/components/RequestPage/RequestActionSection";
import RequestCommentList from "@/components/RequestPage/RequestCommentList";
import RequestDetailsSection from "@/components/RequestPage/RequestDetailsSection";
import RequestSection from "@/components/RequestPage/RequestSection";
import RequestSignerSection from "@/components/RequestPage/RequestSignerSection";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { generateSectionWithDuplicateList } from "@/utils/arrayFunctions";
import { GROUP_CONNECTION } from "@/utils/constant";
import {
  FormStatusType,
  FormslyFormKeyType,
  FormslyFormType,
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
import ExportToPdf from "../ExportToPDF/ExportToPdf";
import ConnectedRequestSection from "../RequestPage/ConnectedRequestSections";
import OrderToPurchaseSummary from "../SummarySection/OrderToPurchaseSummary";

type Props = {
  request: RequestWithResponseType;
  connectedForm: { form_name: string; form_id: string }[];
  connectedRequestIDList: FormslyFormType;
};

const OrderToPurchaseRequestPage = ({
  request,
  connectedForm,
  connectedRequestIDList,
}: Props) => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  const { setIsLoading } = useLoadingActions();
  const teamMember = useUserTeamMember();
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
    (signer) =>
      signer.signer_team_member.team_member_id === teamMember?.team_member_id
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
          color: "orange",
        });
        return;
      }
      if (!teamMember) return;

      await approveOrRejectRequest(supabaseClient, {
        requestAction: status,
        requestId: request.request_id,
        isPrimarySigner: signer.signer_is_primary_signer,
        requestSignerId: signer.signer_id,
        requestOwnerId: request.request_team_member.team_member_user.user_id,
        signerFullName: signerFullName,
        formName: request.request_form.form_name,
        memberId: teamMember.team_member_id,
        teamId: request.request_team_member.team_member_team_id,
      });

      setRequestStatus(status);
      notifications.show({
        message: `Requet ${lowerCase(status)}.`,
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
    if (!teamMember) return;
    try {
      setIsLoading(true);
      await cancelRequest(supabaseClient, {
        requestId: request.request_id,
        memberId: teamMember.team_member_id,
      });

      setRequestStatus("CANCELED");
      notifications.show({
        message: `Request cancelled.`,
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

  return (
    <Container>
      <Flex justify="space-between">
        <Title order={2} color="dimmed">
          Request
        </Title>
        <Group>
          <ExportToPdf
            request={request}
            sectionWithDuplicateList={sectionWithDuplicateList}
          />
          {requestStatus === "APPROVED" ? (
            <Group>
              {connectedForm.map((form) => {
                if (
                  teamMember?.team_member_group_list.includes(
                    GROUP_CONNECTION[form.form_name as FormslyFormKeyType]
                  )
                ) {
                  return (
                    <Button
                      key={form.form_id}
                      onClick={() =>
                        router.push(
                          `/team-requests/forms/${form.form_id}/create?otpId=${request.request_id}`
                        )
                      }
                    >
                      Create {form.form_name}
                    </Button>
                  );
                } else {
                  return null;
                }
              })}
            </Group>
          ) : null}
        </Group>
      </Flex>
      <Stack spacing="xl" mt="xl">
        <RequestDetailsSection
          request={request}
          requestor={requestor}
          requestDateCreated={requestDateCreated}
          requestStatus={requestStatus as FormStatusType}
        />

        <ConnectedRequestSection
          connectedRequestIDList={connectedRequestIDList}
        />

        {sectionWithDuplicateList.map((section, idx) => (
          <RequestSection
            key={section.section_id + idx}
            section={section}
            isFormslyForm={true}
            isOnlyWithResponse
          />
        ))}

        <OrderToPurchaseSummary
          summaryData={sectionWithDuplicateList
            .slice(1)
            .sort((a, b) =>
              `${a.section_field[0].field_response?.request_response}` >
              `${b.section_field[0].field_response?.request_response}`
                ? 1
                : `${b.section_field[0].field_response?.request_response}` >
                  `${a.section_field[0].field_response?.request_response}`
                ? -1
                : 0
            )}
        />

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

        <RequestSignerSection signerList={signerList} />
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
