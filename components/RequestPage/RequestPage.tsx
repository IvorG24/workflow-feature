import { deleteRequest } from "@/backend/api/delete";
import { approveOrRejectRequest, cancelRequest } from "@/backend/api/update";
import { useIsLoading, useLoadingActions } from "@/stores/useLoadingStore";
import { TEMP_TEAM_MEMBER_ID, TEMP_USER_ID } from "@/utils/dummyData";
import { RequestWithResponseType } from "@/utils/types";
import {
  Box,
  Button,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  NavLink,
  Paper,
  Space,
  Stack,
  Text,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useState } from "react";
import RequestAddComment from "./RequestAddComment";
import RequestComment from "./RequestComment";
import RequestSection from "./RequestSection";

type Props = {
  request: RequestWithResponseType;
};

const RequestPage = ({ request }: Props) => {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const isLoading = useIsLoading();
  const { setIsLoading } = useLoadingActions();
  const [requestStatus, setRequestStatus] = useState(request.request_status);
  const [commentList, setCommentList] = useState(request.request_comment);
  const requestor = request.request_team_member.team_member_user;
  const sectionList = request.request_form.form_section;
  const approverList = request.request_signer.map(
    (signer) => signer.request_signer_signer
  );
  const requestDateCreated = new Date(
    request.request_date_created
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isUserOwner = requestor.user_id === TEMP_USER_ID;
  const isUserApprover = approverList.find(
    (approver) =>
      approver.signer_team_member.team_member_id === TEMP_TEAM_MEMBER_ID
  );

  const handleUpdateRequest = async (status: "APPROVED" | "REJECTED") => {
    try {
      setIsLoading(true);
      const approver = isUserApprover;
      const approverFullName = `${approver?.signer_team_member.team_member_user.user_first_name} ${approver?.signer_team_member.team_member_user.user_last_name}`;
      if (!approver) {
        notifications.show({
          message: "Invalid approver.",
          color: "red",
        });
        return;
      }

      await approveOrRejectRequest(supabaseClient, {
        requestAction: status,
        requestId: request.request_id,
        isPrimarySigner: approver.signer_is_primary_signer,
        requestSignerId: approver.signer_id,
        requestOwnerId: request.request_team_member_id as string,
        signerFullName: approverFullName,
        formName: request.request_form.form_name,
        memberId: TEMP_TEAM_MEMBER_ID,
      });

      setRequestStatus(status);
      notifications.show({
        title: "Update request successful.",
        message: `You have ${status} this request`,
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Updating request failed",
        message: `Please try again later.`,
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      setIsLoading(true);
      await cancelRequest(supabaseClient, {
        requestId: request.request_id,
        memberId: TEMP_TEAM_MEMBER_ID,
      });

      setRequestStatus("CANCELED");
      notifications.show({
        title: "Update request successful.",
        message: `You have CANCELED this request`,
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Updating request failed",
        message: `Please try again later.`,
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
        title: "Delete request successful.",
        message: `You have DELETED this request`,
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Delete request failed.",
        message: `Please try again later.`,
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
      onCancel: () => console.log("Cancel"),
      onConfirm: async () => await handleDeleteRequest(),
    });

  return (
    <Container>
      <NavLink
        mb="sm"
        label="Return to Requests Page"
        icon={<IconArrowLeft />}
        onClick={() => router.push("/team-requests/requests")}
      />
      <Paper p="lg" h="fit-content" pos="relative">
        <LoadingOverlay visible={isLoading} overlayBlur={2} />
        {isUserOwner && requestStatus === "PENDING" && (
          <>
            <Divider
              my="lg"
              label="Request Owner Actions"
              labelPosition="center"
            />
            <Stack spacing="sm">
              <Button
                variant="outline"
                fullWidth
                onClick={() =>
                  router.push(
                    `/team-requests/requests/${request.request_id}/edit`
                  )
                }
              >
                Edit Request
              </Button>
              <Button variant="default" fullWidth onClick={handleCancelRequest}>
                Cancel Request
              </Button>
            </Stack>
          </>
        )}

        {isUserOwner && requestStatus === "CANCELED" && (
          <Button color="red" fullWidth onClick={openPromptDeleteModal}>
            Delete Request
          </Button>
        )}

        {isUserApprover && requestStatus === "PENDING" && (
          <>
            <Divider
              my="lg"
              label="Request Approver Actions"
              labelPosition="center"
            />
            <Stack>
              <Button
                color="green"
                fullWidth
                onClick={() => handleUpdateRequest("APPROVED")}
              >
                Approve Request
              </Button>
              <Button
                color="red"
                fullWidth
                onClick={() => handleUpdateRequest("REJECTED")}
              >
                Reject Request
              </Button>
            </Stack>
          </>
        )}
        <Divider my="sm" />
        <Group spacing={4}>
          <Text>Request ID:</Text>
          <Text weight={600}>{request.request_id}</Text>
        </Group>
        <Group spacing={4}>
          <Text>Form name:</Text>
          <Text weight={600}>{request.request_form.form_name}</Text>
        </Group>
        <Group spacing={4}>
          <Text>Form description:</Text>
          <Text weight={600}>{request.request_form.form_description}</Text>
        </Group>
        <Group spacing={4}>
          <Text>Submitted by:</Text>
          <Text
            weight={600}
          >{`${requestor.user_first_name} ${requestor.user_last_name}`}</Text>
        </Group>
        <Group spacing={4}>
          <Text>Submitted on:</Text>
          <Text weight={600}>{requestDateCreated}</Text>
        </Group>
        <Group spacing={4}>
          <Text>Status:</Text>
          <Text weight={600}>{requestStatus}</Text>
        </Group>
        <Group spacing={4}>
          <Text>Approvers:</Text>
          <Text weight={600}>
            {approverList
              .map(
                ({
                  signer_team_member: {
                    team_member_user: { user_first_name, user_last_name },
                  },
                }) => `${user_first_name} ${user_last_name}`
              )
              .join(", ")}
          </Text>
        </Group>

        {sectionList.map((section) => {
          const duplicateSectionIdList = section.section_field[0].field_response
            .map(
              (response) => response.request_response_duplicatable_section_id
            )
            .filter((id) => id !== null);
          // if duplicateSectionIdList is empty, use section_id instead
          const newSectionIdList =
            duplicateSectionIdList.length > 0
              ? duplicateSectionIdList
              : [section.section_id];

          return (
            <Box key={section.section_id}>
              {newSectionIdList.map((sectionId) => (
                <RequestSection
                  key={sectionId}
                  duplicateSectionId={sectionId}
                  section={section}
                />
              ))}
            </Box>
          );
        })}

        <Space h="xl" />
      </Paper>
      <RequestAddComment
        requestId={request.request_id}
        requestOwnerId={request.request_team_member_id as string}
        setCommentList={setCommentList}
      />
      {commentList.map((comment) => (
        <RequestComment
          key={comment.comment_id}
          comment={comment}
          setCommentList={setCommentList}
        />
      ))}
    </Container>
  );
};

export default RequestPage;
