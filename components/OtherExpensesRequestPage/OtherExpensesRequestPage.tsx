import { deleteRequest } from "@/backend/api/delete";
import {
  getJiraAutomationDataByProjectId,
  getRequestComment,
  getSectionInRequestPage,
} from "@/backend/api/get";
import { approveOrRejectRequest, cancelRequest } from "@/backend/api/update";
import RequestActionSection from "@/components/RequestPage/RequestActionSection";
import RequestCommentList from "@/components/RequestPage/RequestCommentList";
import RequestDetailsSection from "@/components/RequestPage/RequestDetailsSection";
import RequestSection from "@/components/RequestPage/RequestSection";
import RequestSignerSection from "@/components/RequestPage/RequestSignerSection";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import {
  useUserProfile,
  useUserTeamMember,
  useUserTeamMemberGroupList,
} from "@/stores/useUserStore";
import { generateSectionWithDuplicateList } from "@/utils/arrayFunctions/arrayFunctions";
import { formatDate } from "@/utils/constant";
import { createJiraTicket } from "@/utils/jira-api-functions";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  CommentType,
  ReceiverStatusType,
  RequestCommentType,
  RequestWithResponseType,
} from "@/utils/types";
import {
  Accordion,
  Container,
  Flex,
  Group,
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
import ExportToPdfMenu from "../ExportToPDF/ExportToPdfMenu";
import OtherExpensesSummary from "../SummarySection/OtherExpensesSummary";

type Props = {
  request: RequestWithResponseType;
  duplicatableSectionIdList: string[];
};

const OtherExpensesRequestPage = ({
  request,
  duplicatableSectionIdList,
}: Props) => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  const initialRequestSignerList = request.request_signer.map((signer) => {
    return {
      ...signer.request_signer_signer,
      request_signer_status: signer.request_signer_status as ReceiverStatusType,
      request_signer_status_date_updated:
        signer.request_signer_status_date_updated,
      request_signer_id: signer.request_signer_id,
    };
  });

  const [jiraTicketStatus, setJiraTicketStatus] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] = useState(request.request_status);
  const [signerList, setSignerList] = useState(initialRequestSignerList);
  const [requestCommentList, setRequestCommentList] = useState<
    RequestCommentType[]
  >([]);
  const [formSection, setFormSection] = useState(
    generateSectionWithDuplicateList([request.request_form.form_section[0]])
  );

  const [requestJira, setRequestJira] = useState({
    id: request.request_jira_id,
    link: request.request_jira_link,
  });

  const { setIsLoading } = useLoadingActions();
  const teamMember = useUserTeamMember();
  const user = useUserProfile();
  const teamMemberGroupList = useUserTeamMemberGroupList();
  const activeTeam = useActiveTeam();

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
            fieldData: request.request_form.form_section[1].section_field,
          });

          newFields.push(...data);
          index += 5;

          if (index > duplicatableSectionIdList.length) break;
        }

        const uniqueFieldIdList: string[] = [];
        const combinedFieldList: RequestWithResponseType["request_form"]["form_section"][0]["section_field"] =
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
        const newFormSection = [...formSection, ...newSection];

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

  const requestor = request.request_team_member.team_member_user;

  const requestDateCreated = formatDate(new Date(request.request_date_created));

  const handleUpdateRequest = async (
    status: "APPROVED" | "REJECTED",
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
        jiraId,
        jiraLink,
        requestFormslyId: request.request_formsly_id,
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

              request_signer_status: status,

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
      notifications.show({
        message: "Request deleted.",
        color: "green",
      });
      router.push(`/${formatTeamNameToUrlKey(activeTeam.team_name)}/requests`);
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

  const onCreateJiraTicket = async () => {
    try {
      if (!request.request_project_id) {
        notifications.show({
          message: "Project id is not defined.",
          color: "red",
        });
        return { success: false, data: null };
      }

      setIsLoading(true);
      const jiraAutomationData = await getJiraAutomationDataByProjectId(
        supabaseClient,
        { teamProjectId: request.request_project_id }
      );

      if (!jiraAutomationData) {
        notifications.show({
          message: "Error fetching of Jira project and item category data.",
          color: "red",
        });
        return { success: false, data: null };
      }

      const { jiraProjectData, jiraItemCategoryData, jiraOrganizationData } =
        jiraAutomationData;

      const itemCategory = "Other Expenses";

      const itemCategoryMatch = jiraItemCategoryData.find(
        (item) => item.jira_item_category_formsly_label === itemCategory
      );

      if (!jiraProjectData || !itemCategoryMatch) {
        notifications.show({
          message: "Jira project and item category data is missing.",
          color: "red",
        });
        return { success: false, data: null };
      }

      const warehouseAreaLead = jiraProjectData.jira_user_list.filter(
        (user) => user.jira_user_role_label === "WAREHOUSE AREA LEAD"
      )[0];
      const warehouseRepresentative = jiraProjectData.jira_user_list.filter(
        (user) => user.jira_user_role_label === "WAREHOUSE REPRESENTATIVE"
      )[0];
      const warehouseRequestParticipant = jiraProjectData.jira_user_list.filter(
        (user) => user.jira_user_role_label === "WAREHOUSE REQUEST PARTICIPANT"
      );

      const jiraTicketPayload = {
        requestId: request.request_formsly_id,
        requestUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/public-request/${request.request_formsly_id}`,
        requestFormType: request.request_form.form_name,
        requestTypeId: "299",
        jiraProjectSiteId: jiraProjectData.jira_project_jira_id,
        jiraItemCategoryId: itemCategoryMatch.jira_item_category_jira_id,

        warehouseCorporateLeadId: itemCategoryMatch.jira_user_account_jira_id,
        warehouseAreaLeadId: warehouseAreaLead.jira_user_account_jira_id,
        warehouseRepresentativeId:
          warehouseRepresentative.jira_user_account_jira_id,
        warehouseRequestParticipantIdList: warehouseRequestParticipant.map(
          (user) => user.jira_user_account_jira_id
        ),
        jiraItemCategoryLabel: itemCategoryMatch.jira_item_category_jira_label,
        jiraOrganizationId: jiraOrganizationData
          ? jiraOrganizationData.jira_organization_jira_id
          : "",
      };

      const jiraTicketData = await createJiraTicket({
        jiraTicketPayload,
        requestCommentList,
        supabaseClient,
      });

      if (!jiraTicketData.success) {
        return { success: false, data: null };
      }

      if (jiraTicketData.data) {
        setRequestJira({
          id: jiraTicketData.data.jiraTicketKey,
          link: jiraTicketData.data.jiraTicketWebLink,
        });
      }

      return jiraTicketData;
    } catch (error) {
      console.error(error);
      return { success: false, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchJiraTicketStatus = async (requestJiraId: string) => {
      const newJiraTicketData = await fetch(
        `/api/get-jira-ticket?jiraTicketKey=${requestJiraId}`
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
  const isUserRequester = teamMemberGroupList.includes("REQUESTER");

  const isRequestActionSectionVisible =
    canSignerTakeAction || isEditable || isDeletable || isUserRequester;

  return (
    <Container>
      <Flex justify="space-between" rowGap="xs" wrap="wrap">
        <Title order={2} color="dimmed">
          Request
        </Title>
        <Group>
          <ExportToPdfMenu
            isFormslyForm={request.request_form.form_is_formsly_form}
            formName={request.request_form.form_name}
            requestId={request.request_formsly_id ?? request.request_id}
          />
        </Group>
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

        <OtherExpensesSummary
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
            isUserRequester={isUserRequester}
            requestId={request.request_id}
            isItemForm
            onCreateJiraTicket={onCreateJiraTicket}
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

export default OtherExpensesRequestPage;
