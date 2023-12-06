import RequestActionSection from "@/components/RequestPage/RequestActionSection";
import RequestCommentList from "@/components/RequestPage/RequestCommentList";
import RequestDetailsSection from "@/components/RequestPage/RequestDetailsSection";
import RequestSection from "@/components/RequestPage/RequestSection";
import RequestSignerSection from "@/components/RequestPage/RequestSignerSection";
import useRealtimeRequestCommentList from "@/hooks/useRealtimeRequestCommentList";
import useRealtimeRequestJira from "@/hooks/useRealtimeRequestJira";
import useRealtimeRequestSignerList from "@/hooks/useRealtimeRequestSignerList";
import useRealtimeRequestStatus from "@/hooks/useRealtimeRequestStatus";
import {
  useUserProfile,
  useUserTeamMember,
  useUserTeamMemberGroupList,
} from "@/stores/useUserStore";
import { generateSectionWithDuplicateList } from "@/utils/arrayFunctions/arrayFunctions";
import { JoyRideNoSSR } from "@/utils/functions";
import {
  ONBOARDING_REQUISITION_REQUEST_STEP,
  ONBOARD_NAME,
} from "@/utils/onboarding";
import {
  ConnectedRequestIdList,
  ReceiverStatusType,
  RequestWithResponseType,
} from "@/utils/types";
import {
  Box,
  Button,
  Container,
  Flex,
  Group,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ACTIONS, CallBackProps, EVENTS, STATUS } from "react-joyride";
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

const OnboardingRequisitionRequestPage = ({
  request,
  // connectedForm,
  connectedRequestIDList,
  canvassRequest,
}: Props) => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  const { colors } = useMantineTheme();
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardingIndex, setOnboardingIndex] = useState(0);

  const teamMember = useUserTeamMember();
  const user = useUserProfile();
  const teamMemberGroupList = useUserTeamMemberGroupList();

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

  const handleUpdateRequest = async (status: "APPROVED" | "REJECTED") => {
    notifications.show({
      message: `Request ${status.toLowerCase()}.\nDemo only`,
      color: "green",
    });
  };

  const handleCancelRequest = async () => {
    notifications.show({
      message: `Request cancelled.`,
      color: "green",
    });
  };

  const handleDeleteRequest = async () => {
    notifications.show({
      message: "Request deleted.\nDemo only",
      color: "green",
    });
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
  const isDeletable = isUserOwner && requestStatus === "CANCELED";
  const isUserRequester = teamMemberGroupList.includes("REQUESTER");

  const isRequestActionSectionVisible =
    canSignerTakeAction || isEditable || isDeletable || isUserRequester;

  const openRequisitionRequestOnboardingModal = () =>
    modals.open({
      centered: true,
      closeOnEscape: false,
      closeOnClickOutside: false,
      withCloseButton: false,
      children: (
        <Box>
          <Title order={3}>Welcome to Requisition Request</Title>
          <Text mt="xs">
            Streamline your workflow, review details, and easily take action on
            pending requests. This brief session will guide you through key
            features for a seamless experience on the Requisition Request Page.
          </Text>

          <Flex justify="flex-end" direction="row" gap="md" mt="lg">
            <Button
              variant="outline"
              onClick={() => {
                modals.closeAll();
                router.push(`/team-requests/dashboard`);
              }}
            >
              Skip Onboarding
            </Button>
            <Button
              onClick={() => {
                modals.closeAll();
                setIsOnboarding(true);
              }}
            >
              Start
            </Button>
          </Flex>
        </Box>
      ),
    });

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;
    const nextArray: string[] = [EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND];
    const statusArray: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    if (status === STATUS.FINISHED) {
      router.push(
        `/user/onboarding/test?notice=success&onboardName=${ONBOARD_NAME.REQUISITION_REQUEST}`
      );
    } else if (nextArray.includes(type)) {
      setOnboardingIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    } else if (statusArray.includes(status)) {
      setIsOnboarding(false);
    }
  };

  useEffect(() => {
    openRequisitionRequestOnboardingModal();
  }, []);
  return (
    <Container>
      <Flex justify="space-between" rowGap="xs" wrap="wrap">
        <Title order={2} color="dimmed">
          Request
        </Title>
        {true && (
          <Group>
            <Button
              variant="light"
              className="onboarding-requisition-request-pdf"
            >
              Export to PDF
            </Button>
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
          jiraTicketStatus={"PENDING"}
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

        <Box style={{ pointerEvents: "none" }}>
          {isRequestActionSectionVisible && (
            <RequestActionSection
              handleCancelRequest={handleCancelRequest}
              openPromptDeleteModal={openPromptDeleteModal}
              handleUpdateRequest={handleUpdateRequest}
              isRf
              isCashPurchase={false}
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
            />
          )}
        </Box>

        {/* {isUserSigner && checkIfSignerCanReverseAction(isUserSigner) ? (
          <RequestReverseActionSection
            handleReverseApproval={handleReverseApproval}
          />
        ) : null} */}

        <RequestSignerSection signerList={signerList} />
      </Stack>
      <Box style={{ pointerEvents: "none" }}>
        <RequestCommentList
          requestData={{
            requestId: request.request_id,
            requestOwnerId:
              request.request_team_member.team_member_user.user_id,
            teamId: request.request_team_member.team_member_team_id,
          }}
          requestCommentList={requestCommentList}
        />
      </Box>

      <JoyRideNoSSR
        callback={handleJoyrideCallback}
        continuous
        run={isOnboarding}
        stepIndex={onboardingIndex}
        steps={ONBOARDING_REQUISITION_REQUEST_STEP}
        scrollToFirstStep
        hideCloseButton
        disableCloseOnEsc
        disableOverlayClose
        showProgress
        styles={{
          buttonNext: { backgroundColor: colors.blue[6] },
          buttonBack: { color: colors.blue[6] },
          beaconInner: { backgroundColor: colors.blue[6] },
          tooltipContent: { padding: 0 },
        }}
      />
    </Container>
  );
};

export default OnboardingRequisitionRequestPage;
