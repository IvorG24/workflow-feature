import { deleteRequest } from "@/backend/api/delete";
import {
  getJiraAutomationDataByProjectId,
  getRequestComment,
  getRequestFieldResponse,
  getRequestPageOnLoad,
  getSectionInRequestPage,
} from "@/backend/api/get";
import {
  approveOrRejectRequest,
  cancelRequest,
  updateRequestJiraId,
} from "@/backend/api/update";
import RequestActionSection from "@/components/RequestPage/RequestActionSection";
import RequestDetailsSection from "@/components/RequestPage/RequestDetailsSection";
import RequestSection from "@/components/RequestPage/RequestSection";
import RequestSignerSection from "@/components/RequestPage/RequestSignerSection";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { generateSectionWithDuplicateList } from "@/utils/arrayFunctions/arrayFunctions";
import { formatDate } from "@/utils/constant";
import { safeParse } from "@/utils/functions";
import { createJiraTicket, formatJiraRFPPayload } from "@/utils/jira/functions";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  CommentType,
  JiraFormFieldChoice,
  ReceiverStatusType,
  RequestCommentType,
  RequestWithResponseType,
} from "@/utils/types";
import {
  Accordion,
  Container,
  Flex,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import RequestCommentList from "../RequestPage/RequestCommentList";
import RequestForPaymentCodeSummary from "../SummarySection/RequestForPaymentCodeSummary";

type Props = {
  request: RequestWithResponseType;
  duplicatableSectionIdList: string[];
};

type SectionField =
  RequestWithResponseType["request_form"]["form_section"][0]["section_field"];

const RequestForPaymentCodeRequestPage = ({
  request,
  duplicatableSectionIdList,
}: Props) => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const { setIsLoading } = useLoadingActions();

  const initialRequestSignerList = request.request_signer.map((signer) => {
    return {
      ...signer.request_signer_signer,
      request_signer_status: signer.request_signer_status as ReceiverStatusType,
      request_signer_status_date_updated:
        signer.request_signer_status_date_updated,
      request_signer_id: signer.request_signer_id,
    };
  });
  const [requestStatus, setRequestStatus] = useState(request.request_status);
  const [signerList, setSignerList] = useState(initialRequestSignerList);
  const [requestCommentList, setRequestCommentList] = useState<
    RequestCommentType[]
  >([]);
  const [formSection, setFormSection] = useState(
    generateSectionWithDuplicateList([request.request_form.form_section[0]])
  );
  const [jiraTicketStatus, setJiraTicketStatus] = useState<string | null>(null);
  const [requestJira, setRequestJira] = useState({
    id: request.request_jira_id,
    link: request.request_jira_link,
  });
  const parentLrfRequestId = `${safeParse(
    request.request_form.form_section[0].section_field[0].field_response[0]
      .request_response
  )}`;

  const teamMember = useUserTeamMember();
  const user = useUserProfile();
  const activeTeam = useActiveTeam();

  const requestor = request.request_team_member.team_member_user;
  const requestDateCreated = formatDate(new Date(request.request_date_created));
  const isUserOwner = requestor.user_id === user?.user_id;
  const isUserSigner = signerList.find(
    (signer) =>
      signer.signer_team_member.team_member_id === teamMember?.team_member_id
  );
  const canSignerTakeAction =
    isUserSigner &&
    isUserSigner.request_signer_status === "PENDING" &&
    requestStatus !== "CANCELED";
  const isEditable =
    signerList
      .map((signer) => signer.request_signer_status)
      .filter((status) => status !== "PENDING").length === 0 &&
    isUserOwner &&
    requestStatus === "PENDING";
  const isCancelable = isUserOwner && requestStatus === "PENDING";
  const isDeletable = isUserOwner && requestStatus === "CANCELED";

  const isRequestActionSectionVisible =
    canSignerTakeAction || isEditable || isDeletable;

  const handleUpdateRequest = async (
    status: "APPROVED" | "REJECTED" | string,
    jiraId?: string,
    jiraLink?: string
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
      if (!jiraId || !jiraLink) {
        notifications.show({
          message: "Jira id or jira link is undefined",
          color: "orange",
        });
        return;
      }
      await approveOrRejectRequest(supabaseClient, {
        requestAction: status,
        requestId: request.request_id,
        isPrimarySigner: signer.signer_is_primary_signer,
        requestSignerId: signer.request_signer_id,
        requestOwnerId: request.request_team_member.team_member_user.user_id,
        signerFullName: signerFullName,
        formName: request.request_form.form_name,
        memberId: teamMember.team_member_id,
        teamId: request.request_team_member.team_member_team_id,
        jiraId,
        jiraLink,
        requestFormslyId: request.request_formsly_id,
      });

      // update parent lrf jira id and jira link
      await updateRequestJiraId(supabaseClient, {
        requestId: parentLrfRequestId,
        jiraId,
        jiraLink,
      });

      notifications.show({
        message: `Request ${status.toLowerCase()}.`,
        color: "green",
      });
      setRequestStatus(status);
      setSignerList((prev) =>
        prev.map((thisSigner) => {
          if (signer.signer_id === thisSigner.signer_id) {
            return {
              ...signer,
              request_signer_status: status as ReceiverStatusType,
              request_signer_status_date_updated: new Date().toISOString(),
            };
          }
          return thisSigner;
        })
      );
      setRequestCommentList((prev) => [
        {
          comment_id: uuidv4(),
          comment_date_created: new Date().toISOString(),
          comment_content: `${signerFullName} ${status.toLowerCase()} this request`,
          comment_is_edited: false,
          comment_last_updated: "",
          comment_type: `ACTION_${status.toUpperCase()}` as CommentType,
          comment_team_member_id: signer.signer_team_member.team_member_id,
          comment_team_member: {
            team_member_user: {
              ...signer.signer_team_member.team_member_user,
              user_id: uuidv4(),
              user_username: "",
              user_avatar: "",
            },
          },
          comment_attachment: [],
        },
        ...prev,
      ]);
    } catch (e) {
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
      setRequestCommentList((prev) => [
        {
          comment_id: uuidv4(),
          comment_date_created: new Date().toISOString(),
          comment_content: `Request canceled`,
          comment_is_edited: false,
          comment_last_updated: "",
          comment_type: `ACTION_CANCELED` as CommentType,
          comment_team_member_id: request.request_team_member_id ?? "",
          comment_team_member: {
            team_member_user: {
              ...request.request_team_member.team_member_user,
              user_id: uuidv4(),
              user_username: "",
              user_avatar: "",
            },
          },
          comment_attachment: [],
        },
        ...prev,
      ]);
      notifications.show({
        message: `Request cancelled.`,
        color: "green",
      });
    } catch (e) {
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
      notifications.show({
        message: "Request deleted.",
        color: "green",
      });
      await router.push(
        `/${formatTeamNameToUrlKey(activeTeam.team_name)}/requests`
      );
    } catch (e) {
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

  const onCreateJiraTicket = async () => {
    try {
      if (!request.request_project_id || !user)
        throw new Error("Project id is not defined.");

      setIsLoading(true);
      let obTicket = "";
      let departmentCode = "";
      const [
        jiraAutomationData,
        automationFormResponse,
        { request: rfpRequest },
      ] = await Promise.all([
        getJiraAutomationDataByProjectId(supabaseClient, {
          teamProjectId: request.request_project_id,
        }),
        fetch("/api/jira/get-form?serviceDeskId=23&requestType=337", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }),
        getRequestPageOnLoad(supabaseClient, {
          requestId: parentLrfRequestId,
        }),
      ]);

      if (!jiraAutomationData?.jiraProjectData || !automationFormResponse.ok) {
        throw new Error("Error fetching of jira automation data.");
      }

      const rfpHeaderSectionFieldList = rfpRequest.request_form.form_section[0]
        .section_field as SectionField;

      const rfpPayeeSectionFieldList = rfpRequest.request_form.form_section[1]
        .section_field as SectionField;

      const purposeFieldId = rfpPayeeSectionFieldList.find(
        (field) => field.field_name === "Purpose of Payment"
      )?.field_id;

      const chargeToFieldId = rfpPayeeSectionFieldList.find(
        (field) => field.field_name === "Charge To"
      )?.field_id;

      const obFieldId = rfpPayeeSectionFieldList.find(
        (field) =>
          field.field_name === "Ticket Number of Approved Official Business"
      )?.field_id;

      const payeeSectionFieldResponse = await getRequestFieldResponse(
        supabaseClient,
        {
          requestId: rfpRequest.request_id,
          fieldId: [`${purposeFieldId}`, `${chargeToFieldId}`, `${obFieldId}`],
        }
      );

      const { fields } = await automationFormResponse.json();
      const urgencyList = fields["5"].choices;
      const payeeTypeList = fields["24"].choices;
      const purposeList = fields["13"].choices;
      const chargeToList = fields["18"].choices;

      const requestUrgency = rfpHeaderSectionFieldList.find(
        (field) => field.field_name === "Urgency"
      )?.field_response[0].request_response;

      const requestDepartment =
        rfpHeaderSectionFieldList[1].field_response[0].request_response;

      const requestDepartmentCode = rfpHeaderSectionFieldList.find(
        (field) => field.field_name === "Department Code"
      );

      if (requestDepartmentCode?.field_response[0]) {
        departmentCode = safeParse(
          requestDepartmentCode.field_response[0].request_response
        );
      }

      const requestPayeeType = rfpHeaderSectionFieldList.find(
        (field) => field.field_name === "Payee Type"
      )?.field_response[0].request_response;

      const requestPurpose = payeeSectionFieldResponse.find(
        (field) => field.request_response_field_id === purposeFieldId
      )?.request_response;
      const requestChargeTo = payeeSectionFieldResponse.find(
        (field) => field.request_response_field_id === chargeToFieldId
      )?.request_response;

      if (safeParse(`${requestPurpose}`).toLowerCase() === "ob budget") {
        const requestObTicket = payeeSectionFieldResponse.find(
          (field) => field.request_response_field_id === obFieldId
        )?.request_response;

        obTicket = safeParse(requestObTicket ?? "");
      }

      const costCode = safeParse(
        `${formSection[1].section_field[3].field_response?.request_response}`
      );
      const boqCode = safeParse(
        `${formSection[1].section_field[4].field_response?.request_response}`
      );

      const urgency = urgencyList.find(
        (item: JiraFormFieldChoice) =>
          item.name.trim().toLowerCase() ===
          safeParse(`${requestUrgency}`).toLowerCase()
      );
      const payeeType = payeeTypeList.find(
        (item: JiraFormFieldChoice) =>
          item.name.trim().toLowerCase() ===
          safeParse(`${requestPayeeType}`).toLowerCase()
      );
      const purpose = purposeList.find(
        (item: JiraFormFieldChoice) =>
          item.name.trim().toLowerCase() ===
          safeParse(`${requestPurpose}`).toLowerCase()
      );
      const chargeTo = chargeToList.find(
        (item: JiraFormFieldChoice) =>
          item.name.trim().toLowerCase() ===
          safeParse(`${requestChargeTo}`).toLowerCase()
      );

      if (!urgency || !payeeType || !purpose || !chargeTo) {
        throw new Error("Missing data in jira payload");
      }

      const jiraTicketPayload = formatJiraRFPPayload({
        requestId: request.request_formsly_id,
        requestUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/public-request/${request.request_formsly_id}`,
        jiraProjectSiteId:
          jiraAutomationData.jiraProjectData.jira_project_jira_id,
        department: safeParse(`${requestDepartment}`),
        purpose: purpose.id,
        urgency: urgency.id,
        payeeType: payeeType.id,
        chargeTo: chargeTo.id,
        costCode,
        boqCode,
        departmentCode,
        obTicket,
      });

      const jiraTicket = await createJiraTicket({
        requestType: "Request for Payment",
        formslyId: request.request_formsly_id,
        requestCommentList,
        ticketPayload: jiraTicketPayload,
      });

      if (!jiraTicket.jiraTicketId) {
        throw new Error("Failed to create jira ticket.");
      }

      setRequestJira({
        id: jiraTicket.jiraTicketId,
        link: jiraTicket.jiraTicketLink,
      });
      return jiraTicket;
    } catch (e) {
      const errorMessage = (e as Error).message;
      notifications.show({
        message: `Error: ${errorMessage}`,
        color: "red",
      });
      return { jiraTicketId: "", jiraTicketLink: "" };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    try {
      const fetchSections = async () => {
        const newFields: RequestWithResponseType["request_form"]["form_section"][0]["section_field"] =
          [];

        let index = 0;
        while (1) {
          setIsLoading(true);
          const duplicatableSectionIdCondition = duplicatableSectionIdList
            .slice(index, index + 5)
            .map((dupId) => `'${dupId}'`)
            .join(",");

          const data = await getSectionInRequestPage(supabaseClient, {
            index,
            requestId: request.request_id,
            sectionId: request.request_form.form_section[1].section_id,
            duplicatableSectionIdCondition:
              duplicatableSectionIdCondition.length !== 0
                ? duplicatableSectionIdCondition
                : `'${uuidv4()}'`,
          });
          newFields.push(...data);
          index += 5;

          if (index >= duplicatableSectionIdList.length) break;
        }

        const uniqueFieldIdList: string[] = [];
        const combinedFieldList: RequestWithResponseType["request_form"]["form_section"][1]["section_field"] =
          [];
        newFields.forEach((field) => {
          if (uniqueFieldIdList.includes(field.field_id)) {
            const currentFieldIndex = combinedFieldList.findIndex(
              (combinedField) => combinedField.field_id === field.field_id
            );
            combinedFieldList[currentFieldIndex].field_response.push(
              ...field.field_response
            );
          } else {
            uniqueFieldIdList.push(field.field_id);
            combinedFieldList.push(field);
          }
        });

        const newSection = generateSectionWithDuplicateList([
          {
            ...request.request_form.form_section[1],
            section_field: combinedFieldList,
          },
        ]);

        const formattedSection = newSection
          .map((section) => {
            let sectionOrder = section.section_order;
            const sectionDuplicatableId =
              section.section_field[0].field_response
                ?.request_response_duplicatable_section_id;

            if (sectionDuplicatableId) {
              const sectionIndex = duplicatableSectionIdList.findIndex(
                (id) => id === sectionDuplicatableId
              );

              sectionOrder = sectionIndex + 1;
            } else {
              sectionOrder = 0;
            }

            return {
              ...section,
              section_order: sectionOrder,
            };
          })
          .sort((a, b) => a.section_order - b.section_order);
        const newFormSection = [...formSection, ...formattedSection];

        setFormSection(newFormSection);
        setIsLoading(false);
      };
      const fetchComments = async () => {
        const data = await getRequestComment(supabaseClient, {
          request_id: request.request_id,
        });
        setRequestCommentList(data);
      };
      fetchSections();
      fetchComments();
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchJiraTicketStatus = async (requestJiraId: string) => {
      const newJiraTicketData = await fetch(
        `/api/jira/get-ticket?jiraTicketKey=${requestJiraId}`
      );

      if (newJiraTicketData.ok) {
        const jiraTicket = await newJiraTicketData.json();
        const jiraTicketStatus =
          jiraTicket.fields["customfield_10010"].currentStatus.status;

        setJiraTicketStatus(jiraTicketStatus);
      } else {
        setJiraTicketStatus("Ticket Not Found");
      }
    };

    if (requestJira.id) {
      fetchJiraTicketStatus(requestJira.id);
    }
  }, [requestJira.id]);

  return (
    <Container>
      <Flex justify="space-between" rowGap="xs" wrap="wrap">
        <Title order={2} color="dimmed">
          Request
        </Title>
      </Flex>
      <Stack spacing="xl" mt="xl">
        <RequestDetailsSection
          request={request}
          requestor={requestor}
          requestDateCreated={requestDateCreated}
          requestStatus={requestStatus}
          isPrimarySigner={isUserSigner?.signer_is_primary_signer}
          requestJira={requestJira}
          jiraTicketStatus={jiraTicketStatus}
        />

        <RequestSection
          section={formSection[0]}
          isFormslyForm={true}
          isOnlyWithResponse
        />

        <Accordion>
          <Accordion.Item key="item" value="item">
            <Paper shadow="xs">
              <Accordion.Control>
                <Title order={4} color="dimmed">
                  Request Section
                </Title>
              </Accordion.Control>
            </Paper>
            <Accordion.Panel>
              <Stack spacing="xl" mt="lg">
                {formSection.slice(1).map((section, idx) => {
                  return (
                    <RequestSection
                      key={section.section_id + idx}
                      section={section}
                      isFormslyForm={true}
                      isOnlyWithResponse
                      index={idx + 1}
                    />
                  );
                })}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        {formSection.length > 0 && (
          <RequestForPaymentCodeSummary
            summaryData={formSection
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
        )}

        {isRequestActionSectionVisible && (
          <RequestActionSection
            handleCancelRequest={handleCancelRequest}
            openPromptDeleteModal={openPromptDeleteModal}
            handleUpdateRequest={handleUpdateRequest}
            isUserPrimarySigner={
              isUserSigner
                ? Boolean(isUserSigner.signer_is_primary_signer)
                : false
            }
            isEditable={isEditable}
            isCancelable={isCancelable}
            canSignerTakeAction={canSignerTakeAction}
            isDeletable={isDeletable}
            isUserRequester={false}
            requestId={request.request_id}
            isItemForm
            onCreateJiraTicket={onCreateJiraTicket}
            requestSignerId={isUserSigner?.request_signer_id}
            status={request.request_status}
          />
        )}

        <RequestSignerSection signerList={signerList} />
      </Stack>

      <RequestCommentList
        requestData={{
          requestId: request.request_id,
          requestOwnerId: request.request_team_member.team_member_user.user_id,
          teamId: request.request_team_member.team_member_team_id,
        }}
        requestCommentList={requestCommentList}
        setRequestCommentList={setRequestCommentList}
      />
    </Container>
  );
};

export default RequestForPaymentCodeRequestPage;
