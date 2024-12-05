import { deleteRequest } from "@/backend/api/delete";
import {
    checkMemberTeamGroup,
    getRequestComment,
    getSectionInRequestPage,
} from "@/backend/api/get";
import { moduleSignerValidation, moduleUpdateSigner } from "@/backend/api/post";
import {
    approveOrRejectRequest,
    cancelRequest,
    updateModuleRequest,
} from "@/backend/api/update";
import RequestActionSection from "@/components/RequestPage/RequestActionSection";
import RequestCommentList from "@/components/RequestPage/RequestCommentList";
import RequestDetailsSection from "@/components/RequestPage/RequestDetailsSection";
import RequestSection from "@/components/RequestPage/RequestSection";
import RequestSignerSection from "@/components/RequestPage/RequestSignerSection";
import useNodeAndForm from "@/hooks/reactflow/useNodeAndForm";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import {
    useUserProfile,
    useUserTeamMember,
    useUserTeamMemberGroupList,
} from "@/stores/useUserStore";
import { generateSectionWithDuplicateList } from "@/utils/arrayFunctions/arrayFunctions";
import { BASE_URL, CSI_HIDDEN_FIELDS, formatDateTime } from "@/utils/constant";
import {
    createJiraTicket,
    formatJiraRequisitionPayload,
    getJiraTransitionId,
    getRequisitionAutomationData,
} from "@/utils/jira/functions";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
    CommentType,
    ReceiverStatusType,
    RequestCommentType,
    RequestWithResponseType,
} from "@/utils/types";
import {
    Accordion,
    Button,
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
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ExportToPdfMenu from "../ExportToPDF/ExportToPdfMenu";
import ModuleRequestActionSection from "../RequestPage/RequestActionSectionModule";
import RequestSignerSectionModule from "../RequestPage/RequestSignerSectionModule";
import OtherExpensesSummary from "../SummarySection/OtherExpensesSummary";

type Props = {
  moduleId?: string;
  request: RequestWithResponseType;
  duplicatableSectionIdList: string[];
  type?: "Request" | "Module Request";
};

const OtherExpensesRequestPage = ({
  request,
  duplicatableSectionIdList,
  type = "Request",
  moduleId,
}: Props) => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  const requestType = type === "Request";
  const moduleRequestId = router.query.moduleRequestId as string;

  const initialRequestSignerList = request.request_signer?.map((signer) => {
    return {
      ...signer.request_signer_signer,
      request_signer_status: signer.request_signer_status as ReceiverStatusType,
      request_signer_status_date_updated:
        signer.request_signer_status_date_updated,
      request_signer_id: signer.request_signer_id,
    };
  });

  const [jiraTicketStatus, setJiraTicketStatus] = useState<string | null>(null);
  const [isSectionHidden, setIsSectionHidden] = useState(false);
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

  const signerTeamGroup =
    request.module_request_signer?.request_team_group?.map(
      (group) => group.team_group_name
    );

  const { setIsLoading } = useLoadingActions();
  const teamMember = useUserTeamMember();
  const user = useUserProfile();
  const teamMemberGroupList = useUserTeamMemberGroupList();
  const activeTeam = useActiveTeam();
  const isTeamGroup = request.module_request_signer?.request_team_group?.some(
    (group) => teamMemberGroupList.includes(group.team_group_name)
  );

  const {
    nextForm,
    targetNodes,
    isEndNode,
    fetchNodeAndForm,
    handleCreateNextForm,
    isHidden,
    workflowNodeData,
  } = useNodeAndForm({
    request,
    moduleId: moduleId || "",
    userTeamGroup: teamMemberGroupList,
    isLoading: setIsLoading,
    moduleRequestId: moduleRequestId,
    type,
  });

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
        ]).map((section) => {
          return {
            ...section,
            section_field: section.section_field.filter(
              (field) => !CSI_HIDDEN_FIELDS.includes(field.field_name)
            ),
          };
        });
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

  const requestDateCreated = formatDateTime(request.request_date_created);

  const handleUpdateRequest = async (
    status: string,
    jiraId?: string,
    jiraLink?: string
  ) => {
    try {
      setIsLoading(true);
      const signer = isUserSigner;
      const signerFullName = requestType
        ? `${signer?.signer_team_member.team_member_user.user_first_name} ${signer?.signer_team_member.team_member_user.user_last_name}`
        : `${user?.user_first_name} ${user?.user_last_name}`;

      if (!teamMember) return;
      switch (type) {
        case "Request":
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
            requestSignerId: signer.request_signer_id,
            requestOwnerId:
              request.request_team_member.team_member_user.user_id,
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

                  request_signer_status: status as "APPROVED" | "REJECTED",
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
          break;
        case "Module Request":
          const signerCountCurrentNode =
            request.module_request_signer?.request_module_signer_count;

          const teamGroup = await checkMemberTeamGroup(supabaseClient, {
            memberId: teamMember?.team_member_id ?? "",
            requestId: request.request_id,
            currentStatus: status,
            userGroupData: teamMemberGroupList,
            signerTeamGroups: signerTeamGroup ?? [],
          });

          const approverTeamGroup =
            teamMemberGroupList.length === 0 ||
            teamMemberGroupList.every(
              (groupName) =>
                teamGroup.includes(groupName) ||
                !signerTeamGroup?.includes(groupName)
            );

          const signerCount = await moduleSignerValidation(supabaseClient, {
            requestStatus: status,
            requestId: request.request_id,
          });

          if (approverTeamGroup && signerCount === signerCountCurrentNode) {
            notifications.show({
              message: `Someone in your team approved it already, Please refresh the page`,
              color: "orange",
            });
            return;
          }

          const signerCounting = signerCount + 1;

          await moduleUpdateSigner(supabaseClient, {
            requestAction: status,
            requestStatus: status,
            groupMember: teamMemberGroupList,
            requestId: request.request_id,
            requestSignerId: user?.user_id ?? "",
            signerFullName: signerFullName,
            signerTeamGroups: signerTeamGroup ?? [],
            memberId: `${teamMember?.team_member_id}`,
          });
          signerCount;
          if (
            signerCountCurrentNode !== undefined &&
            signerCounting >= signerCountCurrentNode
          ) {
            setIsSectionHidden(true);
            await updateModuleRequest(supabaseClient, {
              requestAction: status,
              signerTeamGroup: signerTeamGroup ?? [],
              moduleRequestId: moduleRequestId,
              requestStatus: status,
              requestId: request.request_id,
              requestSignerId: user?.user_id ?? "",
              requestOwnerId:
                request.request_team_member.team_member_user.user_id,
              signerFullName: signerFullName,
              formName: request.request_form.form_name,
              memberId: `${teamMember?.team_member_id}`,
              teamId: request.request_team_member.team_member_team_id,
              jiraId,
              jiraLink,
              requestFormslyId: request.request_formsly_id,
            });
            setRequestStatus(status);
            setRequestCommentList((prev) => [
              {
                comment_id: uuidv4(),
                comment_date_created: new Date().toISOString(),
                comment_content: `${signerFullName} ${status} this module request!`,
                comment_is_edited: false,
                comment_last_updated: "",
                comment_type: `ACTION_${status}` as CommentType,
                comment_team_member_id: teamMember.team_member_id,
                comment_team_member: {
                  team_member_user: {
                    user_first_name: user?.user_first_name ?? "",
                    user_last_name: user?.user_last_name ?? "",
                    user_id: uuidv4(),
                    user_username: "",
                    user_avatar: "",
                  },
                },
                comment_attachment: [],
              },
              ...prev,
            ]);

            fetchNodeAndForm();
            notifications.show({
              message: `Module Request updated to ${status.toLowerCase()}.`,
              color: "green",
            });
            router.reload();
          } else {
            setIsSectionHidden(true);
            setRequestCommentList((prev) => [
              {
                comment_id: uuidv4(),
                comment_date_created: new Date().toISOString(),
                comment_content: `${signerFullName} ${status} this module request!`,
                comment_is_edited: false,
                comment_last_updated: "",
                comment_type: `ACTION_${status}` as CommentType,
                comment_team_member_id: teamMember.team_member_id,
                comment_team_member: {
                  team_member_user: {
                    user_first_name: user?.user_first_name ?? "",
                    user_last_name: user?.user_last_name ?? "",
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
              message: `Request ${status.toLowerCase()}.`,
              color: "green",
            });
          }
          break;
      }
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
      if (!request.request_project_id) {
        throw new Error("Project id is not defined.");
      }
      setIsLoading(true);
      const itemCategory = "Other Expenses";
      const requisitionAutomationData = await getRequisitionAutomationData(
        supabaseClient,
        {
          teamProjectId: request.request_project_id,
          itemCategory,
        }
      );
      const jiraTicketPayload = formatJiraRequisitionPayload({
        requestId: request.request_formsly_id,
        requestUrl: `${BASE_URL}/public-request/${request.request_formsly_id}`,
        requestFormType: request.request_form.form_name,
        requestTypeId: "299",
        ...requisitionAutomationData,
      });
      const jiraTicket = await createJiraTicket({
        requestType: "Automated Requisition Form",
        formslyId: request.request_formsly_id,
        requestCommentList,
        ticketPayload: jiraTicketPayload,
        transitionId: getJiraTransitionId(request.request_form.form_name) ?? "",
        organizationId: requisitionAutomationData.jiraOrganizationId,
      });
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

  const isUserOwner = requestor.user_id === user?.user_id;
  const isUserSigner = requestType
    ? signerList.find(
        (signer) =>
          signer.signer_team_member.team_member_id ===
          teamMember?.team_member_id
      )
    : undefined;

  const canSignerTakeAction = requestType
    ? isUserSigner &&
      isUserSigner.request_signer_status === "PENDING" &&
      requestStatus !== "CANCELED"
    : isTeamGroup && !isUserOwner;

  const isEditable =
    initialRequestSignerList?.every(
      (signer) => signer.request_signer_status === "PENDING"
    ) &&
    Boolean(isUserOwner) &&
    requestStatus === "PENDING";

  const isCancelable = Boolean(isUserOwner) && requestStatus === "PENDING";
  const isDeletable = Boolean(isUserOwner) && requestStatus === "CANCELED";
  const isUserRequester = teamMemberGroupList.includes("REQUESTER");

  const isRequestActionSectionVisible = requestType
    ? canSignerTakeAction || isEditable || isDeletable || isUserRequester
    : canSignerTakeAction || isEditable || isDeletable;

  const noNodes = targetNodes?.length === 0;

  const shouldShowCreateFormButton = useMemo(() => {
    return (
      !requestType &&
      isEndNode &&
      nextForm?.request_next_form_name &&
      isUserOwner
    );
  }, [requestType, isEndNode, nextForm, isUserOwner]);

  return (
    <Container>
      <Flex justify="space-between" rowGap="xs" wrap="wrap">
        <Title order={2} color="dimmed">
          {type}
        </Title>
        <Group>
          <ExportToPdfMenu
            isFormslyForm={request.request_form.form_is_formsly_form}
            formName={request.request_form.form_name}
            requestId={request.request_formsly_id ?? request.request_id}
          />
          {shouldShowCreateFormButton && (
            <Button
              leftIcon={<IconPlus size={16} />}
              onClick={handleCreateNextForm}
            >
              Create {nextForm?.request_next_form_name} Form
            </Button>
          )}
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

        {isRequestActionSectionVisible && requestType && (
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

            status={request.request_status}
          />
        )}
        {!requestType &&
          isRequestActionSectionVisible &&
          !isEndNode &&
          !noNodes &&
          !isHidden && (
            <ModuleRequestActionSection
              handleCancelRequest={handleCancelRequest}
              openPromptDeleteModal={openPromptDeleteModal}
              handleUpdateRequest={handleUpdateRequest}
              isItemForm
              isSectionHidden={isSectionHidden}
              isEditable={isEditable}
              isCancelable={isCancelable}
              canSignerTakeAction={canSignerTakeAction}
              isDeletable={isDeletable}
              requestId={request.request_id}
              onCreateJiraTicket={onCreateJiraTicket}
              requestSignerId={request.request_signer[0].request_signer_id}
              targetNodes={targetNodes ?? []}
            />
          )}
        {type === "Request" ? (
          <RequestSignerSection signerList={signerList} />
        ) : (
          <>
            <RequestSignerSectionModule
              groupSigners={
                request.module_request_signer?.request_team_group ?? []
              }
              signerList={request.module_request_signer}
            />
          </>
        )}
      </Stack>

      <RequestCommentList
        workflowNodeData={workflowNodeData ?? []}
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
