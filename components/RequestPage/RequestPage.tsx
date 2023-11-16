import { deleteRequest } from "@/backend/api/delete";
import {
  checkRequisitionQuantity,
  checkRIRItemQuantity,
  checkROItemQuantity,
  checkTransferReceiptItemQuantity,
  getFileUrl,
} from "@/backend/api/get";
import { approveOrRejectRequest, cancelRequest } from "@/backend/api/update";
import useRealtimeRequestCommentList from "@/hooks/useRealtimeRequestCommentList";
import useRealtimeProjectRequestSignerList from "@/hooks/useRealtimeRequestProjectSignerList";
import useRealtimeRequestSignerList from "@/hooks/useRealtimeRequestSignerList";
import useRealtimeRequestStatus from "@/hooks/useRealtimeRequestStatus";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { generateSectionWithDuplicateList } from "@/utils/arrayFunctions/arrayFunctions";
import {
  ConnectedRequestIdList,
  FormStatusType,
  ReceiverStatusType,
  RequestCommentType,
  RequestProjectSignerStatusType,
  RequestResponseTableRow,
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
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import ExportToPdf from "../ExportToPDF/ExportToPdf";
import { ApproverDetailsType } from "../RequisitionRequestPage/RequisitionRequestPage";
import QuotationSummary from "../SummarySection/QuotationSummary";
import ReceivingInspectingReportSummary from "../SummarySection/ReceivingInspectingReportSummary";
import ReleaseOrderSummary from "../SummarySection/ReleaseOrderSummary";
import RequisitionSummary from "../SummarySection/RequisitionSummary";
import SourcedItemSummary from "../SummarySection/SourcedItemSummary";
import SubconSummary from "../SummarySection/SubconSummary";
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
    formIsHidden: boolean;
  };
  connectedRequestIDList?: ConnectedRequestIdList;
  projectSignerStatus?: RequestProjectSignerStatusType;
  isAnon?: boolean;
};

const RequestPage = ({
  request,
  isFormslyForm = false,
  connectedFormIdAndGroup,
  connectedRequestIDList,
  projectSignerStatus: initialProjectSignerStatus,
  isAnon = false,
}: Props) => {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();

  const [approverDetails, setApproverDetails] = useState<ApproverDetailsType[]>(
    []
  );
  const [isFetchingApprover, setIsFetchingApprover] = useState(true);
  // const [currentServerDate, setCurrentServerDate] = useState("");

  const user = useUserProfile();
  const teamMember = useUserTeamMember();

  useEffect(() => {
    try {
      setIsFetchingApprover(true);
      const fetchApproverDetails = async () => {
        const data = await Promise.all(
          request.request_signer.map(async (signer) => {
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
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingApprover(false);
    }
  }, [request]);

  const { setIsLoading } = useLoadingActions();
  const pageContentRef = useRef<HTMLDivElement>(null);

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
    initialCommentList: request.request_comment as RequestCommentType[],
  });

  const isSourcedItemForm =
    request.request_form.form_name === "Sourced Item" &&
    request.request_form.form_is_formsly_form;

  const projectSignerStatus = useRealtimeProjectRequestSignerList(
    supabaseClient,
    {
      requestId: request.request_id,
      initialRequestProjectSignerList: initialProjectSignerStatus || [],
      requestSignerList: signerList,
      isSourcedItemForm,
    }
  );

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

          const duplictableSectionIdList =
            itemSection.section_field[0].field_response.map(
              (value) => value.request_response_duplicatable_section_id
            );

          const itemFieldList: RequestResponseTableRow[] = [];
          const quantityFieldList: RequestResponseTableRow[] = [];

          duplictableSectionIdList.forEach((duplictableId) => {
            const item = itemSection.section_field[0].field_response.filter(
              (value) =>
                value.request_response_duplicatable_section_id === duplictableId
            )[0];
            const quantity = itemSection.section_field[2].field_response.filter(
              (value) =>
                value.request_response_duplicatable_section_id === duplictableId
            )[0];
            itemFieldList.push(item);
            quantityFieldList.push(quantity);
          });

          const warningItemList = await checkRequisitionQuantity(
            supabaseClient,
            {
              requisitionID,
              itemFieldList,
              quantityFieldList,
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
          const duplictableSectionIdList =
            itemSection.section_field[0].field_response.map(
              (value) => value.request_response_duplicatable_section_id
            );

          const itemFieldList: RequestResponseTableRow[] = [];
          const quantityFieldList: RequestResponseTableRow[] = [];

          duplictableSectionIdList.forEach((duplictableId) => {
            const item = itemSection.section_field[0].field_response.filter(
              (value) =>
                value.request_response_duplicatable_section_id === duplictableId
            )[0];
            const quantity = itemSection.section_field[1].field_response.filter(
              (value) =>
                value.request_response_duplicatable_section_id === duplictableId
            )[0];
            itemFieldList.push(item);
            quantityFieldList.push(quantity);
          });

          const warningItemList = await checkRequisitionQuantity(
            supabaseClient,
            {
              requisitionID,
              itemFieldList,
              quantityFieldList,
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
          const duplictableSectionIdList =
            itemSection.section_field[0].field_response.map(
              (value) => value.request_response_duplicatable_section_id
            );

          const itemFieldList: RequestResponseTableRow[] = [];
          const quantityFieldList: RequestResponseTableRow[] = [];

          duplictableSectionIdList.forEach((duplictableId) => {
            const item = itemSection.section_field[0].field_response.filter(
              (value) =>
                value.request_response_duplicatable_section_id === duplictableId
            )[0];
            const quantity = itemSection.section_field[1].field_response.filter(
              (value) =>
                value.request_response_duplicatable_section_id === duplictableId
            )[0];
            itemFieldList.push(item);
            quantityFieldList.push(quantity);
          });

          const warningItemList = await checkRIRItemQuantity(supabaseClient, {
            quotationId,
            itemFieldId: itemSection.section_field[0].field_id,
            quantityFieldId: itemSection.section_field[1].field_id,
            itemFieldList,
            quantityFieldList,
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

          const duplictableSectionIdList =
            itemSection.section_field[0].field_response.map(
              (value) => value.request_response_duplicatable_section_id
            );

          const itemFieldList: RequestResponseTableRow[] = [];
          const quantityFieldList: RequestResponseTableRow[] = [];

          duplictableSectionIdList.forEach((duplictableId) => {
            const item = itemSection.section_field[0].field_response.filter(
              (value) =>
                value.request_response_duplicatable_section_id === duplictableId
            )[0];
            const quantity = itemSection.section_field[1].field_response.filter(
              (value) =>
                value.request_response_duplicatable_section_id === duplictableId
            )[0];
            itemFieldList.push(item);
            quantityFieldList.push(quantity);
          });

          const warningItemList = await checkROItemQuantity(supabaseClient, {
            sourcedItemId,
            itemFieldId: itemSection.section_field[0].field_id,
            quantityFieldId: itemSection.section_field[1].field_id,
            itemFieldList,
            quantityFieldList,
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

          const duplictableSectionIdList =
            itemSection.section_field[0].field_response.map(
              (value) => value.request_response_duplicatable_section_id
            );

          const itemFieldList: RequestResponseTableRow[] = [];
          const quantityFieldList: RequestResponseTableRow[] = [];

          duplictableSectionIdList.forEach((duplictableId) => {
            const item = itemSection.section_field[0].field_response.filter(
              (value) =>
                value.request_response_duplicatable_section_id === duplictableId
            )[0];
            const quantity = itemSection.section_field[1].field_response.filter(
              (value) =>
                value.request_response_duplicatable_section_id === duplictableId
            )[0];
            itemFieldList.push(item);
            quantityFieldList.push(quantity);
          });

          const warningItemList = await checkTransferReceiptItemQuantity(
            supabaseClient,
            {
              releaseOrderItemId,
              itemFieldId: itemSection.section_field[0].field_id,
              quantityFieldId: itemSection.section_field[1].field_id,
              itemFieldList,
              quantityFieldList,
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

      notifications.show({
        message: `Request ${status.toLowerCase()}.`,
        color: "green",
      });
    } catch {
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

  const isRequestActionSectionVisible =
    canSignerTakeAction || isEditable || isDeletable;

  return (
    <Container>
      <Flex justify="space-between" rowGap="xs" wrap="wrap">
        <Title order={2} color="dimmed">
          Request
        </Title>
        <Group>
          {!isFetchingApprover && approverDetails.length !== 0 && (
            <ExportToPdf
              request={request}
              sectionWithDuplicateList={sectionWithDuplicateList}
              approverDetails={approverDetails}
            />
          )}

          {connectedFormIdAndGroup &&
          connectedFormIdAndGroup.formId &&
          (connectedFormIdAndGroup.formIsForEveryone ||
            connectedFormIdAndGroup.formIsMember) &&
          requestStatus === "APPROVED" &&
          connectedFormIdAndGroup.formIsHidden === false ? (
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
              isAnon={isAnon}
              isOnlyWithResponse={
                request.request_form.form_name === "Requisition" ||
                request.request_form.form_name === "Subcon"
              }
            />
          ))}
        </Stack>

        {request.request_form.form_name === "Requisition" &&
        request.request_form.form_is_formsly_form ? (
          <RequisitionSummary
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

        {request.request_form.form_name === "Subcon" &&
        request.request_form.form_is_formsly_form ? (
          <SubconSummary
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

        {isRequestActionSectionVisible && (
          <RequestActionSection
            handleCancelRequest={handleCancelRequest}
            openPromptDeleteModal={openPromptDeleteModal}
            handleUpdateRequest={handleUpdateRequest}
            requestId={request.request_id}
            isEditable={isEditable}
            canSignerTakeAction={canSignerTakeAction}
            isDeletable={isDeletable}
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
        }}
        requestCommentList={requestCommentList}
      />
    </Container>
  );
};

export default RequestPage;
