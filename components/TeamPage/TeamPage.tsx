import { deleteRow } from "@/backend/api/delete";
import { createTeamInvitation, uploadImage } from "@/backend/api/post";
import {
  updateTeam,
  updateTeamMemberRole,
  updateTeamOwner,
} from "@/backend/api/update";
import { useTeamActions, useTeamList } from "@/stores/useTeamStore";
import { Database } from "@/utils/database";
import { MemberRoleType, TeamWithTeamMemberType } from "@/utils/types";
import { Container, Space, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import InviteMember from "./InviteMember";
import TeamInfoForm from "./TeamInfoForm";
import TeamMemberList from "./TeamMemberList";

type Props = {
  team: TeamWithTeamMemberType;
  teamMemberId: string;
};

export type UpdateTeamInfoForm = {
  teamName: string;
  teamLogo: string;
};

export type SearchTeamMemberForm = {
  keyword: string;
};

const TeamPage = ({ team: initialTeam, teamMemberId }: Props) => {
  const supabaseClient = createBrowserSupabaseClient<Database>();

  const teamList = useTeamList();
  const [team, setTeam] = useState<TeamWithTeamMemberType>(initialTeam);
  const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);
  const [isUpdatingTeamMembers, setIsUpdatingTeamMembers] = useState(false);
  const [isInvitingMember, setIsInvitingMember] = useState(false);
  const { setTeamList, setActiveTeam } = useTeamActions();

  const [emailList, setEmailList] = useState<string[]>([]);
  const [teamLogo, setTeamLogo] = useState<File | null>(null);

  const memberEmailList = team.team_member.map(
    (member) => member.team_member_user.user_email
  );

  const updateTeamMethods = useForm<UpdateTeamInfoForm>({
    defaultValues: { teamName: team.team_name, teamLogo: team.team_logo },
  });
  const searchTeamMemberMethods = useForm<SearchTeamMemberForm>();

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

  const handleSearchTeamMember = async (data: SearchTeamMemberForm) => {
    console.log(data);
  };

  const handleInvite = async () => {
    try {
      setIsInvitingMember(true);
      const invitationData = emailList.map((email) => {
        return {
          invitation_from_team_member_id: teamMemberId,
          invitation_to_email: email,
        };
      });
      await createTeamInvitation(supabaseClient, invitationData);

      setEmailList([]);
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
    } finally {
      setIsInvitingMember(false);
    }
  };

  const handleUpdateMemberRole = async (
    memberId: string,
    role: MemberRoleType
  ) => {
    try {
      setIsUpdatingTeamMembers(true);

      await updateTeamMemberRole(supabaseClient, {
        memberId,
        role,
      });

      setTeam((team) => {
        return {
          ...team,
          team_member: team.team_member.map((member) => {
            if (member.team_member_id === memberId)
              return {
                ...member,
                team_member_role: role,
              };
            else return member;
          }),
        };
      });

      notifications.show({
        title: "Success!",
        message: "Successfully updated team member role",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error!",
        message: "Unable to update team member role",
        color: "red",
      });
    } finally {
      setIsUpdatingTeamMembers(false);
    }
  };

  const handleTransferOwnership = async (ownerId: string, memberId: string) => {
    try {
      setIsUpdatingTeamMembers(true);

      await updateTeamOwner(supabaseClient, {
        ownerId,
        memberId,
      });

      setTeam((team) => {
        return {
          ...team,
          team_member: team.team_member.map((member) => {
            if (member.team_member_id === ownerId)
              return {
                ...member,
                team_member_role: "ADMIN",
              };
            else if (member.team_member_id === memberId)
              return {
                ...member,
                team_member_role: "OWNER",
              };
            else return member;
          }),
        };
      });

      notifications.show({
        title: "Success!",
        message: "Successfully transferred team ownership",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error!",
        message: "Unable to transfer team ownership",
        color: "red",
      });
    } finally {
      setIsUpdatingTeamMembers(false);
    }
  };

  const handleRemoveFromTeam = async (memberId: string) => {
    try {
      setIsUpdatingTeamMembers(true);

      // todo: not working, needs to fix team_member_table's team_member_disabled into team_member_is_disabled
      await deleteRow(supabaseClient, {
        rowId: [memberId],
        table: "team_member",
      });

      setTeam((team) => {
        return {
          ...team,
          team_member: team.team_member.filter(
            (member) => member.team_member_id !== memberId
          ),
        };
      });

      notifications.show({
        title: "Success!",
        message: "Successfully removed member from team",
        color: "green",
      });
    } catch (e) {
      console.log(e);
      notifications.show({
        title: "Error!",
        message: "Unable remove member from team",
        color: "red",
      });
    } finally {
      setIsUpdatingTeamMembers(false);
    }
  };

  return (
    <Container fluid>
      <Title order={2}>Manage Team</Title>

      <FormProvider {...updateTeamMethods}>
        <TeamInfoForm
          team={team}
          isUpdatingTeam={isUpdatingTeam}
          onUpdateTeam={handleUpdateTeam}
          teamLogoFile={teamLogo}
          onTeamLogoFileChange={setTeamLogo}
        />
      </FormProvider>

      <FormProvider {...searchTeamMemberMethods}>
        <TeamMemberList
          team={team}
          isUpdatingTeamMembers={isUpdatingTeamMembers}
          onSearchTeamMember={handleSearchTeamMember}
          onRemoveFromTeam={handleRemoveFromTeam}
          onUpdateMemberRole={handleUpdateMemberRole}
          onTransferOwnership={handleTransferOwnership}
        />
      </FormProvider>

      <InviteMember
        isInvitingMember={isInvitingMember}
        onInviteMember={handleInvite}
        onSetEmailList={setEmailList}
        memberEmailList={memberEmailList}
        emailList={emailList}
      />

      <Space mt={32} />
    </Container>
  );
};

export default TeamPage;
