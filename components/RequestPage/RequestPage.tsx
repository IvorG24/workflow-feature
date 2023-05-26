import { deleteComment, deleteRequest } from "@/backend/api/delete";
import { createComment, createNotification } from "@/backend/api/post";
import {
  approveOrRejectRequest,
  cancelRequest,
  updateComment,
} from "@/backend/api/update";
import { Database } from "@/utils/database";
import { TEMP_TEAM_MEMBER_ID } from "@/utils/dummyData";
import { RequestWithResponseType } from "@/utils/types";
import { Button, Container, Paper, Stack, Title } from "@mantine/core";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

type Props = {
  request: RequestWithResponseType;
};

const RequestPage = ({ request }: Props) => {
  const supabaseClient = createBrowserSupabaseClient<Database>();

  const handleApproveRequest = async () => {
    try {
      // Check if the current user is the signer
      // Check if the request is pending
      await approveOrRejectRequest(supabaseClient, {
        requestAction: "APPROVED",
        requestId: "45820673-8b88-4d15-a4bf-12d67f140929",
        isPrimarySigner: true,
        requestSignerId: "a28e7cab-a4f1-4b65-903b-15ddd3fbac85",
        requestOwnerId: "eb4d3419-b70f-44ba-b88f-c3d983cbcf3b",
        signerFullName: "John Doe",
        formName: "All Fields",
        memberId: TEMP_TEAM_MEMBER_ID,
      });
    } catch (e) {
      console.log(e);
    }
  };
  const handleRejectRequest = async () => {
    try {
      // Check if the current user is the signer
      // Check if the request is pending
      await approveOrRejectRequest(supabaseClient, {
        requestAction: "REJECTED",
        requestId: "45820673-8b88-4d15-a4bf-12d67f140929",
        isPrimarySigner: true,
        requestSignerId: "a28e7cab-a4f1-4b65-903b-15ddd3fbac85",
        requestOwnerId: "eb4d3419-b70f-44ba-b88f-c3d983cbcf3b",
        signerFullName: "John Doe",
        formName: "All Fields",
        memberId: TEMP_TEAM_MEMBER_ID,
      });
    } catch (e) {
      console.log(e);
    }
  };
  const handleCancelRequest = async () => {
    try {
      // Check if the current user is the owner
      // Check if the request is pending
      await cancelRequest(supabaseClient, {
        requestId: "45820673-8b88-4d15-a4bf-12d67f140929",
        memberId: TEMP_TEAM_MEMBER_ID,
      });
    } catch (e) {
      console.log(e);
    }
  };
  const handleDeleteRequest = async () => {
    try {
      // Check if the current user is the owner
      // Check if the request is canceled
      await deleteRequest(supabaseClient, {
        requestId: "45820673-8b88-4d15-a4bf-12d67f140929",
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handleCreateComment = async () => {
    try {
      await createComment(supabaseClient, {
        comment_request_id: "45820673-8b88-4d15-a4bf-12d67f140929",
        comment_team_member_id: TEMP_TEAM_MEMBER_ID,
        comment_type: "REQUEST_COMMENT",
        comment_content: "Test Comment",
      });

      await createNotification(supabaseClient, {
        notification_app: "REQUEST",
        notification_type: "REQUEST_COMMENT",
        notification_content: "John Doe commented on your request",
        notification_redirect_url:
          "/team-requests/requests/45820673-8b88-4d15-a4bf-12d67f140929",
        notification_team_member_id: "eb4d3419-b70f-44ba-b88f-c3d983cbcf3b",
      });
    } catch (e) {
      console.log(e);
    }
  };
  const handleEditComment = async () => {
    // Check if the user is the owner of the comment
    try {
      await updateComment(supabaseClient, {
        commentId: "e5d6d43c-cd56-42d2-874f-2cf327a260fd",
        newComment: "Test edit comment",
      });
    } catch (e) {
      console.log(e);
    }
  };
  const handleDeleteComment = async () => {
    // Check if the user is the owner of the comment
    try {
      await deleteComment(supabaseClient, {
        commentId: "e5d6d43c-cd56-42d2-874f-2cf327a260fd",
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Container>
      <Title>Request Page</Title>
      <Stack mt="xl">
        <Title order={3}>Comment Actions</Title>
        <Button onClick={handleCreateComment} color="green">
          Create Comment
        </Button>
        <Button onClick={handleEditComment} color="orange">
          Edit Comment
        </Button>
        <Button onClick={handleDeleteComment} color="dark">
          Delete Comment
        </Button>
      </Stack>
      <Stack mt="xl">
        <Title order={3}>Request Actions</Title>
        <Button onClick={handleApproveRequest} color="green">
          Approve Request
        </Button>
        <Button onClick={handleRejectRequest} color="red">
          Reject Request
        </Button>
        <Button onClick={handleCancelRequest} color="orange">
          Cancel Request
        </Button>
        <Button onClick={handleDeleteRequest} color="dark">
          Delete Request
        </Button>
      </Stack>
      <Paper p="xl" mt="xl">
        <pre>{JSON.stringify(request, null, 2)}</pre>
      </Paper>
    </Container>
  );
};

export default RequestPage;
