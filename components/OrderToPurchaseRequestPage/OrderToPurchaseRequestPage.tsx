import { deleteRequest } from "@/backend/api/delete";
import { approveOrRejectRequest, cancelRequest } from "@/backend/api/update";
import RequestActionSection from "@/components/RequestPage/RequestActionSection";
import RequestCommentList from "@/components/RequestPage/RequestCommentList";
import RequestDetailsSection from "@/components/RequestPage/RequestDetailsSection";
import RequestSection from "@/components/RequestPage/RequestSection";
import RequestSignerSection from "@/components/RequestPage/RequestSignerSection";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import {
  checkIfTwoArrayHaveAtLeastOneEqualElement,
  generateSectionWithDuplicateList,
} from "@/utils/arrayFunctions/arrayFunctions";
import {
  FormStatusType,
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
import { useEffect, useState } from "react";
import ExportToPdf from "../ExportToPDF/ExportToPdf";
import OrderToPurchaseCanvassSection from "../OrderToPurchaseCanvassPage/OrderToPurchaseCanvassSection";
import ConnectedRequestSection from "../RequestPage/ConnectedRequestSections";
import OrderToPurchaseSummary from "../SummarySection/OrderToPurchaseSummary";

type Props = {
  request: RequestWithResponseType;
  connectedForm: {
    form_name: string;
    form_id: string;
    form_group: string[];
    form_is_for_every_member: boolean;
  }[];
  connectedRequestIDList: FormslyFormType;
  canvassRequest: string[];
};

const OrderToPurchaseRequestPage = ({
  request,
  connectedForm,
  connectedRequestIDList,
  canvassRequest,
}: Props) => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  const { setIsLoading } = useLoadingActions();
  const teamMember = useUserTeamMember();
  const user = useUserProfile();

  const [requestStatus, setRequestStatus] = useState(request.request_status);

  const requestor = request.request_team_member.team_member_user;

  const [signerList, setSignerList] = useState(
    request.request_signer.map((signer) => {
      return {
        ...signer.request_signer_signer,
        request_signer_status:
          signer.request_signer_status as ReceiverStatusType,
      };
    })
  );

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
  const isUserPrimarySigner = signerList.find(
    (signer) =>
      signer.signer_team_member.team_member_id === teamMember?.team_member_id &&
      signer.signer_is_primary_signer
  );

  const originalSectionList = request.request_form.form_section;
  const sectionWithDuplicateList =
    generateSectionWithDuplicateList(originalSectionList);

  useEffect(() => {
    setRequestStatus(request.request_status);
  }, [request.request_status]);

  const handleUpdateRequest = async (
    status: "APPROVED" | "REJECTED",
    additionalInfo?: string
  ) => {
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
        additionalInfo: additionalInfo,
      });

      if (signer.signer_is_primary_signer) {
        setRequestStatus(status);
      }

      setSignerList((prev) =>
        prev.map((signerItem) => {
          if (
            signerItem.signer_team_member.team_member_id ===
            teamMember.team_member_id
          ) {
            return {
              ...signer,
              request_signer_status: status,
            };
          } else {
            return signerItem;
          }
        })
      );

      notifications.show({
        message: `Request ${lowerCase(status)}.`,
        color: "green",
      });
      !isUserPrimarySigner && router.reload();
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
      <Flex justify="space-between" rowGap="xs" wrap="wrap">
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
                  form.form_is_for_every_member ||
                  (teamMember?.team_member_group_list &&
                    checkIfTwoArrayHaveAtLeastOneEqualElement(
                      teamMember?.team_member_group_list,
                      form.form_group
                    ))
                ) {
                  if (
                    request.request_additional_info ===
                      "AVAILABLE_INTERNALLY" &&
                    form.form_name === "Receiving Inspecting Report (Sourced)"
                  ) {
                    return (
                      <Button
                        key={form.form_id}
                        onClick={() =>
                          router.push(
                            `/team-requests/forms/${form.form_id}/create?otpId=${request.request_id}`
                          )
                        }
                        sx={{ flex: 1 }}
                      >
                        Create Receiving Inspecting Report
                      </Button>
                    );
                  } else if (
                    request.request_additional_info === "FOR_PURCHASED" &&
                    form.form_name !==
                      "Receiving Inspecting Report (Sourced)" &&
                    form.form_name !== "Sourced Order to Purchase"
                  ) {
                    return (
                      <Button
                        key={form.form_id}
                        onClick={() =>
                          router.push(
                            `/team-requests/forms/${form.form_id}/create?otpId=${request.request_id}`
                          )
                        }
                        sx={{ flex: 1 }}
                      >
                        Create {form.form_name}
                      </Button>
                    );
                  }
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
          requestStatus={requestStatus}
        />

        {canvassRequest.length !== 0 ? (
          <OrderToPurchaseCanvassSection canvassRequest={canvassRequest} />
        ) : null}

        <ConnectedRequestSection
          connectedRequestIDList={connectedRequestIDList}
        />

        {sectionWithDuplicateList.map((section, idx) => {
          if (
            idx === 0 &&
            section.section_field[0].field_response?.request_response ===
              '"null"'
          )
            return;

          return (
            <RequestSection
              key={section.section_id + idx}
              section={section}
              isFormslyForm={true}
              isOnlyWithResponse
            />
          );
        })}

        <OrderToPurchaseSummary
          summaryData={sectionWithDuplicateList
            .slice(2)
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
            handleCancelRequest={handleCancelRequest}
            openPromptDeleteModal={openPromptDeleteModal}
            isUserSigner={Boolean(isUserSigner)}
            handleUpdateRequest={handleUpdateRequest}
            isOTP
            sourcedOtpForm={connectedForm.find(
              (form) => form.form_name === "Sourced Order to Purchase"
            )}
            requestId={request.request_id}
            isUserPrimarySigner={Boolean(isUserPrimarySigner)}
            signer={
              isUserSigner as unknown as RequestWithResponseType["request_signer"][0]
            }
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
