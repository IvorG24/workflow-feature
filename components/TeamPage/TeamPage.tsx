import { uploadImage } from "@/backend/api/post";
import { updateTeam } from "@/backend/api/update";
import { useTeamActions, useTeamList } from "@/stores/useTeamStore";
import { Database } from "@/utils/database";
import { TeamWithTeamMemberType } from "@/utils/types";
import { Container, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import TeamInfoForm from "./TeamInfoForm";

type Props = {
  team: TeamWithTeamMemberType;
  teamMemberId: string;
};

export type UpdateTeamInfoForm = {
  teamName: string;
  teamLogo: string;
};

const TeamPage = ({ team: initialTeam }: Props) => {
  const supabaseClient = createBrowserSupabaseClient<Database>();

  const teamList = useTeamList();
  const [team, setTeam] = useState<TeamWithTeamMemberType>(initialTeam);
  const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);
  const { setTeamList, setActiveTeam } = useTeamActions();
  const [teamLogo, setTeamLogo] = useState<File | null>(null);

  const updateTeamMethods = useForm<UpdateTeamInfoForm>({
    defaultValues: { teamName: team.team_name, teamLogo: team.team_logo },
  });

  const handleUpdateTeam = async (data: UpdateTeamInfoForm) => {
    const { teamName } = data;
    try {
      setIsUpdatingTeam(true);
      let imageUrl = "";
      if (teamLogo) {
        imageUrl = await uploadImage(supabaseClient, {
          id: team.team_id,
          image: teamLogo,
          bucket: "TEAM_LOGOS",
        });

        await updateTeam(supabaseClient, {
          team_id: team.team_id,
          team_name: teamName,
          team_logo: imageUrl,
        });
      } else {
        await updateTeam(supabaseClient, {
          team_id: team.team_id,
          team_name: teamName,
        });
      }

      const newTeamList = teamList.map((stateTeam) => {
        if (stateTeam.team_id === team.team_id) {
          const newActiveTeam = {
            ...stateTeam,
            team_name: teamName,
            team_logo: imageUrl ? imageUrl : stateTeam.team_logo,
          };
          setActiveTeam(newActiveTeam);
          return newActiveTeam;
        } else {
          return stateTeam;
        }
      });
      setTeamList(newTeamList);

      updateTeamMethods.reset({
        teamName,
        teamLogo: imageUrl ? imageUrl : team.team_logo,
      });

      setTeam((team) => {
        return {
          ...team,
          team_name: teamName,
          team_logo: imageUrl ? imageUrl : team.team_logo,
        };
      });

      setTeamLogo(null);

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
    } finally {
      setIsUpdatingTeam(false);
    }
  };

  // const handleInvite = async () => {
  //   const emailList = [
  //     "member1@gmail.com",
  //     "member2@gmail.com",
  //     "member3@gmail.com",
  //   ];

  //   setIsLoading(true);
  //   try {
  //     const invitationData = emailList.map((email) => {
  //       return {
  //         invitation_from_team_member_id: teamMemberId,
  //         invitation_to_email: email,
  //       };
  //     });
  //     await createTeamInvitation(supabaseClient, invitationData);

  //     notifications.show({
  //       title: "Success!",
  //       message: "Successfully invited team member/s",
  //       color: "green",
  //     });
  //   } catch {
  //     notifications.show({
  //       title: "Error!",
  //       message: "Unable to invite team member/s",
  //       color: "red",
  //     });
  //   }
  //   setIsLoading(false);
  // };

  // const handleUpdateMemberRole = async () => {
  //   try {
  //     await updateTeamMemberRole(supabaseClient, {
  //       memberId: "390dbc5f-c3ba-4f86-81ca-7cc9746b6e31",
  //       role: "ADMIN",
  //     });
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  // const handleTransferOwnership = async () => {
  //   try {
  //     await updateTeamOwner(supabaseClient, {
  //       ownerId: "eb4d3419-b70f-44ba-b88f-c3d983cbcf3b",
  //       memberId: "d9c6c738-8a60-43de-965f-f1f666da1639",
  //     });
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  return (
    <Container fluid>
      <Title order={2}>Team Settings</Title>

      {/* <Title>Team Page</Title>
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
      </Paper> */}

      <FormProvider {...updateTeamMethods}>
        <TeamInfoForm
          team={team}
          isUpdatingTeam={isUpdatingTeam}
          onUpdateTeam={handleUpdateTeam}
          teamLogoFile={teamLogo}
          onTeamLogoFileChange={setTeamLogo}
        />
      </FormProvider>
    </Container>
  );
};

export default TeamPage;
