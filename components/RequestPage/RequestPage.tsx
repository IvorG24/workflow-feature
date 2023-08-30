import { deleteRequest } from "@/backend/api/delete";
import {
  checkRequisitionQuantity,
  checkRIRItemQuantity,
  checkROItemQuantity,
  checkTransferReceiptItemQuantity,
  getMemberUserData,
} from "@/backend/api/get";
import { approveOrRejectRequest, cancelRequest } from "@/backend/api/update";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { generateSectionWithDuplicateList } from "@/utils/arrayFunctions/arrayFunctions";
import {
  ConnectedRequestIdList,
  FormStatusType,
  ReceiverStatusType,
  RequestProjectSignerStatusType,
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
import { useEffect, useRef, useState } from "react";
import ExportToPdf from "../ExportToPDF/ExportToPdf";
import QuotationSummary from "../SummarySection/QuotationSummary";
import ReceivingInspectingReportSummary from "../SummarySection/ReceivingInspectingReportSummary";
import ReleaseOrderSummary from "../SummarySection/ReleaseOrderSummary";
import SourcedItemSummary from "../SummarySection/SourcedItemSummary";
import TransferReceiptSummary from "../SummarySection/TransferReceiptSummary";
import ConnectedRequestSection from "./ConnectedRequestSections";
import RequestActionSection from "./RequestActionSection";
import RequestCommentList from "./RequestCommentList";
import RequestDetailsSection from "./RequestDetailsSection";
import RequestSection from "./RequestSection";
import RequestSignerSection from "./RequestSignerSection";

type Props = {
  request: RequestWithResponseType;
  isFormslyForm?: boolean;
  connectedFormIdAndGroup?: {
    formId: string;
    formIsForEveryone: boolean;
    formIsMember: boolean;
    formName: string;
  };
  connectedRequestIDList?: ConnectedRequestIdList;
  projectSignerStatus?: RequestProjectSignerStatusType;
};

const RequestPage = ({
  request,
  isFormslyForm = false,
  connectedFormIdAndGroup,
  connectedRequestIDList,
  projectSignerStatus: initialProjectSignerStatus,
}: Props) => {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();

  const user = useUserProfile();
  const teamMember = useUserTeamMember();

  const { setIsLoading } = useLoadingActions();
  const pageContentRef = useRef<HTMLDivElement>(null);

  const [requestStatus, setRequestStatus] = useState(request.request_status);
  const [signerList, setSignerList] = useState(
    request.request_signer.map((signer) => {
      return {
        ...signer.request_signer_signer,
        request_signer_status:
          signer.request_signer_status as ReceiverStatusType,
      };
    })
  );
  const [projectSignerStatus, setProjectSignerStatus] = useState(
    initialProjectSignerStatus || []
  );

  const [requestCommentList, setRequestCommentList] = useState(
    request.request_comment
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

      if (
        request.request_form.form_is_formsly_form &&
        status === "APPROVED" &&
        request.request_status === "PENDING"
      ) {
        if (request.request_form.form_name === "Quotation") {
          const requisitionID =
            request.request_form.form_section[0].section_field[0]
              .field_response[0].request_response;
          const itemSection = request.request_form.form_section[3];

          const warningItemList = await checkRequisitionQuantity(
            supabaseClient,
            {
              requisitionID,
              itemFieldList: itemSection.section_field[0].field_response,
              quantityFieldList: itemSection.section_field[2].field_response,
            }
          );

          if (warningItemList && warningItemList.length !== 0) {
            modals.open({
              title: "You cannot approve create this request.",
              centered: true,
              children: (
                <Box maw={390}>
                  <Title order={5}>
                    There are items that will exceed the quantity limit of the
                    Requisition
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
        } else if (request.request_form.form_name === "Sourced Item") {
          const requisitionID =
            request.request_form.form_section[0].section_field[0]
              .field_response[0].request_response;
          const itemSection = request.request_form.form_section[1];

          const warningItemList = await checkRequisitionQuantity(
            supabaseClient,
            {
              requisitionID,
              itemFieldList: itemSection.section_field[0].field_response,
              quantityFieldList: itemSection.section_field[1].field_response,
            }
          );

          if (warningItemList && warningItemList.length !== 0) {
            modals.open({
              title: "You cannot approve create this request.",
              centered: true,
              children: (
                <Box maw={390}>
                  <Title order={5}>
                    There are items that will exceed the quantity limit of the
                    Requisition
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
          const itemSection = request.request_form.form_section[2];

          const warningItemList = await checkRIRItemQuantity(supabaseClient, {
            quotationId,
            itemFieldId: itemSection.section_field[0].field_id,
            quantityFieldId: itemSection.section_field[1].field_id,
            itemFieldList: itemSection.section_field[0].field_response,
            quantityFieldList: itemSection.section_field[1].field_response,
          });

          if (warningItemList && warningItemList.length !== 0) {
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
        } else if (request.request_form.form_name === "Release Order") {
          const sourcedItemId =
            request.request_form.form_section[0].section_field[1]
              .field_response[0].request_response;
          const itemSection = request.request_form.form_section[1];

          const warningItemList = await checkROItemQuantity(supabaseClient, {
            sourcedItemId,
            itemFieldId: itemSection.section_field[0].field_id,
            quantityFieldId: itemSection.section_field[1].field_id,
            itemFieldList: itemSection.section_field[0].field_response,
            quantityFieldList: itemSection.section_field[1].field_response,
          });

          if (warningItemList && warningItemList.length !== 0) {
            modals.open({
              title: "You cannot approve create this request.",
              centered: true,
              children: (
                <Box maw={390}>
                  <Title order={5}>
                    There are items that will exceed the quantity limit of the
                    Sourced Item
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
        } else if (request.request_form.form_name === "Transfer Receipt") {
          const releaseOrderItemId =
            request.request_form.form_section[0].section_field[2]
              .field_response[0].request_response;
          const itemSection = request.request_form.form_section[2];

          const warningItemList = await checkTransferReceiptItemQuantity(
            supabaseClient,
            {
              releaseOrderItemId,
              itemFieldId: itemSection.section_field[0].field_id,
              quantityFieldId: itemSection.section_field[1].field_id,
              itemFieldList: itemSection.section_field[0].field_response,
              quantityFieldList: itemSection.section_field[1].field_response,
            }
          );

          if (warningItemList && warningItemList.length !== 0) {
            modals.open({
              title: "You cannot approve create this request.",
              centered: true,
              children: (
                <Box maw={390}>
                  <Title order={5}>
                    There are items that will exceed the quantity limit of the
                    Release Order
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
      } else {
        router.reload();
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

      if (
        request.request_form.form_name === "Sourced Item" &&
        request.request_form.form_is_formsly_form
      ) {
        setProjectSignerStatus((signers) => {
          return signers.map((signer) => {
            if (signer.signer_team_member_id === teamMember.team_member_id) {
              return {
                ...signer,
                signer_status: status,
              };
            } else return signer;
          });
        });
      }

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

  const getDirectory = (formId: string, formName: string) => {
    let directory = `/team-requests/forms/${formId}`;
    if (["Quotation", "Sourced Item"].includes(formName)) {
      directory += `/create?requisitionId=${request.request_id}`;
    } else if (formName === "Release Order") {
      directory += `/create?requisitionId=${JSON.parse(
        request.request_form.form_section[0].section_field[0].field_response[0]
          .request_response
      )}&sourcedItemId=${request.request_id}`;
    } else if (formName === "Receiving Inspecting Report") {
      directory += `/create?requisitionId=${JSON.parse(
        request.request_form.form_section[0].section_field[0].field_response[0]
          .request_response
      )}&quotationId=${request.request_id}`;
    } else if (formName === "Transfer Receipt") {
      directory += `/create?requisitionId=${JSON.parse(
        request.request_form.form_section[0].section_field[0].field_response[0]
          .request_response
      )}&sourcedItemId=${JSON.parse(
        request.request_form.form_section[0].section_field[1].field_response[0]
          .request_response
      )}&releaseOrderId=${request.request_id}`;
    }

    return directory;
  };

  useEffect(() => {
    setRequestStatus(request.request_status);
  }, [request.request_status]);

  useEffect(() => {
    const channel = supabaseClient
      .channel("realtime request")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "request_table",
          filter: `request_id=eq.${request.request_id}`,
        },
        (payload) => {
          setRequestStatus(payload.new.request_status);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "request_signer_table",
          filter: `request_signer_request_id=eq.${request.request_id}`,
        },
        (payload) => {
          setSignerList((prev) =>
            prev.map((signer) => {
              if (signer.signer_id === payload.new.request_signer_signer_id) {
                return {
                  ...signer,
                  request_signer_status: payload.new.request_signer_status,
                };
              }
              return signer;
            })
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comment_table",
          filter: `comment_request_id=eq.${request.request_id}`,
        },
        async (payload) => {
          // INSERT comment event
          if (payload.eventType === "INSERT") {
            const teamMemberId = payload.new.comment_team_member_id;
            const comment = payload.new;
            const isUserExisting = requestCommentList.find(
              (comment) => comment.comment_team_member_id === teamMemberId
            );
            if (isUserExisting) {
              const { comment_team_member } = isUserExisting;
              const newComment = { ...comment, comment_team_member };
              setRequestCommentList((prev) => [
                newComment as RequestWithResponseType["request_comment"][0],
                ...prev,
              ]);
            } else {
              const comment_team_member = await getMemberUserData(
                supabaseClient,
                { teamMemberId: comment.comment_team_member_id }
              );

              if (comment_team_member) {
                const newComment = { ...comment, comment_team_member };
                setRequestCommentList((prev) => [
                  newComment as RequestWithResponseType["request_comment"][0],
                  ...prev,
                ]);
              }
            }
          }
          // UPDATE comment event
          if (payload.eventType === "UPDATE") {
            // if UPDATE event is user deleting a comment
            if (payload.new.comment_is_disabled) {
              setRequestCommentList((prev) =>
                prev.filter(
                  (comment) => comment.comment_id !== payload.new.comment_id
                )
              );
            } else {
              // if UPDATE is editing comment content
              const updatedCommentList = requestCommentList.map((comment) => {
                if (comment.comment_id === payload.old.comment_id) {
                  return {
                    ...comment,
                    comment_content: payload.new.comment_content,
                    comment_is_edited: payload.new.comment_is_edited,
                  };
                }
                return comment;
              });
              setRequestCommentList(updatedCommentList);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [supabaseClient, request, requestCommentList]);

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
          {connectedFormIdAndGroup &&
          connectedFormIdAndGroup.formId &&
          (connectedFormIdAndGroup.formIsForEveryone ||
            connectedFormIdAndGroup.formIsMember) &&
          requestStatus === "APPROVED" ? (
            <Button
              onClick={() => {
                router.push(
                  getDirectory(
                    connectedFormIdAndGroup.formId,
                    connectedFormIdAndGroup.formName
                  )
                );
              }}
              sx={{ flex: 1 }}
            >
              Create {connectedFormIdAndGroup.formName}
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
            additionalChargeData={request.request_form.form_section[2].section_field.filter(
              (field) => field.field_response.length !== 0
            )}
          />
        ) : null}

        {request.request_form.form_name === "Sourced Item" &&
        request.request_form.form_is_formsly_form ? (
          <SourcedItemSummary
            summaryData={sectionWithDuplicateList
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
            projectSignerStatus={projectSignerStatus}
          />
        ) : null}

        {request.request_form.form_name === "Receiving Inspecting Report" &&
        request.request_form.form_is_formsly_form ? (
          <ReceivingInspectingReportSummary
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

        {request.request_form.form_name === "Release Order" &&
        request.request_form.form_is_formsly_form ? (
          <ReleaseOrderSummary
            summaryData={sectionWithDuplicateList
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
        ) : null}

        {request.request_form.form_name === "Transfer Receipt" &&
        request.request_form.form_is_formsly_form ? (
          <TransferReceiptSummary
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
        (isUserSigner && isUserSigner.request_signer_status === "PENDING") ? (
          <RequestActionSection
            isUserOwner={isUserOwner}
            requestStatus={requestStatus as FormStatusType}
            handleCancelRequest={handleCancelRequest}
            openPromptDeleteModal={openPromptDeleteModal}
            isUserSigner={Boolean(isUserSigner)}
            handleUpdateRequest={handleUpdateRequest}
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
        requestCommentList={requestCommentList}
      />
    </Container>
  );
};

export default RequestPage;
