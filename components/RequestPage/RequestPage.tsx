import { deleteRequest } from "@/backend/api/delete";
import { checkQuotationItemQuantity } from "@/backend/api/get";
import { approveOrRejectRequest, cancelRequest } from "@/backend/api/update";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { generateSectionWithDuplicateList } from "@/utils/arrayFunctions";
import { FORM_CONNECTION, GROUP_CONNECTION } from "@/utils/constant";
import {
  ConnectedFormsType,
  FormStatusType,
  FormslyFormType,
  ReceiverStatusType,
  RequestWithResponseType,
  TeamGroupForFormType,
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
import { modals, openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { lowerCase } from "lodash";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import ExportToPdf from "../ExportToPDF/ExportToPdf";
import ConnectedRequestSection from "./ConnectedRequestSections";
import RequestActionSection from "./RequestActionSection";
import RequestCommentList from "./RequestCommentList";
import RequestDetailsSection from "./RequestDetailsSection";
import RequestSection from "./RequestSection";
import RequestSingerSection from "./RequestSignerSection";

type Props = {
  request: RequestWithResponseType;
  isFormslyForm?: boolean;
  connectedFormID?: string;
  connectedRequestIDList?: FormslyFormType;
};

const RequestPage = ({
  request,
  isFormslyForm = false,
  connectedFormID,
  connectedRequestIDList,
}: Props) => {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();

  const user = useUserProfile();
  const teamMember = useUserTeamMember();

  const isGroupMember =
    request.request_form.form_is_formsly_form &&
    GROUP_CONNECTION[
      FORM_CONNECTION[
        request.request_form.form_name as ConnectedFormsType
      ] as TeamGroupForFormType
    ]
      ? teamMember?.team_member_group_list.includes(
          GROUP_CONNECTION[
            FORM_CONNECTION[
              request.request_form.form_name as ConnectedFormsType
            ] as TeamGroupForFormType
          ]
        )
      : true;

  const { setIsLoading } = useLoadingActions();
  const pageContentRef = useRef<HTMLDivElement>(null);

  const [requestStatus, setRequestStatus] = useState(request.request_status);
  const [signerList, setSignerList] = useState(
    request.request_signer.map((signer) => {
      return {
        ...signer.request_signer_signer,
        signer_status: signer.request_signer_status as ReceiverStatusType,
      };
    })
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

      if (
        request.request_form.form_is_formsly_form &&
        request.request_form.form_name === "Quotation" &&
        status === "APPROVED"
      ) {
        const otpID =
          request.request_form.form_section[0].section_field[0]
            .field_response[0].request_response;
        const itemSection = request.request_form.form_section[2];

        const warningItemList = await checkQuotationItemQuantity(
          supabaseClient,
          {
            otpID,
            itemFieldId: itemSection.section_field[0].field_id,
            quantityFieldId: itemSection.section_field[2].field_id,
            itemFieldList: itemSection.section_field[0].field_response,
            quantityFieldList: itemSection.section_field[2].field_response,
          }
        );

        if (warningItemList.length !== 0) {
          setIsLoading(false);
          openConfirmModal({
            title: (
              <Text size={14} color="dimmed">
                Are you sure you want to approve this request?
              </Text>
            ),
            children: (
              <Box maw={390}>
                <Title order={5}>
                  By approving this request, there are items that will exceed
                  quantity limit
                </Title>
                <List size="sm" mt="md">
                  {warningItemList.map((item) => (
                    <List.Item key={item}>{item}</List.Item>
                  ))}
                </List>
              </Box>
            ),
            labels: { confirm: "Proceed", cancel: "Cancel" },
            centered: true,
            onConfirm: () =>
              handleApproveOrRejectRequest(status, signer, signerFullName),
          });
        } else {
          handleApproveOrRejectRequest(status, signer, signerFullName);
        }
      } else {
        handleApproveOrRejectRequest(status, signer, signerFullName);
      }
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
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

  const handleApproveOrRejectRequest = async (
    status: "APPROVED" | "REJECTED",
    signer: RequestWithResponseType["request_signer"][0]["request_signer_signer"],
    signerFullName: string
  ) => {
    setIsLoading(true);
    try {
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
      }

      setSignerList((prev) =>
        prev.map((signer) => {
          if (signer.signer_id !== signer.signer_id) return signer;
          return {
            ...signer,
            signer_status: status,
          };
        })
      );
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

  const handleRedirectToConnectedRequest = () => {
    switch (request.request_form.form_name) {
      case "Order to Purchase":
        return router.push(
          `/team-requests/forms/${connectedFormID}/create?otpId=${request.request_id}`
        );
      case "Quotation":
        return router.push(
          `/team-requests/forms/${connectedFormID}/create?otpId=${JSON.parse(
            request.request_form.form_section[0].section_field[0]
              .field_response[0].request_response
          )}&quotationId=${request.request_id}`
        );
      case "Account Payable Voucher":
        return router.push(
          `/team-requests/forms/${connectedFormID}/create?otpId=${JSON.parse(
            request.request_form.form_section[0].section_field[0]
              .field_response[0].request_response
          )}&quotationId=${JSON.parse(
            request.request_form.form_section[0].section_field[1]
              .field_response[0].request_response
          )}&apvId=${request.request_id}`
        );
    }
  };

  return (
    <Container>
      <Flex justify="space-between">
        <Title order={2} color="dimmed">
          Request
        </Title>
        <Group>
          <ExportToPdf
            request={request}
            sectionWithDuplicateList={sectionWithDuplicateList}
          />
          {connectedFormID && requestStatus === "APPROVED" && isGroupMember ? (
            <Button onClick={handleRedirectToConnectedRequest}>
              Create{" "}
              {
                FORM_CONNECTION[
                  request.request_form.form_name as ConnectedFormsType
                ]
              }
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
        {(isUserOwner &&
          (requestStatus === "PENDING" || requestStatus === "CANCELED")) ||
        (isUserSigner && requestStatus === "PENDING") ? (
          <RequestActionSection
            isUserOwner={isUserOwner}
            requestStatus={requestStatus as FormStatusType}
            requestId={request.request_id}
            handleCancelRequest={handleCancelRequest}
            openPromptDeleteModal={openPromptDeleteModal}
            isUserSigner={Boolean(isUserSigner)}
            handleUpdateRequest={handleUpdateRequest}
          />
        ) : null}
        <RequestSingerSection signerList={signerList} />
      </Stack>

      <RequestCommentList
        requestData={{
          requestId: request.request_id,
          requestOwnerId: request.request_team_member.team_member_user.user_id,
          teamId: request.request_team_member.team_member_team_id,
        }}
        requestCommentList={request.request_comment}
      />
    </Container>
  );
};

export default RequestPage;
