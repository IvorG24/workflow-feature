import { deleteRow } from "@/backend/api/delete";
import { uploadImage } from "@/backend/api/post";
import {
  updateTeam,
  updateTeamMemberRole,
  updateTeamOwner,
} from "@/backend/api/update";
import { useTeamActions, useTeamList } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";

import { Database } from "@/utils/database";
import {
  MemberRoleType,
  TeamGroupTableRow,
  TeamMemberType,
  TeamProjectTableRow,
  TeamTableRow,
} from "@/utils/types";
import {
  Box,
  Center,
  Container,
  Paper,
  Space,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { lowerCase } from "lodash";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import DeleteTeamSection from "./DeleteTeam/DeleteTeamSection";
import InviteMember from "./InviteMember";
import CreateGroup from "./TeamGroup/CreateGroup";
import GroupList from "./TeamGroup/GroupList";
import GroupMembers from "./TeamGroup/GroupMembers";
import TeamInfoForm from "./TeamInfoForm";
import TeamMemberList from "./TeamMemberList";
import CreateProject from "./TeamProject/CreateProject";
import ProjectList from "./TeamProject/ProjectList";
import ProjectMembers from "./TeamProject/ProjectMembers";

export type UpdateTeamInfoForm = {
  teamName: string;
  teamLogo: string;
};

export type SearchForm = {
  keyword: string;
};

type Props = {
  team: TeamTableRow;
  teamMembers: TeamMemberType[];
  teamGroups: TeamGroupTableRow[];
  teamProjects: TeamProjectTableRow[];
  teamGroupsCount: number;
  teamProjectsCount: number;
};

const TeamPage = ({
  team: initialTeam,
  teamMembers,
  teamGroups,
  teamProjects,
  teamGroupsCount,
  teamProjectsCount,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();

  const teamList = useTeamList();
  const teamMember = useUserTeamMember();

  const [team, setTeam] = useState<TeamTableRow>(initialTeam);
  const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);

  const [teamMemberList, setTeamMemberList] = useState(teamMembers);
  const [isUpdatingTeamMembers, setIsUpdatingTeamMembers] = useState(false);
  const { setTeamList, setActiveTeam } = useTeamActions();
  const [teamMemberPage, setTeamMemberPage] = useState(1);

  const [teamLogo, setTeamLogo] = useState<File | null>(null);

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupList, setGroupList] = useState(teamGroups);
  const [groupCount, setGroupCount] = useState(teamGroupsCount);
  const [selectedGroup, setSelectedGroup] = useState<TeamGroupTableRow | null>(
    null
  );

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectList, setProjectList] = useState(teamProjects);
  const [projectCount, setProjectCount] = useState(teamProjectsCount);
  const [selectedProject, setSelectedProject] =
    useState<TeamProjectTableRow | null>(null);

  const [isFetchingMembers, setIsFetchingMembers] = useState(false);

  const memberEmailList = teamMemberList.map(
    (member) => member.team_member_user.user_email
  );

  const userRole = teamMember ? teamMember.team_member_role : null;
  const isOwnerOrAdmin = ["OWNER", "ADMIN"].includes(`${userRole}`);
  const isOwner = userRole === "OWNER";

  const updateTeamMethods = useForm<UpdateTeamInfoForm>({
    defaultValues: { teamName: team.team_name, teamLogo: team.team_logo || "" },
  });

  const searchTeamMemberMethods = useForm<SearchForm>();

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

  const handleSearchTeamMember = async (data: SearchForm) => {
    setIsUpdatingTeamMembers(true);
    setTeamMemberPage(1);
    const { keyword } = data;
    const newMemberList = teamMembers.filter(
      (member) =>
        lowerCase(member.team_member_user.user_first_name).includes(
          lowerCase(keyword)
        ) ||
        lowerCase(member.team_member_user.user_last_name).includes(
          lowerCase(keyword)
        ) ||
        lowerCase(member.team_member_user.user_email).includes(
          lowerCase(keyword)
        )
    );
    setTeamMemberList(newMemberList);
    setIsUpdatingTeamMembers(false);
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

  const handleMemberPageChange = async (page: number) => {
    setTeamMemberPage(page);
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
          isOwnerOrAdmin={isOwnerOrAdmin}
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
          page={teamMemberPage}
          handlePageChange={handleMemberPageChange}
        />
      </FormProvider>

      <Box mt="xl">
        <Paper p="xl" shadow="xs">
          {!isCreatingGroup ? (
            <GroupList
              groupList={groupList}
              setGroupList={setGroupList}
              groupCount={groupCount}
              setGroupCount={setGroupCount}
              setIsCreatingGroup={setIsCreatingGroup}
              setSelectedGroup={setSelectedGroup}
              setIsFetchingMembers={setIsFetchingMembers}
              selectedGroup={selectedGroup}
              isOwnerOrAdmin={isOwnerOrAdmin}
            />
          ) : null}
          {isCreatingGroup ? (
            <CreateGroup
              setIsCreatingGroup={setIsCreatingGroup}
              setGroupList={setGroupList}
              setGroupCount={setGroupCount}
            />
          ) : null}
        </Paper>
        <Space h="xl" />
        <Paper p="xl" shadow="xs">
          {!selectedGroup ? (
            <Center>
              <Text color="dimmed">No group selected</Text>
            </Center>
          ) : null}
          {selectedGroup ? (
            <GroupMembers
              teamId={initialTeam.team_id}
              selectedGroup={selectedGroup}
              setSelectedGroup={setSelectedGroup}
              isFetchingMembers={isFetchingMembers}
              setIsFetchingMembers={setIsFetchingMembers}
              isOwnerOrAdmin={isOwnerOrAdmin}
            />
          ) : null}
        </Paper>
      </Box>

      <Box mt="xl">
        <Paper p="xl" shadow="xs">
          {!isCreatingProject ? (
            <ProjectList
              projectList={projectList}
              setProjectList={setProjectList}
              projectCount={projectCount}
              setProjectCount={setProjectCount}
              setIsCreatingProject={setIsCreatingProject}
              setSelectedProject={setSelectedProject}
              setIsFetchingMembers={setIsFetchingMembers}
              selectedProject={selectedProject}
              isOwnerOrAdmin={isOwnerOrAdmin}
            />
          ) : null}
          {isCreatingProject ? (
            <CreateProject
              setIsCreatingProject={setIsCreatingProject}
              setProjectList={setProjectList}
              setProjectCount={setProjectCount}
            />
          ) : null}
        </Paper>
        <Space h="xl" />
        <Paper p="xl" shadow="xs">
          {!selectedProject ? (
            <Center>
              <Text color="dimmed">No project selected</Text>
            </Center>
          ) : null}
          {selectedProject ? (
            <ProjectMembers
              teamId={initialTeam.team_id}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              isFetchingMembers={isFetchingMembers}
              setIsFetchingMembers={setIsFetchingMembers}
              isOwnerOrAdmin={isOwnerOrAdmin}
            />
          ) : null}
        </Paper>
      </Box>

      {isOwnerOrAdmin && (
        <InviteMember
          isOwnerOrAdmin={isOwnerOrAdmin}
          memberEmailList={memberEmailList}
        />
      )}

      {isOwner && <DeleteTeamSection totalMembers={teamMembers.length} />}

      <Space mt={32} />
    </Container>
  );
};

export default TeamPage;
