import { deleteRow } from "@/backend/api/delete";
import { getTeamMemberList } from "@/backend/api/get";
import { createTeamInvitation, uploadImage } from "@/backend/api/post";
import {
  updateTeam,
  updateTeamMemberRole,
  updateTeamOwner,
} from "@/backend/api/update";
import { useTeamActions, useTeamList } from "@/stores/useTeamStore";
import { useUserTeamMemberId } from "@/stores/useUserStore";
import { DEFAULT_TEAM_MEMBER_LIST_LIMIT } from "@/utils/constant";
import { Database } from "@/utils/database";
import { MemberRoleType, TeamMemberType, TeamTableRow } from "@/utils/types";
import { Container, Space, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import InviteMember from "./InviteMember";
import TeamInfoForm from "./TeamInfoForm";
import TeamMemberList from "./TeamMemberList";

export type UpdateTeamInfoForm = {
  teamName: string;
  teamLogo: string;
};

export type SearchTeamMemberForm = {
  keyword: string;
};

type Props = {
  team: TeamTableRow;
  teamMembers: TeamMemberType[];
  teamMembersCount: number;
};

const TeamPage = ({
  team: initialTeam,
  teamMembers,
  teamMembersCount,
}: Props) => {
  const supabaseClient = createBrowserSupabaseClient<Database>();

  const teamList = useTeamList();
  const teamMemberId = useUserTeamMemberId();

  const [team, setTeam] = useState<TeamTableRow>(initialTeam);
  const [teamMemberList, setTeamMemberList] = useState(teamMembers);
  const [count, setCount] = useState(teamMembersCount);
  const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);
  const [isUpdatingTeamMembers, setIsUpdatingTeamMembers] = useState(false);
  const [isInvitingMember, setIsInvitingMember] = useState(false);
  const { setTeamList, setActiveTeam } = useTeamActions();
  const [page, setPage] = useState(1);

  const [emailList, setEmailList] = useState<string[]>([]);
  const [teamLogo, setTeamLogo] = useState<File | null>(null);

  const memberEmailList = teamMemberList.map(
    (member) => member.team_member_user.user_email
  );

  const updateTeamMethods = useForm<UpdateTeamInfoForm>({
    defaultValues: { teamName: team.team_name, teamLogo: team.team_logo || "" },
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
        teamLogo: imageUrl ? imageUrl : team.team_logo || "",
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
    setIsUpdatingTeamMembers(true);
    const { keyword } = data;
    try {
      const { data: newMemberList, count: newCount } = await getTeamMemberList(
        supabaseClient,
        {
          teamId: team.team_id,
          search: keyword,
          page: page,
          limit: DEFAULT_TEAM_MEMBER_LIST_LIMIT,
        }
      );
      setTeamMemberList(newMemberList);
      setCount(newCount || 0);
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
    setIsUpdatingTeamMembers(false);
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

      setTeamMemberList((prev) => {
        return prev.map((member) => {
          if (member.team_member_id !== memberId) return member;
          return {
            ...member,
            team_member_role: role,
          };
        });
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

      setTeamMemberList((prev) => {
        return prev.map((member) => {
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
        });
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

      await deleteRow(supabaseClient, {
        rowId: [memberId],
        table: "team_member",
      });

      setTeamMemberList((prev) => {
        return prev.filter((member) => member.team_member_id !== memberId);
      });
      setCount((prev) => prev - 1);

      notifications.show({
        title: "Success!",
        message: "Successfully removed member from team",
        color: "green",
      });
    } catch (e) {
      notifications.show({
        title: "Error!",
        message: "Unable remove member from team",
        color: "red",
      });
    } finally {
      setIsUpdatingTeamMembers(false);
    }
  };

  const handlePageChange = async (page: number) => {
    setPage(page);
    setIsUpdatingTeamMembers(true);
    const keyword = searchTeamMemberMethods.getValues("keyword");
    try {
      const { data: newMemberList, count: newCount } = await getTeamMemberList(
        supabaseClient,
        {
          teamId: team.team_id,
          search: keyword,
          page: page,
          limit: DEFAULT_TEAM_MEMBER_LIST_LIMIT,
        }
      );
      setTeamMemberList(newMemberList);
      setCount(newCount || 0);
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
    setIsUpdatingTeamMembers(false);
  };

  return (
    <Container>
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
          teamMemberList={teamMemberList}
          isUpdatingTeamMembers={isUpdatingTeamMembers}
          onSearchTeamMember={handleSearchTeamMember}
          onRemoveFromTeam={handleRemoveFromTeam}
          onUpdateMemberRole={handleUpdateMemberRole}
          onTransferOwnership={handleTransferOwnership}
          page={page}
          handlePageChange={handlePageChange}
          count={count}
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
