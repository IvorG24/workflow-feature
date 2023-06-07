import { useTeamActions } from "@/stores/useTeamStore";
import { TeamTableRow } from "@/utils/types";
import { Button, Paper, Stack, Title } from "@mantine/core";
import { useRouter } from "next/router";

type TeamCardProps = {
  team: TeamTableRow;
};

const TeamCard = ({ team }: TeamCardProps) => {
  const router = useRouter();
  const { setActiveTeam } = useTeamActions();
  const handleRedirectToTeamDashboard = () => {
    setActiveTeam(team);
    router.push("/team-requests/requests");
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
