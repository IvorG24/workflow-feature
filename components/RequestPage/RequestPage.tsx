import { deleteRequest } from "@/backend/api/delete";
import { checkMemberTeamGroup } from "@/backend/api/get";
import { moduleSignerValidation, moduleUpdateSigner } from "@/backend/api/post";
import {
  approveOrRejectRequest,
  cancelRequest,
  updateModuleRequest,
} from "@/backend/api/update";
import useNodeAndForm from "@/hooks/reactflow/useNodeAndForm";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import {
  useUserProfile,
  useUserTeamMember,
  useUserTeamMemberGroupList,
} from "@/stores/useUserStore";
import { generateSectionWithDuplicateList } from "@/utils/arrayFunctions/arrayFunctions";
import { formatDateTime } from "@/utils/constant";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  CommentType,
  FormStatusType,
  ReceiverStatusType,
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
import { useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ExportToPdfMenu from "../ExportToPDF/ExportToPdfMenu";
import ItemSummary from "../SummarySection/ItemSummary";
import RequestActionSection from "./RequestActionSection";
import ModuleRequestActionSection from "./RequestActionSectionModule";
import RequestCommentList from "./RequestCommentList";
import RequestDetailsSection from "./RequestDetailsSection";
import RequestSection from "./RequestSection";
import RequestSignerSection from "./RequestSignerSection";
import RequestSignerSectionModule from "./RequestSignerSectionModule";

type Props = {
  request: RequestWithResponseType;
  isFormslyForm?: boolean;
  isAnon?: boolean;
  type?: "Request" | "Module Request";
  moduleId?: string;
};

const RequestPage = ({
  request,
  isFormslyForm = false,
  isAnon = false,
  moduleId,
  type = "Request",
}: Props) => {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();

  const requestType = type === "Request";
  const moduleRequestId = router.query.moduleRequestId as string;
  const initialRequestSignerList = request.request_signer.map((signer) => {
    return {
      ...signer.request_signer_signer,
      request_signer_status: signer.request_signer_status as ReceiverStatusType,
      request_signer_status_date_updated:
        signer.request_signer_status_date_updated,
      request_signer_id: signer.request_signer_id,
    };
  });

  const user = useUserProfile();
  const teamMember = useUserTeamMember();
  const teamMemberGroupList = useUserTeamMemberGroupList();
  const activeTeam = useActiveTeam();

  const { setIsLoading } = useLoadingActions();
  const pageContentRef = useRef<HTMLDivElement>(null);
  const [isSectionHidden, setIsSectionHidden] = useState(false);
  const [requestStatus, setRequestStatus] = useState(request.request_status);
  const [signerList, setSignerList] = useState(initialRequestSignerList);
  const [requestCommentList, setRequestCommentList] = useState(
    request.request_comment
  );

  const signerTeamGroup = initialRequestSignerList[0].signer_team_group?.map(
    (group) => group.team_group_name
  );

  const isTeamGroup = initialRequestSignerList.some((signer) =>
    signer?.signer_team_group?.some((group) =>
      teamMemberGroupList.includes(group.team_group_name)
    )
  );

  const {
    nextForm,
    targetNodes,
    isEndNode,
    fetchNodeAndForm,
    handleCreateNextForm,
    isNextFormSubmitted,
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

  const requestor = request.request_team_member.team_member_user;

  const requestDateCreated = formatDateTime(request.request_date_created);

  const originalSectionList = request.request_form.form_section;

  const sectionWithDuplicateList =
    generateSectionWithDuplicateList(originalSectionList);

  const handleUpdateRequest = async (status: string) => {
    try {
      if (!teamMember) return;
      setIsLoading(true);
      const signer = isUserSigner;
      const signerFullName = requestType
        ? `${signer?.signer_team_member.team_member_user.user_first_name} ${signer?.signer_team_member.team_member_user.user_last_name}`
        : `${user?.user_first_name} ${user?.user_last_name}`;

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
          break;

        case "Module Request":
          const signerCountCurrentNode =
            request.request_signer[0].request_signer_signer.signer_order;

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

          if (approverTeamGroup) {
            notifications.show({
              message: `Someone in your team approved it already, Please refresh the page`,
              color: "orange",
            });
            return;
          }

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

          if (signerCounting >= signerCountCurrentNode) {
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
    try {
      if (!teamMember) return;
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
        message: "Request canceled",
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
    initialRequestSignerList.every(
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
      nextForm &&
      !isNextFormSubmitted &&
      isUserOwner
    );
  }, [requestType, isEndNode, nextForm, isNextFormSubmitted, isUserOwner]);

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
              Create {nextForm?.form_name} Form
            </Button>
          )}
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

          {/* {connectedRequestIDList ? (
            <ConnectedRequestSection
              connectedRequestIDList={connectedRequestIDList}
            />
          ) : null} */}

          {request.request_form.form_name === "Item" && (
            <>
              <RequestSection
                section={sectionWithDuplicateList[0]}
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
                      {sectionWithDuplicateList.slice(1).map((section, idx) => {
                        if (
                          idx === 0 &&
                          section.section_field[0].field_response
                            ?.request_response === '"null"'
                        )
                          return;

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
            </>
          )}

          {request.request_form.form_name !== "Item" &&
            sectionWithDuplicateList.map((section, idx) => (
              <RequestSection
                key={section.section_id + idx}
                section={section}
                isFormslyForm={isFormslyForm}
                isAnon={isAnon}
                isOnlyWithResponse={request.request_form.form_name === "Subcon"}
              />
            ))}
        </Stack>

        {request.request_form.form_name === "Item" &&
        request.request_form.form_is_formsly_form ? (
          <ItemSummary summaryData={sectionWithDuplicateList.slice(1)} />
        ) : null}

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
            requestSignerId={isUserSigner?.signer_team_member.team_member_id}
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
              requestSignerId={request.request_signer[0].request_signer_id}
              targetNodes={targetNodes ?? []}
            />
          )}
        {requestType ? (
          <RequestSignerSection signerList={signerList} />
        ) : (
          <>
            {!isEndNode && !noNodes && (
              <RequestSignerSectionModule
                signerList={initialRequestSignerList.map((signer) => ({
                  ...signer,
                  request_signer_status_date_updated: null,
                }))}
              />
            )}
          </>
        )}
      </Stack>

      <RequestCommentList
        requestData={{
          requestId: request.request_id,
          requestOwnerId: request.request_team_member.team_member_user.user_id,
          teamId: request.request_team_member.team_member_team_id,
        }}
        workflowNodeData={workflowNodeData ?? []}
        requestCommentList={requestCommentList}
        setRequestCommentList={setRequestCommentList}
      />
    </Container>
  );
};

export default RequestPage;
