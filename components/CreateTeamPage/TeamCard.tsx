import { getFormList, getUserTeamMemberId } from "@/backend/api/get";
import { updateUserActiveTeam } from "@/backend/api/update";
import { useFormActions } from "@/stores/useFormStore";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useNotificationActions } from "@/stores/useNotificationStore";
import { useActiveApp, useTeamActions } from "@/stores/useTeamStore";
import { useUserActions } from "@/stores/useUserStore";
import { TEMP_USER_ID } from "@/utils/dummyData";
import { TeamTableRow } from "@/utils/types";
import { Button, Paper, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";

type TeamCardProps = {
  team: TeamTableRow;
};

const TeamCard = ({ team }: TeamCardProps) => {
  const router = useRouter();
  const supabaseClient = createBrowserSupabaseClient();

  const activeApp = useActiveApp();

  const { setActiveTeam } = useTeamActions();
  const { setIsLoading } = useLoadingActions();
  const { setUserTeamMemberId } = useUserActions();
  const { setFormList } = useFormActions();
  const { setNotificationList, setUnreadNotification } =
    useNotificationActions();

  const handleRedirectToTeamDashboard = async () => {
    try {
      setIsLoading(true);

      setActiveTeam(team);
      await updateUserActiveTeam(supabaseClient, {
        userId: TEMP_USER_ID,
        teamId: team.team_id,
      });

      // fetch user team member id
      const teamMemberId = await getUserTeamMemberId(supabaseClient, {
        teamId: team.team_id,
        userId: TEMP_USER_ID,
      });
      // set user team member id
      if (teamMemberId) {
        setUserTeamMemberId(teamMemberId);

        // set notification
        setNotificationList([]);
        setUnreadNotification(0);
      }

      // fetch form list
      const formList = await getFormList(supabaseClient, {
        teamId: team.team_id,
        app: activeApp,
      });

      // set form list
      setFormList(formList);

      await router.push("/team-requests/requests");
      setIsLoading(false);
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
      router.push("/500");
    }
  };

  return (
    <Paper p="xl">
      <Stack align="center">
        <Title align="center" weight={500} order={4}>
          You have successfully created your team.
        </Title>
        <Button size="md" onClick={() => handleRedirectToTeamDashboard()}>
          Go to team {team.team_name}
        </Button>
      </Stack>
    </Paper>
  );
};

export default TeamCard;
