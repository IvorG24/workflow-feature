import { deleteRequest } from "@/backend/api/delete";
import { getCommentAttachment, getFileUrl } from "@/backend/api/get";
import { approveOrRejectRequest, cancelRequest } from "@/backend/api/update";
import RequestActionSection from "@/components/RequestPage/RequestActionSection";
import RequestCommentList from "@/components/RequestPage/RequestCommentList";
import RequestDetailsSection from "@/components/RequestPage/RequestDetailsSection";
import RequestSection from "@/components/RequestPage/RequestSection";
import RequestSignerSection from "@/components/RequestPage/RequestSignerSection";
import useRealtimeRequestCommentList from "@/hooks/useRealtimeRequestCommentList";
import useRealtimeRequestJira from "@/hooks/useRealtimeRequestJira";
import useRealtimeRequestSignerList from "@/hooks/useRealtimeRequestSignerList";
import useRealtimeRequestStatus from "@/hooks/useRealtimeRequestStatus";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import {
  useUserProfile,
  useUserTeamMember,
  useUserTeamMemberGroupList,
} from "@/stores/useUserStore";
import { generateSectionWithDuplicateList } from "@/utils/arrayFunctions/arrayFunctions";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  generateJiraCommentPayload,
  generateJiraTicketPayload,
} from "@/utils/functions";
import {
  ConnectedRequestIdList,
  ReceiverStatusType,
  RequestWithResponseType,
} from "@/utils/types";
import { Container, Flex, Group, Stack, Text, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import moment from "moment";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ExportToPdf from "../ExportToPDF/ExportToPdf";
import ConnectedRequestSection from "../RequestPage/ConnectedRequestSections";
import RequisitionCanvassSection from "../RequisitionCanvassPage/RequisitionCanvassSection";
import RequisitionSummary from "../SummarySection/RequisitionSummary";

type Props = {
  request: RequestWithResponseType;
  connectedForm: {
    form_name: string;
    form_id: string;
    form_is_for_every_member: boolean;
    form_is_member: boolean;
    form_is_hidden: boolean;
  }[];
  connectedRequestIDList: ConnectedRequestIdList;
  canvassRequest: string[];
};

export type ApproverDetailsType = {
  name: string;
  jobDescription: string | null;
  status: string;
  date: string | null;
  signature: string | null;
};

const RequisitionRequestPage = ({
  request,
  // connectedForm,
  connectedRequestIDList,
  canvassRequest,
}: Props) => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  const [approverDetails, setApproverDetails] = useState<ApproverDetailsType[]>(
    []
  );
  const [isFetchingApprover, setIsFetchingApprover] = useState(true);
  const [isCashPurchase, setIsCashPurchase] = useState(false);
  // const [currentServerDate, setCurrentServerDate] = useState("");
  const [jiraTicketStatus, setJiraTicketStatus] = useState<string | null>(null);

  const { setIsLoading } = useLoadingActions();
  const teamMember = useUserTeamMember();
  const user = useUserProfile();
  const teamMemberGroupList = useUserTeamMemberGroupList();
  const activeTeam = useActiveTeam();

  useEffect(() => {
    try {
      setIsFetchingApprover(true);

      const fetchApproverDetails = async () => {
        const primarySigner = request.request_signer.find(
          (signer) => signer.request_signer_signer.signer_is_primary_signer
        );
        if (!primarySigner) return;
        const signerWithDateUpdated = request.request_signer
          .filter(
            (signer) =>
              !signer.request_signer_signer.signer_is_primary_signer &&
              signer.request_signer_status_date_updated
          )
          .sort(
            (a, b) =>
              Date.parse(`${a.request_signer_status_date_updated}`) -
              Date.parse(`${b.request_signer_status_date_updated}`)
          );
        const signerWithoutDateUpdated = request.request_signer
          .filter(
            (signer) =>
              !signer.request_signer_signer.signer_is_primary_signer &&
              !signer.request_signer_status_date_updated
          )
          .sort((a, b) => {
            const fullNameA = `${a.request_signer_signer.signer_team_member.team_member_user.user_first_name} ${a.request_signer_signer.signer_team_member.team_member_user.user_last_name}`;
            const fullNameB = `${b.request_signer_signer.signer_team_member.team_member_user.user_first_name} ${b.request_signer_signer.signer_team_member.team_member_user.user_last_name}`;
            return fullNameA.localeCompare(fullNameB);
          });

        const data = await Promise.all(
          [
            primarySigner,
            ...signerWithDateUpdated,
            ...signerWithoutDateUpdated,
          ].map(async (signer) => {
            let signatureUrl: string | null = null;
            if (
              signer.request_signer_status === "APPROVED" &&
              signer.request_signer_signer.signer_team_member.team_member_user
                .user_signature_attachment_id
            ) {
              signatureUrl = await getFileUrl(supabaseClient, {
                path: signer.request_signer_signer.signer_team_member
                  .team_member_user.user_signature_attachment_id,
                bucket: "USER_SIGNATURES",
              });
            }

            return {
              name: `${signer.request_signer_signer.signer_team_member.team_member_user.user_first_name} ${signer.request_signer_signer.signer_team_member.team_member_user.user_last_name}`,
              jobDescription:
                signer.request_signer_signer.signer_team_member.team_member_user
                  .user_job_title,
              status: signer.request_signer_status,
              date: signer.request_signer_status_date_updated,
              signature: signatureUrl,
            };
          })
        );
        setApproverDetails(data);

        // const serverDate = (
        //   await getCurrentDate(supabaseClient)
        // ).toLocaleString();
        // setCurrentServerDate(serverDate);
      };
      if (request) {
        fetchApproverDetails();

        setIsCashPurchase(
          `${request.request_form.form_section[0].section_field[1].field_response[0].request_response}` ===
            `"Cash Purchase - Local Purchase"`
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingApprover(false);
    }
  }, [request]);

  const requestor = request.request_team_member.team_member_user;

  const initialRequestSignerList = request.request_signer.map((signer) => {
    return {
      ...signer.request_signer_signer,
      request_signer_status: signer.request_signer_status as ReceiverStatusType,
      request_signer_status_date_updated:
        signer.request_signer_status_date_updated,
      request_signer_id: signer.request_signer_id,
    };
  });

  const requestJira = useRealtimeRequestJira(supabaseClient, {
    requestId: request.request_id,
    initialRequestJira: {
      id: request.request_jira_id,
      link: request.request_jira_link,
    },
  });

  const requestStatus = useRealtimeRequestStatus(supabaseClient, {
    requestId: request.request_id,
    initialRequestStatus: request.request_status,
  });

  const signerList = useRealtimeRequestSignerList(supabaseClient, {
    requestId: request.request_id,
    initialRequestSignerList,
  });

  const requestCommentList = useRealtimeRequestCommentList(supabaseClient, {
    requestId: request.request_id,
    initialCommentList: request.request_comment,
  });

  const requestDateCreated = new Date(
    request.request_date_created
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const originalSectionList = request.request_form.form_section;
  const sectionWithDuplicateList =
    generateSectionWithDuplicateList(originalSectionList);

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

  // const handleReverseApproval = async () => {
  //   try {
  //     if (!isUserSigner || !teamMember) {
  //       console.error("Signer or team member is undefined");
  //       return;
  //     }
  //     setIsLoading(true);

  //     const serverDate = (
  //       await getCurrentDate(supabaseClient)
  //     ).toLocaleString();

  //     const actionIsWithinFiveMinutes = checkIfTimeIsWithinFiveMinutes(
  //       `${isUserSigner.request_signer_status_date_updated}`,
  //       serverDate
  //     );

  //     if (!actionIsWithinFiveMinutes) {
  //       return notifications.show({
  //         message: "Reversal is beyond the time limit.",
  //         color: "orange",
  //       });
  //     }

  //     const signerFullName = `${isUserSigner.signer_team_member.team_member_user.user_first_name} ${isUserSigner.signer_team_member.team_member_user.user_last_name}`;

  //     await reverseRequestApproval(supabaseClient, {
  //       requestAction: "REVERSED",
  //       requestId: request.request_id,
  //       isPrimarySigner: isUserSigner.signer_is_primary_signer,
  //       requestSignerId: isUserSigner.request_signer_id,
  //       requestOwnerId: request.request_team_member.team_member_user.user_id,
  //       signerFullName: signerFullName,
  //       formName: request.request_form.form_name,
  //       memberId: teamMember.team_member_id,
  //       teamId: request.request_team_member.team_member_team_id,
  //     });
  //   } catch (error) {
  //     notifications.show({
  //       message: "Something went wrong. Please try again later",
  //       color: "red",
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const checkIfSignerCanReverseAction = (isUserSigner: RequestSignerType) => {
  //   if (!isUserSigner) return false;
  //   if (currentServerDate === "") return false;

  //   const actionIsWithinFiveMinutes = checkIfTimeIsWithinFiveMinutes(
  //     `${isUserSigner.request_signer_status_date_updated}`,
  //     currentServerDate
  //   );
  //   const primarySignerStatusIsPending = signerList.find(
  //     (signer) => signer.signer_is_primary_signer
  //   )?.request_signer_status;
  //   const signerStatusIsPending =
  //     isUserSigner.request_signer_status !== "PENDING";

  //   return (
  //     actionIsWithinFiveMinutes &&
  //     primarySignerStatusIsPending &&
  //     signerStatusIsPending
  //   );
  // };

  const handleCreateJiraTicket = async () => {
    try {
      setIsLoading(true);
      if (!request.request_formsly_id) {
        console.warn("formsly_id not found");
        return null;
      }
      const projectName = request.request_project.team_project_name;
      const itemCategory = sectionWithDuplicateList
        .slice(1)
        .map(
          (section) => section.section_field[3].field_response?.request_response
        ) as string[];

      const primaryApproverJiraUserResponse = await fetch(
        `/api/get-jira-user?approverEmail=${user?.user_email}`
      );

      const primaryApproverJiraUserData =
        await primaryApproverJiraUserResponse.json();

      const jiraTicketPayload = generateJiraTicketPayload({
        requestId: request.request_formsly_id,
        requestUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/public-request/${request.request_id}`,
        requestTypeId: "189",
        projectName,
        itemCategory,
        primaryApproverJiraAccountId: primaryApproverJiraUserData[0]
          ? primaryApproverJiraUserData[0].accountId
          : null,
      });

      const jiraTicketResponse = await fetch("/api/create-jira-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jiraTicketPayload),
      });

      const jiraTicketData = await jiraTicketResponse.json();

      if (!jiraTicketResponse.ok) {
        console.error(jiraTicketData.error);
        notifications.show({
          message: jiraTicketData.error,
          color: "red",
        });
        return null;
      }

      if (requestCommentList.length > 0) {
        await handleAddCommentToJiraTicket(jiraTicketData.issueKey);
      }

      return JSON.stringify(jiraTicketData);
    } catch (error) {
      console.error("Failed to create jira ticket", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommentAttachmentList = async () => {
    const commentListWithAttachmentUrl = await Promise.all(
      requestCommentList.map(async (comment) => {
        const commentAttachmentUrlList = await getCommentAttachment(
          supabaseClient,
          { commentId: comment.comment_id }
        );

        return {
          ...comment,
          comment_attachment: commentAttachmentUrlList,
        };
      })
    );
    return commentListWithAttachmentUrl.sort((a, b) => {
      const aDate = moment(a.comment_date_created).valueOf();
      const bDate = moment(b.comment_date_created).valueOf();

      return aDate - bDate;
    });
  };

  const handleAddCommentToJiraTicket = async (jiraTicketKey: string) => {
    try {
      // fetch comments with attachment
      const rfCommentList = await fetchCommentAttachmentList();
      const rfCommentListForJira = generateJiraCommentPayload(rfCommentList);

      const bodyData = {
        body: {
          version: 1,
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Formsly Request Comment List Before Approval",
                  marks: [
                    {
                      type: "strong",
                    },
                  ],
                },
              ],
            },
            ...rfCommentListForJira,
          ],
        },
      };

      const jiraTicketCommentResponse = await fetch(
        `/api/add-comment-to-jira-ticket?jiraTicketKey=${jiraTicketKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyData),
        }
      );

      if (jiraTicketCommentResponse.ok) {
        console.log("Comment added successfully");
      } else {
        console.error("Failed to add comment");
      }
      return jiraTicketCommentResponse;
    } catch (error) {
      console.error("Error:", error);
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
        {!isFetchingApprover && approverDetails.length !== 0 && (
          <Group>
            <ExportToPdf
              request={request}
              sectionWithDuplicateList={sectionWithDuplicateList}
              approverDetails={approverDetails}
            />
            {/* {requestStatus === "APPROVED" ? (
            <Group>
              {connectedForm.map((form) => {
                if (
                  (form.form_is_for_every_member || form.form_is_member) &&
                  form.form_is_hidden === false
                ) {
                  return (
                    <Button
                      key={form.form_id}
                      onClick={() =>
                        router.push(
                          `/team-requests/forms/${form.form_id}/create?requisitionId=${request.request_id}`
                        )
                      }
                      sx={{ flex: 1 }}
                    >
                      Create {form.form_name}
                    </Button>
                  );
                }
              })}
            </Group>
          ) : null} */}
          </Group>
        )}
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

        {canvassRequest.length !== 0 ? (
          <RequisitionCanvassSection canvassRequest={canvassRequest} />
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

        <RequisitionSummary summaryData={sectionWithDuplicateList.slice(1)} />

        {isRequestActionSectionVisible && (
          <RequestActionSection
            handleCancelRequest={handleCancelRequest}
            openPromptDeleteModal={openPromptDeleteModal}
            handleUpdateRequest={handleUpdateRequest}
            isRf
            isCashPurchase={isCashPurchase}
            isUserPrimarySigner={
              isUserSigner
                ? Boolean(isUserSigner.signer_is_primary_signer)
                : false
            }
            isEditable={isEditable}
            canSignerTakeAction={canSignerTakeAction}
            isDeletable={isDeletable}
            isUserRequester={isUserRequester}
            requestId={request.request_id}
            onCreateJiraTicket={handleCreateJiraTicket}
          />
        )}

        {/* {isUserSigner && checkIfSignerCanReverseAction(isUserSigner) ? (
          <RequestReverseActionSection
            handleReverseApproval={handleReverseApproval}
          />
        ) : null} */}

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
      />
    </Container>
  );
};

export default RequisitionRequestPage;
