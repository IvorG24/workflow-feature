import { deleteRequest } from "@/backend/api/delete";
import {
  getJiraAutomationDataByProjectId,
  getRequestComment,
} from "@/backend/api/get";
import {
  approveOrRejectRequest,
  cancelRequest,
  updateRequestJiraId,
} from "@/backend/api/update";
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
import { safeParse } from "@/utils/functions";
import { createJiraTicket, formatJiraWAVPayload } from "@/utils/jira/functions";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  CommentType,
  ReceiverStatusType,
  RequestCommentType,
  RequestWithResponseType,
} from "@/utils/types";
import { Alert, Container, Flex, Stack, Text, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconAlertCircle } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

type Props = {
  request: RequestWithResponseType;
};

const PettyCashVoucherBalanceRequestPage = ({ request }: Props) => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const teamMemberGroupList = useUserTeamMemberGroupList();

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
  const [requestJira, setRequestJira] = useState({
    id: request.request_jira_id,
    link: request.request_jira_link,
  });
  const [jiraTicketStatus, setJiraTicketStatus] = useState<string | null>(null);
  const [invalidCostCode, setInvalidCostCode] = useState(true);
  const { setIsLoading } = useLoadingActions();
  const teamMember = useUserTeamMember();
  const user = useUserProfile();
  const activeTeam = useActiveTeam();

  const requestor = request.request_team_member.team_member_user;

  const requestDateCreated = formatDate(new Date(request.request_date_created));

  const originalSectionList = request.request_form.form_section.slice(0, 2);
  const [sectionWithDuplicateList, setSectionWithDuplicateList] = useState(
    generateSectionWithDuplicateList(originalSectionList)
  );
  const isUserOwner = requestor.user_id === user?.user_id;
  const isUserSigner = signerList.find(
    (signer) =>
      signer.signer_team_member.team_member_id === teamMember?.team_member_id
  );
  const isUserCostEngineer = teamMemberGroupList.includes("COST ENGINEER");
  const canSignerTakeAction =
    isUserSigner &&
    isUserSigner.request_signer_status === "PENDING" &&
    requestStatus !== "CANCELED" &&
    invalidCostCode;
  const isEditable =
    signerList
      .map((signer) => signer.request_signer_status)
      .filter((status) => status !== "PENDING").length === 0 &&
    (isUserOwner || isUserCostEngineer) &&
    requestStatus === "PENDING";
  const isCancelable = isUserOwner && requestStatus === "PENDING";
  const isDeletable = isUserOwner && requestStatus === "CANCELED";

  const isRequestActionSectionVisible =
    canSignerTakeAction || isEditable || isDeletable;

  const parentWavRequestId = safeParse(
    request.request_form.form_section[0].section_field[0].field_response[0]
      .request_response
  );

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

      // update parent lrf jira id and jira link
      await updateRequestJiraId(supabaseClient, {
        requestId: parentWavRequestId,
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
      if (!request.request_project_id || !user) {
        throw new Error("Project id is not defined.");
      }
      setIsLoading(true);

      const [jiraAutomationData, parentWavRequest] = await Promise.all([
        getJiraAutomationDataByProjectId(supabaseClient, {
          teamProjectId: request.request_project_id,
        }),
        supabaseClient.rpc("request_page_on_load", {
          input_data: {
            requestId: parentWavRequestId,
            userId: user.user_id,
          },
        }),
      ]);

      if (!jiraAutomationData?.jiraProjectData || !parentWavRequest) {
        throw new Error(
          "Error fetching of jira project and parent WAV request data."
        );
      }

      const {
        data: { request: wavRequest },
      } = parentWavRequest;

      let approvedOfficialBusiness = "";

      const requestSectionFieldList =
        wavRequest.request_form.form_section[1].section_field;

      const department = safeParse(
        requestSectionFieldList[2].field_response[0].request_response
      );

      const amount = safeParse(
        requestSectionFieldList[5].field_response[0].request_response
      );
      const particulars = safeParse(
        requestSectionFieldList[7].field_response[0].request_response
      );
      const isForOfficialBusiness = Boolean(
        safeParse(requestSectionFieldList[8].field_response[0].request_response)
      );

      if (isForOfficialBusiness) {
        approvedOfficialBusiness = safeParse(
          requestSectionFieldList[9].field_response[0].request_response
        );
      }

      const jiraTicketPayload = formatJiraWAVPayload({
        requestId: wavRequest.request_formsly_id,
        requestUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/public-request/${wavRequest.request_formsly_id}`,
        jiraProjectSiteId:
          jiraAutomationData.jiraProjectData.jira_project_jira_id,
        amount,
        isForOfficialBusiness,
        approvedOfficialBusiness,
        particulars,
        department,
      });

      const jiraTicket = await createJiraTicket({
        requestType: "Working Advance Voucher",
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
    } catch (error) {
      const errorMessage = (error as Error).message;
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
      const costCodeSection = request.request_form.form_section[2];
      if (costCodeSection.section_field[0].field_response.length > 0) {
        const isValidBoqCode =
          safeParse(
            costCodeSection.section_field[0].field_response[0].request_response
          ) !== "TBA";
        const isValidCostCode =
          safeParse(
            costCodeSection.section_field[1].field_response[0].request_response
          ) !== "TBA";

        setInvalidCostCode(isValidBoqCode && isValidCostCode);
        const updatedCostCodeSection = generateSectionWithDuplicateList([
          costCodeSection,
        ])[0];
        setSectionWithDuplicateList((prev) => [
          ...prev,
          updatedCostCodeSection,
        ]);
      } else {
        setSectionWithDuplicateList((prev) =>
          prev.filter((section) => section.section_name !== "Cost Code")
        );
      }

      const fetchComments = async () => {
        const data = await getRequestComment(supabaseClient, {
          request_id: request.request_id,
        });
        setRequestCommentList(data);
      };

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

        {!invalidCostCode && (
          <Alert
            variant="filled"
            color="orange"
            title="Notice for Approvers"
            icon={<IconAlertCircle size={16} />}
          >
            Approval is not possible at this time due to invalid input in the
            cost code section. Please ask the cost engineer to update it. If it
            has already been updated, refresh the page. If the issue continues,
            contact the IT team.
          </Alert>
        )}

        {sectionWithDuplicateList.map((section, idx) => {
          return (
            <RequestSection
              key={section.section_id + idx}
              section={section}
              isFormslyForm={true}
              isOnlyWithResponse
            />
          );
        })}

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
            isEditable={isEditable} // todo: add edit request page
            isCancelable={isCancelable}
            canSignerTakeAction={canSignerTakeAction}
            isDeletable={isDeletable}
            isUserRequester={false} // referencing BOQ is not allowed
            requestId={request.request_id}
            isItemForm
            requestSignerId={isUserSigner?.request_signer_id}
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

export default PettyCashVoucherBalanceRequestPage;