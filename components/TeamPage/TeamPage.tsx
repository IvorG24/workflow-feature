import { deleteRow } from "@/backend/api/delete";
import { createTeamInvitation, uploadImage } from "@/backend/api/post";
import {
  updateTeam,
  updateTeamMemberRole,
  updateTeamOwner,
} from "@/backend/api/update";
import { useTeamActions, useTeamList } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";

import { Database } from "@/utils/database";
import { MemberRoleType, TeamMemberType, TeamTableRow } from "@/utils/types";
import { Container, Space, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
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
};

const TeamPage = ({ team: initialTeam, teamMembers }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();

  const teamList = useTeamList();
  const teamMember = useUserTeamMember();

  const [team, setTeam] = useState<TeamTableRow>(initialTeam);
  const [teamMemberList, setTeamMemberList] = useState(teamMembers);

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
        message: "Team updated.",
        color: "green",
      });
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsUpdatingTeam(false);
    }
  };

  const handleSearchTeamMember = async (data: SearchTeamMemberForm) => {
    setIsUpdatingTeamMembers(true);
    setPage(1);
    const { keyword } = data;
    const newMemberList = teamMembers.filter(
      (member) =>
        member.team_member_user.user_first_name.includes(keyword) ||
        member.team_member_user.user_last_name.includes(keyword) ||
        member.team_member_user.user_email.includes(keyword)
    );
    setTeamMemberList(newMemberList);
    setIsUpdatingTeamMembers(false);
  };

  const handleInvite = async () => {
    try {
      if (!teamMember) return;
      setIsInvitingMember(true);

      await createTeamInvitation(supabaseClient, {
        emailList,
        teamMemberId: teamMember.team_member_id,
        teamName: team.team_name,
      });

      setEmailList([]);
      notifications.show({
        message: "Team member/s invited.",
        color: "green",
      });
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
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
        message: "Team member role updated.",
        color: "green",
      });
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
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
        message: "Team ownership transferred",
        color: "green",
      });
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
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

      notifications.show({
        message: "Team member removed.",
        color: "green",
      });
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
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
    const newMemberList = teamMembers.filter(
      (member) =>
        member.team_member_user.user_first_name.includes(keyword) ||
        member.team_member_user.user_last_name.includes(keyword) ||
        member.team_member_user.user_email.includes(keyword)
    );
    setTeamMemberList(newMemberList);
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
