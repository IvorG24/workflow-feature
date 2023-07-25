import {
  deleteRow,
  deleteTeamGroup,
  deleteTeamProject,
} from "@/backend/api/delete";
import { createTeamInvitation, uploadImage } from "@/backend/api/post";
import {
  updateTeam,
  updateTeamAndTeamMemberGroupList,
  updateTeamAndTeamMemberProjectList,
  updateTeamMemberRole,
  updateTeamOwner,
} from "@/backend/api/update";
import { useTeamActions, useTeamList } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";

import { Database } from "@/utils/database";
import { MemberRoleType, TeamMemberType, TeamTableRow } from "@/utils/types";
import { Container, LoadingOverlay, Paper, Space, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { has, lowerCase } from "lodash";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import CreateTeamGroup, { TeamGroupFormType } from "./CreateTeamGroup";
import CreateTeamProject, { TeamProjectFormType } from "./CreateTeamProject";
import InviteMember from "./InviteMember";
import TeamGroupList from "./TeamGroupList";
import TeamInfoForm from "./TeamInfoForm";
import TeamMemberList from "./TeamMemberList";
import TeamProjectList from "./TeamProjectList";

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
  teamGroups: Record<string, TeamMemberType[]>;
  teamProjects: Record<string, TeamMemberType[]>;
};

const TeamPage = ({
  team: initialTeam,
  teamMembers,
  teamGroups,
  teamProjects,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();

  const teamList = useTeamList();
  const teamMember = useUserTeamMember();

  const [team, setTeam] = useState<TeamTableRow>(initialTeam);
  const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);

  const [teamMemberList, setTeamMemberList] = useState(teamMembers);
  const [isUpdatingTeamMembers, setIsUpdatingTeamMembers] = useState(false);
  const [isInvitingMember, setIsInvitingMember] = useState(false);
  const { setTeamList, setActiveTeam } = useTeamActions();
  const [teamMemberPage, setTeamMemberPage] = useState(1);

  const [teamGroupList, setTeamGroupList] =
    useState<Record<string, TeamMemberType[]>>(teamGroups);
  const [isUpdatingTeamGroup, setIsUpdatingTeamGroup] = useState(false);
  const [isCreatingTeamGroup, setIsCreatingTeamGroup] = useState(false);
  const [editGroupData, setEditGroupData] = useState<
    | {
        groupName: string;
        groupMembers: string[];
      }
    | undefined
  >(undefined);
  const [teamGroupPage, setTeamGroupPage] = useState(1);

  const [teamProjectList, setTeamProjectList] =
    useState<Record<string, TeamMemberType[]>>(teamProjects);
  const [isUpdatingTeamProject, setIsUpdatingTeamProject] = useState(false);
  const [isCreatingTeamProject, setIsCreatingTeamProject] = useState(false);
  const [editProjectData, setEditProjectData] = useState<
    | {
        projectName: string;
        projectMembers: string[];
      }
    | undefined
  >(undefined);
  const [teamProjectPage, setTeamProjectPage] = useState(1);

  const [emailList, setEmailList] = useState<string[]>([]);
  const [teamLogo, setTeamLogo] = useState<File | null>(null);

  const memberEmailList = teamMemberList.map(
    (member) => member.team_member_user.user_email
  );

  const userRole = teamMemberList.find(
    (member) => member.team_member_id === teamMember?.team_member_id
  )?.team_member_role as MemberRoleType;

  const isOwnerOrAdmin = userRole === "ADMIN" || userRole === "OWNER";

  const updateTeamMethods = useForm<UpdateTeamInfoForm>({
    defaultValues: { teamName: team.team_name, teamLogo: team.team_logo || "" },
  });

  const searchTeamMemberMethods = useForm<SearchForm>();
  const searchTeamGroupMethods = useForm<SearchForm>();
  const searchTeamProjectMethods = useForm<SearchForm>();

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
        member.team_member_user.user_first_name.includes(keyword) ||
        member.team_member_user.user_last_name.includes(keyword) ||
        member.team_member_user.user_email.includes(keyword)
    );
    setTeamMemberList(newMemberList);
    setIsUpdatingTeamMembers(false);
  };

  const handleSearchTeamGroup = async (data: SearchForm) => {
    setIsUpdatingTeamGroup(true);
    setTeamGroupPage(1);
    const { keyword } = data;
    const newGroupList: Record<string, TeamMemberType[]> = {};
    Object.keys(teamGroups).forEach((group) => {
      if (lowerCase(group).includes(lowerCase(keyword))) {
        newGroupList[group] = teamGroups[group];
      }
    });

    setTeamGroupList(newGroupList);
    setIsUpdatingTeamGroup(false);
  };

  const handleSearchTeamProject = async (data: SearchForm) => {
    setIsUpdatingTeamProject(true);
    setTeamProjectPage(1);
    const { keyword } = data;
    const newProjectList: Record<string, TeamMemberType[]> = {};
    Object.keys(teamProjects).forEach((project) => {
      if (lowerCase(project).includes(lowerCase(keyword))) {
        newProjectList[project] = teamProjects[project];
      }
    });

    setTeamProjectList(newProjectList);
    setIsUpdatingTeamProject(false);
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

  const handleGroupPageChange = async (page: number) => {
    if (!team.team_group_list) return;
    setTeamGroupPage(page);
    setIsUpdatingTeamGroup(true);
    const keyword = searchTeamGroupMethods.getValues("keyword");
    const newGroupList: Record<string, TeamMemberType[]> = {};
    Object.keys(teamGroups).forEach((group) => {
      if (group.includes(keyword)) {
        newGroupList[group] = teamGroups[group];
      }
    });
    setTeamGroupList(newGroupList);
    setIsUpdatingTeamGroup(false);
  };

  const handleProjectPageChange = async (page: number) => {
    if (!team.team_project_list) return;
    setTeamProjectPage(page);
    setIsUpdatingTeamProject(true);
    const keyword = searchTeamProjectMethods.getValues("keyword");
    const newProjectList: Record<string, TeamMemberType[]> = {};
    Object.keys(teamProjects).forEach((project) => {
      if (project.includes(keyword)) {
        newProjectList[project] = teamProjects[project];
      }
    });
    setTeamProjectList(newProjectList);
    setIsUpdatingTeamProject(false);
  };

  const handleDeleteGroup = async (group: string) => {
    setIsUpdatingTeamGroup(true);
    try {
      const groupList = Object.keys(teamGroupList).filter(
        (teamGroup) => teamGroup !== group
      );
      setTeamGroupList((prev) => {
        const state = { ...prev };
        delete state[group];
        return state;
      });
      await deleteTeamGroup(supabaseClient, {
        teamId: team.team_id,
        groupList: groupList,
        deletedGroup: group,
        groupMemberList: teamGroupList[group].map(
          (member) => member.team_member_id
        ),
      });
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
    setIsUpdatingTeamGroup(false);
  };

  const handleDeleteProject = async (project: string) => {
    setIsUpdatingTeamProject(true);
    try {
      const projectList = Object.keys(teamProjectList).filter(
        (teamProject) => teamProject !== project
      );
      setTeamProjectList((prev) => {
        const state = { ...prev };
        delete state[project];
        return state;
      });
      await deleteTeamProject(supabaseClient, {
        teamId: team.team_id,
        projectList: projectList,
        deletedProject: project,
        projectMemberList: teamProjectList[project].map(
          (member) => member.team_member_id
        ),
      });
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
    setIsUpdatingTeamProject(false);
  };

  const handleUpsertGroup = async (data: TeamGroupFormType) => {
    setIsUpdatingTeamGroup(true);
    const alreadyExists = has(teamGroupList, data.groupName);
    if (alreadyExists && !editGroupData) {
      notifications.show({
        message: "Group already exists.",
        color: "orange",
      });
      setIsUpdatingTeamGroup(false);
      return;
    }
    try {
      const prevTeamMembers: string[] = [];
      if (teamGroupList[data.groupName]) {
        teamGroupList[data.groupName].forEach((member) =>
          prevTeamMembers.push(member.team_member_id)
        );
      }
      const prev = teamGroupList;
      const newData: TeamMemberType[] = [];
      data.groupMembers.forEach((memberId) => {
        const newMember = teamMemberList.find(
          (member) => member.team_member_id === memberId
        );
        if (newMember) {
          newData.push(newMember);
        }
      });

      if (editGroupData) {
        delete prev[editGroupData.groupName];
      }
      prev[data.groupName] = newData;
      setTeamGroupList(prev);

      await updateTeamAndTeamMemberGroupList(supabaseClient, {
        teamId: team.team_id,
        teamGroupList: [...Object.keys(prev)],
        upsertGroupName: data.groupName,
        addedGroupMembers: data.groupMembers.filter(
          (member) => !prevTeamMembers.includes(member)
        ),
        deletedGroupMembers: prevTeamMembers.filter(
          (memberId) => !data.groupMembers.includes(memberId)
        ),
        previousName: editGroupData?.groupName,
        previousGroupMembers: editGroupData?.groupMembers,
      });

      notifications.show({
        message: "Group created.",
        color: "green",
      });
      setIsCreatingTeamGroup(false);
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
    setIsUpdatingTeamGroup(false);
  };

  const handleUpsertProject = async (data: TeamProjectFormType) => {
    setIsUpdatingTeamProject(true);
    const alreadyExists = has(teamProjectList, data.projectName);
    if (alreadyExists && !editProjectData) {
      notifications.show({
        message: "Project already exists.",
        color: "orange",
      });
      setIsUpdatingTeamProject(false);
      return;
    }
    try {
      const prevTeamMembers: string[] = [];
      if (teamProjectList[data.projectName]) {
        teamProjectList[data.projectName].forEach((member) =>
          prevTeamMembers.push(member.team_member_id)
        );
      }
      const prev = teamProjectList;
      const newData: TeamMemberType[] = [];
      data.projectMembers.forEach((memberId) => {
        const newMember = teamMemberList.find(
          (member) => member.team_member_id === memberId
        );
        if (newMember) {
          newData.push(newMember);
        }
      });

      if (editProjectData) {
        delete prev[editProjectData.projectName];
      }
      prev[data.projectName] = newData;
      setTeamProjectList(prev);

      await updateTeamAndTeamMemberProjectList(supabaseClient, {
        teamId: team.team_id,
        teamProjectList: [...Object.keys(prev)],
        upsertProjectName: data.projectName,
        addedProjectMembers: data.projectMembers.filter(
          (member) => !prevTeamMembers.includes(member)
        ),
        deletedProjectMembers: prevTeamMembers.filter(
          (memberId) => !data.projectMembers.includes(memberId)
        ),
        previousName: editProjectData?.projectName,
        previousProjectMembers: editProjectData?.projectMembers,
      });

      notifications.show({
        message: "Project created.",
        color: "green",
      });
      setIsCreatingTeamProject(false);
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
    setIsUpdatingTeamProject(false);
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

      <Container p={0} mt="xl" pos="relative" fluid>
        <LoadingOverlay
          visible={isUpdatingTeamGroup}
          overlayBlur={2}
          transitionDuration={500}
        />
        <Paper p="lg" shadow="xs">
          {!isCreatingTeamGroup ? (
            <FormProvider {...searchTeamGroupMethods}>
              <TeamGroupList
                isOwnerOrAdmin={isOwnerOrAdmin}
                teamGroupList={teamGroupList}
                onSearchTeamGroup={handleSearchTeamGroup}
                page={teamGroupPage}
                handlePageChange={handleGroupPageChange}
                setIsCreatingTeamGroup={setIsCreatingTeamGroup}
                setEditGroupData={setEditGroupData}
                handleDeleteGroup={handleDeleteGroup}
              />
            </FormProvider>
          ) : (
            <CreateTeamGroup
              setIsCreatingTeamGroup={setIsCreatingTeamGroup}
              teamMemberList={teamMemberList.map((member) => {
                return {
                  value: member.team_member_id,
                  label: `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`,
                  member: member,
                };
              })}
              editGroupData={editGroupData}
              handleUpsertGroup={handleUpsertGroup}
            />
          )}
        </Paper>
      </Container>

      <Container p={0} mt="xl" pos="relative" fluid>
        <LoadingOverlay
          visible={isUpdatingTeamProject}
          overlayBlur={2}
          transitionDuration={500}
        />
        <Paper p="lg" shadow="xs">
          {!isCreatingTeamProject ? (
            <FormProvider {...searchTeamProjectMethods}>
              <TeamProjectList
                isOwnerOrAdmin={isOwnerOrAdmin}
                teamProjectList={teamProjectList}
                onSearchTeamProject={handleSearchTeamProject}
                page={teamProjectPage}
                handlePageChange={handleProjectPageChange}
                setIsCreatingTeamProject={setIsCreatingTeamProject}
                setEditProjectData={setEditProjectData}
                handleDeleteProject={handleDeleteProject}
              />
            </FormProvider>
          ) : (
            <CreateTeamProject
              setIsCreatingTeamProject={setIsCreatingTeamProject}
              teamMemberList={teamMemberList.map((member) => {
                return {
                  value: member.team_member_id,
                  label: `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`,
                  member: member,
                };
              })}
              editProjectData={editProjectData}
              handleUpsertProject={handleUpsertProject}
            />
          )}
        </Paper>
      </Container>

      {isOwnerOrAdmin && (
        <InviteMember
          isInvitingMember={isInvitingMember}
          onInviteMember={handleInvite}
          onSetEmailList={setEmailList}
          memberEmailList={memberEmailList}
          emailList={emailList}
        />
      )}

      <Space mt={32} />
    </Container>
  );
};

export default TeamPage;
