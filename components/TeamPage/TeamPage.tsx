import { createTeamInvitation, uploadImage } from "@/backend/api/post";
import {
  updateTeam,
  updateTeamMemberRole,
  updateTeamOwner,
} from "@/backend/api/update";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useTeamActions, useTeamList } from "@/stores/useTeamStore";
import { Database } from "@/utils/database";
import { TeamWithTeamMemberType } from "@/utils/types";
import {
  Button,
  Container,
  FileInput,
  Paper,
  Stack,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";

type Props = {
  team: TeamWithTeamMemberType;
  teamMemberId: string;
};

const TeamPage = ({ team, teamMemberId }: Props) => {
  const supabaseClient = createBrowserSupabaseClient<Database>();

  const { setIsLoading } = useLoadingActions();
  const teamList = useTeamList();
  const { setTeamList, setActiveTeam } = useTeamActions();

  const [image, setImage] = useState<File | null>(null);

  const handleUpdateTeam = async () => {
    const tempNewTeamName = "New Team Name";
    setIsLoading(true);
    try {
      let imageUrl = "";
      if (image) {
        imageUrl = await uploadImage(supabaseClient, {
          id: team.team_id,
          image: image,
          bucket: "TEAM_LOGOS",
        });

        await updateTeam(supabaseClient, {
          team_id: team.team_id,
          team_name: tempNewTeamName,
          team_logo: imageUrl,
        });
      } else {
        await updateTeam(supabaseClient, {
          team_id: team.team_id,
          team_name: tempNewTeamName,
        });
      }

      const newTeamList = teamList.map((stateTeam) => {
        if (stateTeam.team_id === team.team_id) {
          const newActiveTeam = {
            ...stateTeam,
            team_name: tempNewTeamName,
            team_logo: imageUrl ? imageUrl : stateTeam.team_logo,
          };
          setActiveTeam(newActiveTeam);
          return newActiveTeam;
        } else {
          return stateTeam;
        }
      });
      setTeamList(newTeamList);

      notifications.show({
        title: "Success!",
        message: "Successfully updated team",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error!",
        message: "Unable to update team",
        color: "red",
      });
    }
    setIsLoading(false);
  };

  const handleInvite = async () => {
    const emailList = [
      "member1@gmail.com",
      "member2@gmail.com",
      "member3@gmail.com",
    ];

    setIsLoading(true);
    try {
      const invitationData = emailList.map((email) => {
        return {
          invitation_from_team_member_id: teamMemberId,
          invitation_to_email: email,
        };
      });
      await createTeamInvitation(supabaseClient, invitationData);

      notifications.show({
        title: "Success!",
        message: "Successfully invited team member/s",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error!",
        message: "Unable to invite team member/s",
        color: "red",
      });
    }
    setIsLoading(false);
  };

  const handleUpdateMemberRole = async () => {
    try {
      await updateTeamMemberRole(supabaseClient, {
        memberId: "390dbc5f-c3ba-4f86-81ca-7cc9746b6e31",
        role: "ADMIN",
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handleTransferOwnership = async () => {
    try {
      await updateTeamOwner(supabaseClient, {
        ownerId: "eb4d3419-b70f-44ba-b88f-c3d983cbcf3b",
        memberId: "d9c6c738-8a60-43de-965f-f1f666da1639",
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Container>
      <Title>Team Page</Title>
      <Stack mt="xl">
        <FileInput label="Team Logo" onChange={setImage} value={image} />
        <Button onClick={handleUpdateTeam}>Update Team</Button>
        <Button onClick={handleInvite}>Invite Team Member</Button>
      </Stack>
      <Stack mt="xl">
        <Button onClick={handleUpdateMemberRole}>
          Change Team Member Role
        </Button>
        <Button onClick={handleTransferOwnership}>Transfer Ownership</Button>
      </Stack>
      <Paper p="xl" mt="xl">
        <pre>{JSON.stringify(team, null, 2)}</pre>
      </Paper>
    </Container>
  );
};

export default TeamPage;
