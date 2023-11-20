import { deleteRow } from "@/backend/api/delete";
import { uploadImage } from "@/backend/api/post";
import {
  updateTeam,
  updateTeamMemberRole,
  updateTeamOwner,
} from "@/backend/api/update";
import { useTeamActions, useTeamList } from "@/stores/useTeamStore";
import { useUserActions, useUserTeamMember } from "@/stores/useUserStore";

import { getTeamMember } from "@/backend/api/get";
import { ROW_PER_PAGE } from "@/utils/constant";
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
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import DeleteTeamSection from "./DeleteTeam/DeleteTeamSection";
import InviteMember from "./InviteMember";
import LeaveTeamSection from "./LeaveTeamSection";
import AdminGroup from "./TeamGroup/AdminGroup";
import ApproverGroup from "./TeamGroup/ApproverGroup";
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
  teamMembersCount: number;
  teamGroupsCount: number;
  teamProjectsCount: number;
};

const TeamPage = ({
  team: initialTeam,
  teamMembers,
  teamGroups,
  teamProjects,
  teamMembersCount,
  teamGroupsCount,
  teamProjectsCount,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();

  const teamList = useTeamList();
  const teamMember = useUserTeamMember();
  const { setUserTeamMember } = useUserActions();

  const [team, setTeam] = useState<TeamTableRow>(initialTeam);
  const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);

  const [initialTeamMemberList, setInitialMemberList] = useState(teamMembers);
  const [teamMemberCount, setTeamMemberCount] = useState(teamMembersCount);
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

  const [userRole, setUserRole] = useState(teamMember?.team_member_role);
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
    try {
      setIsUpdatingTeamMembers(true);
      setTeamMemberPage(1);
      const { data: memberData, error } = await supabaseClient.rpc(
        "get_team_member_with_filter",
        {
          input_data: {
            teamId: team.team_id,
            page: 1,
            limit: ROW_PER_PAGE,
            search: data.keyword,
          },
        }
      );
      const formattedData = memberData as {
        teamMembers: TeamMemberType[];
        teamMembersCount: number;
      };
      if (error) throw error;
      setTeamMemberList(formattedData.teamMembers);
      setTeamMemberCount(formattedData.teamMembersCount || 0);
      setIsUpdatingTeamMembers(false);
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
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
    try {
      setTeamMemberPage(page);
      setIsUpdatingTeamMembers(true);
      const keyword = searchTeamMemberMethods.getValues("keyword");
      const { data, error } = await supabaseClient.rpc(
        "get_team_member_with_filter",
        {
          input_data: {
            teamId: team.team_id,
            page,
            limit: ROW_PER_PAGE,
            search: keyword,
          },
        }
      );
      const formattedData = data as {
        teamMembers: TeamMemberType[];
        teamMembersCount: number;
      };
      if (error) throw error;
      setTeamMemberList(formattedData.teamMembers);
      setTeamMemberCount(formattedData.teamMembersCount || 0);
      setIsUpdatingTeamMembers(false);
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  useEffect(() => {
    const channel = supabaseClient
      .channel("realtime team-member-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_member_table",
          filter: `team_member_team_id=eq.${team.team_id}`,
        },
        async (payload) => {
          if (payload.eventType === "UPDATE") {
            const updatedMemberRole = payload.new.team_member_role;
            // if update is removing a member
            if (payload.new.team_member_is_disabled) {
              const removeMemberFromList = teamMemberList.filter(
                (member) => member.team_member_id !== payload.new.team_member_id
              );

              setTeamMemberList(removeMemberFromList);
            }

            // update auth user role
            if (
              teamMember &&
              payload.new.team_member_id === teamMember?.team_member_id
            ) {
              const updatedTeamMember = {
                ...teamMember,
                team_member_role: updatedMemberRole,
              };
              setUserTeamMember(updatedTeamMember);
              setUserRole(updatedMemberRole);
            }

            setInitialMemberList((prev) =>
              prev.map((member) => {
                if (member.team_member_id === payload.new.team_member_id) {
                  return {
                    ...member,
                    team_member_role: updatedMemberRole,
                  };
                }

                return member;
              })
            );

            setTeamMemberList((prev) =>
              prev.map((member) => {
                if (member.team_member_id === payload.new.team_member_id) {
                  return {
                    ...member,
                    team_member_role: updatedMemberRole,
                  };
                }

                return member;
              })
            );
          } else if (payload.eventType === "INSERT") {
            const newMemberData = await getTeamMember(supabaseClient, {
              teamMemberId: payload.new.team_member_id,
            });

            setInitialMemberList((prev) => [
              ...prev,
              newMemberData as unknown as TeamMemberType,
            ]);

            setTeamMemberList((prev) => [
              ...prev,
              newMemberData as unknown as TeamMemberType,
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [supabaseClient, team.team_id, teamMemberList, teamMember]);

  useEffect(() => {
    if (teamMember) {
      setUserRole(teamMember.team_member_role);
    }
  }, [teamMember]);

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
          teamMemberCount={teamMemberCount}
          isUpdatingTeamMembers={isUpdatingTeamMembers}
          onSearchTeamMember={handleSearchTeamMember}
          onRemoveFromTeam={handleRemoveFromTeam}
          onUpdateMemberRole={handleUpdateMemberRole}
          onTransferOwnership={handleTransferOwnership}
          page={teamMemberPage}
          handlePageChange={handleMemberPageChange}
        />
      </FormProvider>

      {isOwner && (
        <Box mt="xl">
          <Paper p="xl" shadow="xs">
            <AdminGroup
              teamId={initialTeam.team_id}
              teamMemberList={initialTeamMemberList}
            />
          </Paper>
        </Box>
      )}

      {isOwnerOrAdmin && (
        <Box mt="xl">
          <Paper p="xl" shadow="xs">
            <ApproverGroup
              teamId={initialTeam.team_id}
              teamMemberList={initialTeamMemberList}
            />
          </Paper>
        </Box>
      )}

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
          teamMemberList={initialTeamMemberList}
        />
      )}

      {isOwner && <DeleteTeamSection totalMembers={teamMembers.length} />}
      {!isOwner && <LeaveTeamSection />}

      <Space mt={32} />
    </Container>
  );
};

export default TeamPage;
