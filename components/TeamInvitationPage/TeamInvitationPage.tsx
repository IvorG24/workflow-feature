import { getAllTeamOfUser } from "@/backend/api/get";
import {
  acceptTeamInvitation,
  declineTeamInvitation,
} from "@/backend/api/update";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useTeamActions } from "@/stores/useTeamStore";
import { useUserProfile } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { getAvatarColor } from "@/utils/styling";
import { InvitationWithTeam, TeamTableRow } from "@/utils/types";
import {
  Avatar,
  Button,
  Center,
  Container,
  Paper,
  Stack,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { capitalize } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export type Props = {
  invitation: InvitationWithTeam;
};

const TeamInvitationPage = ({ invitation }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();

  const user = useUserProfile();
  const router = useRouter();
  const { setIsLoading } = useLoadingActions();
  const { setTeamList } = useTeamActions();

  const [status, setStatus] = useState(invitation.invitation_status);

  useEffect(() => {
    setStatus(invitation.invitation_status);
  }, [invitation]);

  const handleAcceptInvitation = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await acceptTeamInvitation(supabaseClient, {
        invitationId: invitation.invitation_id,
        teamId: invitation.invitation_from_team_member.team_member_team_id,
        userId: user.user_id,
      });
      setStatus("ACCEPTED");

      const data = await getAllTeamOfUser(supabaseClient, {
        userId: user.user_id,
      });
      const teamList = data as TeamTableRow[];
      setTeamList(teamList);

      notifications.show({
        message: "Invitation accepted.",
        color: "green",
      });
      setTimeout(router.reload, 1000);
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
    setIsLoading(false);
  };

  const handleDeclineInvitation = async () => {
    setIsLoading(true);
    try {
      await declineTeamInvitation(supabaseClient, {
        invitationId: invitation.invitation_id,
      });
      setStatus("DECLINED");
      notifications.show({
        message: "Invitation declined.",
        color: "green",
      });
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
    setIsLoading(false);
  };

  return (
    <Container fluid>
      <Center>
        <Paper p="xl" mt="xl">
          <Stack align="center">
            <Avatar
              size={120}
              radius={60}
              src={
                invitation.invitation_from_team_member.team_member_team
                  .team_logo
              }
              color={getAvatarColor(
                Number(
                  `${invitation.invitation_from_team_member.team_member_team.team_id.charCodeAt(
                    0
                  )}`
                )
              )}
            >
              {capitalize(
                invitation.invitation_from_team_member.team_member_team
                  .team_name[0]
              )}
              {capitalize(
                invitation.invitation_from_team_member.team_member_team
                  .team_name[1]
              )}
            </Avatar>
            {status === "PENDING" ? (
              <>
                <Title align="center" weight={500} order={4}>
                  You have been invited to join{" "}
                  {
                    invitation.invitation_from_team_member.team_member_team
                      .team_name
                  }{" "}
                  team.
                </Title>
                <Stack w="100%" mt="md" spacing="xs">
                  <Button
                    fullWidth
                    size="md"
                    onClick={() => handleAcceptInvitation()}
                  >
                    Accept Invitation
                  </Button>
                  <Button
                    fullWidth
                    size="md"
                    color="red"
                    onClick={() => handleDeclineInvitation()}
                  >
                    Decline Invitation
                  </Button>
                </Stack>
              </>
            ) : null}
            {status === "ACCEPTED" ? (
              <>
                <Title align="center" weight={500} order={4}>
                  You are already a member of{" "}
                  {
                    invitation.invitation_from_team_member.team_member_team
                      .team_name
                  }{" "}
                  team.
                </Title>
              </>
            ) : null}
            {status === "DECLINED" ? (
              <>
                <Title align="center" weight={500} order={4}>
                  You already declined the invitation to join{" "}
                  {
                    invitation.invitation_from_team_member.team_member_team
                      .team_name
                  }{" "}
                  team.
                </Title>
              </>
            ) : null}
          </Stack>
        </Paper>
      </Center>
    </Container>
  );
};

export default TeamInvitationPage;
