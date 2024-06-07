import { deleteRequest } from "@/backend/api/delete";
import {
  getAllSection,
  getJiraAutomationDataByProjectId,
  getRequestComment,
  getSectionInRequestPageWithMultipleDuplicatableSection,
} from "@/backend/api/get";
import { approveOrRejectRequest, cancelRequest } from "@/backend/api/update";
import RequestActionSection from "@/components/RequestPage/RequestActionSection";
import RequestDetailsSection from "@/components/RequestPage/RequestDetailsSection";
import RequestSection from "@/components/RequestPage/RequestSection";
import RequestSignerSection from "@/components/RequestPage/RequestSignerSection";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { formatDate } from "@/utils/constant";
import { mostOccurringElement, safeParse } from "@/utils/functions";
import { createJiraTicket } from "@/utils/jira-api-functions";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  CommentType,
  DuplicateSectionType,
  FieldTableRow,
  ReceiverStatusType,
  RequestCommentType,
  RequestWithResponseType,
  SectionTableRow,
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

type Props = {
  request: RequestWithResponseType;
  sectionIdWithDuplicatableSectionIdList: {
    request_response_duplicatable_section_id: string;
    section_id: string;
  }[];
};

const PersonnelTransferRequisitionRequestPage = ({
  request,
  sectionIdWithDuplicatableSectionIdList,
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
  const [uniqueSectionList, setUniqueSectionList] = useState<SectionTableRow[]>(
    []
  );

  const [formSection, setFormSection] = useState<DuplicateSectionType[]>([]);

  const teamMember = useUserTeamMember();
  const user = useUserProfile();
  const activeTeam = useActiveTeam();

  useEffect(() => {
    try {
      const fetchSections = async () => {
        const newFields: RequestWithResponseType["request_form"]["form_section"][0]["section_field"] =
          [];
        let index = 0;
        while (1) {
          const duplicatableSectionIdCondition =
            sectionIdWithDuplicatableSectionIdList
              .slice(index, index + 5)
              .map(
                (dupId) =>
                  `(${
                    dupId.request_response_duplicatable_section_id
                      ? `request_response_duplicatable_section_id = '${dupId.request_response_duplicatable_section_id}'`
                      : `request_response_duplicatable_section_id IS NULL`
                  } AND field_section_id = '${dupId.section_id}')`
              )
              .join(" OR ");

          const data =
            await getSectionInRequestPageWithMultipleDuplicatableSection(
              supabaseClient,
              {
                index,
                requestId: request.request_id,
                duplicatableSectionIdCondition,
              }
            );
          newFields.push(...data);
          index += 5;

          if (index > sectionIdWithDuplicatableSectionIdList.length) break;
        }
        const uniqueSectionIdList: string[] = [];
        sectionIdWithDuplicatableSectionIdList.forEach((section) => {
          if (!uniqueSectionIdList.includes(section.section_id)) {
            uniqueSectionIdList.push(section.section_id);
          }
        });
        const sectionList = await getAllSection(supabaseClient, {
          sectionIdList: uniqueSectionIdList,
        });
        setUniqueSectionList(sectionList);

        const newSection = sectionIdWithDuplicatableSectionIdList.map(
          (section) => {
            const sectionMatch = sectionList.find(
              (thisSection) => thisSection.section_id === section.section_id
            );
            return {
              ...sectionMatch,
              section_duplicatable_section_id:
                section.request_response_duplicatable_section_id,
              section_field: [],
            };
          }
        ) as unknown as (DuplicateSectionType & {
          section_duplicatable_section_id: string;
        })[];

        newFields.forEach((field) => {
          const formattedField = field as unknown as FieldTableRow & {
            request_response_duplicatable_section_id: string | null;
          };
          const sectionIndex = newSection.findIndex(
            (section) =>
              section.section_id === field.field_section_id &&
              section.section_duplicatable_section_id ===
                formattedField.request_response_duplicatable_section_id
          );
          newSection[sectionIndex].section_field.push(
            field as unknown as DuplicateSectionType["section_field"][0]
          );
        });

        setFormSection(newSection);
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

      const { jiraProjectData } = jiraAutomationData;

      if (!jiraProjectData) {
        notifications.show({
          message: "Jira project data is missing.",
          color: "red",
        });
        return { success: false, data: null };
      }

      const employeeName =
        request.request_form.form_section[2].section_field[2].field_response[0]
          .request_response;

      const response = await fetch(
        "/api/get-jira-automation-form?serviceDeskId=3&requestType=332",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      const { fields } = await response.json();
      const purposeList = fields["2"].choices;
      const itemList = fields["1"].choices;

      const requestPurpose =
        request.request_form.form_section[0].section_field.find(
          (field) => field.field_name === "Purpose"
        )?.field_response[0].request_response;

      const requestItem = safeParse(
        mostOccurringElement(
          formSection
            .slice(3)
            .map(
              (section) =>
                section.section_field[0].field_response?.request_response ?? ""
            )
        )
      );

      const purpose = purposeList.find(
        (purpose: { id: string; name: string }) =>
          purpose.name.toLowerCase() ===
          safeParse(`${requestPurpose?.toLowerCase()}`)
      );

      const item = itemList.find(
        (item: { id: string; name: string }) =>
          item.name.toLowerCase() === safeParse(`${requestItem?.toLowerCase()}`)
      );

      if (!purpose || !item) {
        notifications.show({
          message: "Jira item or purpose is missing.",
          color: "red",
        });
        return { success: false, data: null };
      }

      const jiraTicketPayload = {
        requestId: request.request_formsly_id,
        requestUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/public-request/${request.request_formsly_id}`,
        requestTypeId: "332",
        jiraProjectSiteId: jiraProjectData.jira_project_jira_id,
        employeeName: safeParse(employeeName),
        purpose: purpose.id,
        item: item.id,
        requestFormType: request.request_form.form_name,
      };

      const jiraTicketData = await createJiraTicket({
        jiraTicketPayload,
        requestCommentList,
        supabaseClient,
        isITAsset: true,
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
  const isUserRequester = false;

  const isRequestActionSectionVisible =
    canSignerTakeAction || isEditable || isDeletable || isUserRequester;

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

        {formSection.length ? (
          <>
            {uniqueSectionList.map((section, idx) => {
              if (!section.section_is_duplicatable) {
                const sectionMatch = formSection.find(
                  (thisSection) => thisSection.section_id === section.section_id
                );
                return (
                  sectionMatch && (
                    <RequestSection
                      key={section.section_id}
                      section={sectionMatch}
                      isFormslyForm={true}
                      isOnlyWithResponse
                      index={idx + 1}
                    />
                  )
                );
              } else {
                const sectionMatch = formSection.filter(
                  (thisSection) => thisSection.section_id === section.section_id
                );

                return (
                  <Accordion key={section.section_id}>
                    <Accordion.Item
                      key={section.section_name}
                      value={section.section_name}
                    >
                      <Paper shadow="xs">
                        <Accordion.Control>
                          <Title order={4} color="dimmed">
                            {section.section_name}
                          </Title>
                        </Accordion.Control>
                      </Paper>
                      <Accordion.Panel>
                        <Stack spacing="xl" mt="lg">
                          {sectionMatch.map((section, sectionIndex) => {
                            return (
                              sectionMatch && (
                                <RequestSection
                                  key={section.section_id + sectionIndex}
                                  section={section}
                                  isFormslyForm={true}
                                  isOnlyWithResponse
                                  index={sectionIndex + 1}
                                />
                              )
                            );
                          })}
                        </Stack>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                );
              }
            })}
          </>
        ) : null}

        {/* {formSection.length > 3 && (
          <ITAssetSummary
            summaryData={formSection
              .slice(3)
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
        )} */}

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
            isEditable={false}
            isCancelable={isCancelable}
            canSignerTakeAction={canSignerTakeAction}
            isDeletable={isDeletable}
            isUserRequester={isUserRequester}
            requestId={request.request_id}
            isItemForm
            onCreateJiraTicket={onCreateJiraTicket}
            requestSignerId={isUserSigner?.request_signer_id}
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

export default PersonnelTransferRequisitionRequestPage;
