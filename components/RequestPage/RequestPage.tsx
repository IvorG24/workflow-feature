import { deleteRequest } from "@/backend/api/delete";
import {
  checkQuotationItemQuantity,
  checkRIRItemQuantity,
} from "@/backend/api/get";
import { approveOrRejectRequest, cancelRequest } from "@/backend/api/update";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { generateSectionWithDuplicateList } from "@/utils/arrayFunctions";
import { GROUP_CONNECTION } from "@/utils/constant";
import {
  FormStatusType,
  FormslyFormType,
  ReceiverStatusType,
  RequestWithResponseType,
} from "@/utils/types";
import {
  Box,
  Button,
  Container,
  Flex,
  Group,
  List,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { lowerCase } from "lodash";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import ExportToPdf from "../ExportToPDF/ExportToPdf";
import QuotationSummary from "../SummarySection/QuotationSummary";
import ConnectedRequestSection from "./ConnectedRequestSections";
import RequestActionSection from "./RequestActionSection";
import RequestCommentList from "./RequestCommentList";
import RequestDetailsSection from "./RequestDetailsSection";
import RequestSection from "./RequestSection";
import RequestSignerSection from "./RequestSignerSection";

type Props = {
  request: RequestWithResponseType;
  isFormslyForm?: boolean;
  connectedFormID?: string[];
  connectedRequestIDList?: FormslyFormType;
};

const RequestPage = ({
  request,
  isFormslyForm = false,
  connectedFormID,
  connectedRequestIDList,
}: Props) => {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();

  const user = useUserProfile();
  const teamMember = useUserTeamMember();

  const isGroupMember =
    request.request_form.form_is_formsly_form &&
    request.request_form.form_name === "Quotation" &&
    teamMember?.team_member_group_list.includes(
      GROUP_CONNECTION["Receiving Inspecting Report"]
    );

  const { setIsLoading } = useLoadingActions();
  const pageContentRef = useRef<HTMLDivElement>(null);

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
      if (!isUserSigner) {
        notifications.show({
          message: "Invalid signer.",
          color: "orange",
        });
        return;
      }
      setIsLoading(true);
      const signer = isUserSigner;
      const signerFullName = `${signer?.signer_team_member.team_member_user.user_first_name} ${signer?.signer_team_member.team_member_user.user_last_name}`;

      if (request.request_form.form_is_formsly_form && status === "APPROVED") {
        if (request.request_form.form_name === "Quotation") {
          const otpID =
            request.request_form.form_section[0].section_field[0]
              .field_response[0].request_response;
          const itemSection = request.request_form.form_section[2];

          const warningItemList = await checkQuotationItemQuantity(
            supabaseClient,
            {
              otpID,
              itemFieldId: itemSection.section_field[0].field_id,
              quantityFieldId: itemSection.section_field[2].field_id,
              itemFieldList: itemSection.section_field[0].field_response,
              quantityFieldList: itemSection.section_field[2].field_response,
            }
          );

          if (warningItemList.length !== 0) {
            modals.open({
              title: "You cannot approve create this request.",
              centered: true,
              children: (
                <Box maw={390}>
                  <Title order={5}>
                    There are items that will exceed the quantity limit of the
                    OTP
                  </Title>
                  <List size="sm" mt="md" spacing="xs">
                    {warningItemList.map((item) => (
                      <List.Item key={item}>{item}</List.Item>
                    ))}
                  </List>
                  <Button fullWidth onClick={() => modals.closeAll()} mt="md">
                    Close
                  </Button>
                </Box>
              ),
            });
            return;
          }
        } else if (
          request.request_form.form_name === "Receiving Inspecting Report"
        ) {
          const quotationId =
            request.request_form.form_section[0].section_field[1]
              .field_response[0].request_response;
          const itemSection = request.request_form.form_section[1];

          const warningItemList = await checkRIRItemQuantity(supabaseClient, {
            quotationId,
            itemFieldId: itemSection.section_field[0].field_id,
            quantityFieldId: itemSection.section_field[1].field_id,
            itemFieldList: itemSection.section_field[0].field_response,
            quantityFieldList: itemSection.section_field[1].field_response,
          });

          if (warningItemList.length !== 0) {
            modals.open({
              title: "You cannot approve create this request.",
              centered: true,
              children: (
                <Box maw={390}>
                  <Title order={5}>
                    There are items that will exceed the quantity limit of the
                    Quotation
                  </Title>
                  <List size="sm" mt="md" spacing="xs">
                    {warningItemList.map((item) => (
                      <List.Item key={item}>{item}</List.Item>
                    ))}
                  </List>
                  <Button fullWidth onClick={() => modals.closeAll()} mt="md">
                    Close
                  </Button>
                </Box>
              ),
            });
            return;
          }
        }
      }

      await approveOrRejectRequest(supabaseClient, {
        requestAction: status,
        requestId: request.request_id,
        isPrimarySigner: signer.signer_is_primary_signer,
        requestSignerId: signer.signer_id,
        requestOwnerId: request.request_team_member.team_member_user.user_id,
        signerFullName: signerFullName,
        formName: request.request_form.form_name,
        memberId: `${teamMember?.team_member_id}`,
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
          {connectedFormID && requestStatus === "APPROVED" && isGroupMember ? (
            <Button
              onClick={() => {
                router.push(
                  `/team-requests/forms/${connectedFormID}/create?otpId=${JSON.parse(
                    request.request_form.form_section[0].section_field[0]
                      .field_response[0].request_response
                  )}&quotationId=${request.request_id}`
                );
              }}
            >
              Create Receiving Inspecting Report
            </Button>
          ) : null}
        </Group>
      </Flex>
      <Stack spacing="xl" mt="xl">
        <Stack spacing="xl" ref={pageContentRef}>
          <RequestDetailsSection
            request={request}
            requestor={requestor}
            requestDateCreated={requestDateCreated}
            requestStatus={requestStatus as FormStatusType}
          />

          {connectedRequestIDList ? (
            <ConnectedRequestSection
              connectedRequestIDList={connectedRequestIDList}
            />
          ) : null}

          {sectionWithDuplicateList.map((section, idx) => (
            <RequestSection
              key={section.section_id + idx}
              section={section}
              isFormslyForm={isFormslyForm}
            />
          ))}
        </Stack>

        {request.request_form.form_name === "Quotation" &&
        request.request_form.form_is_formsly_form ? (
          <QuotationSummary
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
        ) : null}

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

export default RequestPage;
