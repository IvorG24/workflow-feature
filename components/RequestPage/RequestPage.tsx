import { deleteRequest } from "@/backend/api/delete";
import {
  checkItemQuantity,
  checkRIRItemQuantity,
  checkROItemQuantity,
  checkTransferReceiptItemQuantity,
} from "@/backend/api/get";
import { approveOrRejectRequest, cancelRequest } from "@/backend/api/update";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { generateSectionWithDuplicateList } from "@/utils/arrayFunctions/arrayFunctions";
import { formatDate } from "@/utils/constant";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  CommentType,
  FormStatusType,
  ReceiverStatusType,
  RequestResponseTableRow,
  RequestWithResponseType,
} from "@/utils/types";
import {
  Accordion,
  Box,
  Button,
  Container,
  Flex,
  Group,
  List,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ExportToPdfMenu from "../ExportToPDF/ExportToPdfMenu";
import ItemSummary from "../SummarySection/ItemSummary";
import RequestActionSection from "./RequestActionSection";
import RequestCommentList from "./RequestCommentList";
import RequestDetailsSection from "./RequestDetailsSection";
import RequestSection from "./RequestSection";
import RequestSignerSection from "./RequestSignerSection";

type Props = {
  request: RequestWithResponseType;
  isFormslyForm?: boolean;
  isAnon?: boolean;
};

const RequestPage = ({
  request,
  isFormslyForm = false,
  isAnon = false,
}: Props) => {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();

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
  const activeTeam = useActiveTeam();

  const { setIsLoading } = useLoadingActions();
  const pageContentRef = useRef<HTMLDivElement>(null);

  const [requestStatus, setRequestStatus] = useState(request.request_status);
  const [signerList, setSignerList] = useState(initialRequestSignerList);
  const [requestCommentList, setRequestCommentList] = useState(
    request.request_comment
  );

  const requestor = request.request_team_member.team_member_user;

  const requestDateCreated = formatDate(new Date(request.request_date_created));

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
          const itemID =
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

          const warningItemList = await checkItemQuantity(supabaseClient, {
            itemID,
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
                    Item
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
          const itemID =
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

          const warningItemList = await checkItemQuantity(supabaseClient, {
            itemID,
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
                    Item
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

        {isRequestActionSectionVisible && (
          <RequestActionSection
            handleCancelRequest={handleCancelRequest}
            openPromptDeleteModal={openPromptDeleteModal}
            handleUpdateRequest={handleUpdateRequest}
            requestId={request.request_id}
            isEditable={isEditable}
            isCancelable={isCancelable}
            canSignerTakeAction={canSignerTakeAction}
            isDeletable={isDeletable}
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

export default RequestPage;
