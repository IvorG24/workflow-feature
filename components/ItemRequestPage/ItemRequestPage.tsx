import { deleteRequest } from "@/backend/api/delete";
import {
  getRequestComment,
  getSectionInItemRequestPage,
} from "@/backend/api/get";
import { approveOrRejectRequest, cancelRequest } from "@/backend/api/update";
import RequestActionSection from "@/components/RequestPage/RequestActionSection";
import RequestDetailsSection from "@/components/RequestPage/RequestDetailsSection";
import RequestSection from "@/components/RequestPage/RequestSection";
import RequestSignerSection from "@/components/RequestPage/RequestSignerSection";
import {
  useJiraItemCategoryData,
  useJiraProjectData,
} from "@/stores/useJiraAutomationData";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import {
  useUserProfile,
  useUserTeamMember,
  useUserTeamMemberGroupList,
} from "@/stores/useUserStore";
import { generateSectionWithDuplicateList } from "@/utils/arrayFunctions/arrayFunctions";
import { formatDate } from "@/utils/constant";
import { mostOccurringElement } from "@/utils/functions";
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
import RequestCommentList from "../RequestPage/RequestCommentList";
import ItemSummary from "../SummarySection/ItemSummary";

type Props = {
  request: RequestWithResponseType;
  duplicatableSectionIdList: string[];
};

const ItemRequestPage = ({ request, duplicatableSectionIdList }: Props) => {
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

  const [jiraTicketStatus, setJiraTicketStatus] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] = useState(request.request_status);
  const [signerList, setSignerList] = useState(initialRequestSignerList);
  const [requestCommentList, setRequestCommentList] = useState<
    RequestCommentType[]
  >([]);
  const [requestJira, setRequestJira] = useState({
    id: request.request_jira_id,
    link: request.request_jira_link,
  });
  const [formSection, setFormSection] = useState(
    generateSectionWithDuplicateList(request.request_form.form_section)
  );

  const teamMember = useUserTeamMember();
  const user = useUserProfile();
  const teamMemberGroupList = useUserTeamMemberGroupList();
  const activeTeam = useActiveTeam();
  const jiraProjectData = useJiraProjectData();
  const jiraItemCategoryData = useJiraItemCategoryData();

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

          const data = await getSectionInItemRequestPage(supabaseClient, {
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

          if (index > duplicatableSectionIdList.length) break;
        }

        const uniqueFieldIdList: string[] = [];
        const combinedFieldList: RequestWithResponseType["request_form"]["form_section"][0]["section_field"] =
          [];
        newFields.map((field) => {
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
    }
  }, []);

  const requestor = request.request_team_member.team_member_user;

  const requestDateCreated = formatDate(new Date(request.request_date_created));

  const handleUpdateRequest = async (
    status: "APPROVED" | "REJECTED",
    jiraId?: string
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

      let autoJiraLink = "";
      const newJiraTicketData = await fetch(
        `/api/get-jira-ticket?jiraTicketKey=${jiraId}`
      );

      if (newJiraTicketData.ok) {
        const jiraTicket = await newJiraTicketData.json();
        const jiraTicketWebLink =
          jiraTicket.fields["customfield_10010"]._links.web;
        autoJiraLink = jiraTicketWebLink;
      }

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
        jiraLink: autoJiraLink,
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
      setIsLoading(true);

      const requestProjectName = request.request_project.team_project_name;
      const jiraProjectMatch = jiraProjectData.find(
        (project) => project.team_project_name === requestProjectName
      );

      const requestItemCategoryList = formSection
        .slice(1)
        .flatMap(({ section_field }) =>
          section_field
            .filter(({ field_name }) => field_name === "GL Account")
            .map(({ field_response }) => field_response?.request_response)
        );

      const itemCategory = JSON.parse(
        mostOccurringElement(requestItemCategoryList as string[])
      );

      const itemCategoryMatch = jiraItemCategoryData.find(
        (item) => item.jira_item_category_formsly_label === itemCategory
      );

      if (!jiraProjectMatch || !itemCategoryMatch) {
        notifications.show({
          message: "Jira project and item category data is missing.",
          color: "red",
        });
        return { success: false, data: null };
      }

      const warehouseAreaLead = jiraProjectMatch.jira_user_list.filter(
        (user) => user.jira_user_role_label === "WAREHOUSE AREA LEAD"
      )[0];
      const warehouseRepresentative = jiraProjectMatch.jira_user_list.filter(
        (user) => user.jira_user_role_label === "WAREHOUSE REPRESENTATIVE"
      )[0];
      const warehouseRequestParticipant =
        jiraProjectMatch.jira_user_list.filter(
          (user) =>
            user.jira_user_role_label === "WAREHOUSE REQUEST PARTICIPANT"
        );

      const jiraTicketPayload = {
        requestId: request.request_formsly_id,
        requestUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/public-request/${request.request_formsly_id}`,
        requestTypeId: "189",
        jiraProjectSiteId: jiraProjectMatch.jira_project_jira_id,
        jiraItemCategoryId: itemCategoryMatch.jira_item_category_jira_id,

        warehouseCorporateLeadId: itemCategoryMatch.jira_user_account_jira_id,
        warehouseAreaLeadId: warehouseAreaLead.jira_user_account_jira_id,
        warehouseRepresentativeId:
          warehouseRepresentative.jira_user_account_jira_id,
        warehouseRequestParticipantIdList: warehouseRequestParticipant.map(
          (user) => user.jira_user_account_jira_id
        ),
      };

      const jiraTicketData = await createJiraTicket({
        jiraTicketPayload,
        jiraItemCategoryLabel: itemCategory,
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
      console.log(error);
      notifications.show({
        message: "Failed to create jira ticket.",
        color: "red",
      });
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
                  Item Section
                </Title>
              </Accordion.Control>
            </Paper>
            <Accordion.Panel>
              <Stack spacing="xl" mt="lg">
                {formSection.slice(2).map((section, idx) => {
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

        {formSection.length > 2 && (
          <ItemSummary
            summaryData={formSection
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
        )}

        {isRequestActionSectionVisible && (
          <RequestActionSection
            handleCancelRequest={handleCancelRequest}
            openPromptDeleteModal={openPromptDeleteModal}
            handleUpdateRequest={handleUpdateRequest}
            isItemForm
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
          requestJiraId: requestJira.id,
        }}
        requestCommentList={requestCommentList}
        setRequestCommentList={setRequestCommentList}
      />
    </Container>
  );
};

export default ItemRequestPage;
