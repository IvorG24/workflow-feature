import {
  getAllTeamMembersWithoutProjectMembers,
  getTeamProjectMemberList,
} from "@/backend/api/get";
import { ROW_PER_PAGE } from "@/utils/constant";
import { Database } from "@/utils/database";
import { TeamProjectTableRow } from "@/utils/types";
import {
  Box,
  CloseButton,
  Container,
  Divider,
  Flex,
  LoadingOverlay,
  Paper,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import AddTeamMember from "./AddTeamMember";
import MemberList from "./MemberList";

export type TeamMemberType = {
  team_project_member_id: string;
  team_member: {
    team_member_id: string;
    team_member_date_created: string;
    team_member_user: {
      user_id: string;
      user_first_name: string;
      user_last_name: string;
      user_avatar: string;
      user_email: string;
    };
  };
};

export type TeamMemberChoiceType = {
  team_member_id: string;
  team_member_user: {
    user_id: string;
    user_first_name: string;
    user_last_name: string;
    user_avatar: string;
    user_email: string;
  };
};

type Props = {
  teamId: string;
  selectedProject: TeamProjectTableRow;
  setSelectedProject: Dispatch<SetStateAction<TeamProjectTableRow | null>>;
  isFetchingMembers: boolean;
  setIsFetchingMembers: Dispatch<SetStateAction<boolean>>;
};

const ProjectMembers = ({
  teamId,
  selectedProject,
  setSelectedProject,
  isFetchingMembers,
  setIsFetchingMembers,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();

  const [isAddingMember, setIsAddingMember] = useState(false);
  const [projectMemberList, setProjectMemberList] = useState<TeamMemberType[]>(
    []
  );
  const [projectMemberListCount, setProjectMemberListCount] = useState(0);

  const [checkList, setCheckList] = useState<string[]>([]);
  const [activePage, setActivePage] = useState(1);
  const [search, setSearch] = useState("");

  const [projectMemberChoiceList, setProjectMemberChoiceList] = useState<
    { label: string; value: string; member: TeamMemberChoiceType }[]
  >([]);

  useEffect(() => {
    const fetchProjectMembers = async () => {
      try {
        const { data: teamMemberList, count: teamMemberListCount } =
          await getTeamProjectMemberList(supabaseClient, {
            projectId: selectedProject.team_project_id,
            page: 1,
            limit: ROW_PER_PAGE,
          });

        setProjectMemberList(teamMemberList as unknown as TeamMemberType[]);
        setProjectMemberListCount(
          teamMemberListCount ? teamMemberListCount : 0
        );
        setIsFetchingMembers(false);
        setCheckList([]);
        setActivePage(1);
        setSearch("");
        setIsAddingMember(false);
      } catch {
        notifications.show({
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
      }
    };
    if (selectedProject) {
      fetchProjectMembers();
    }
  }, [selectedProject]);

  useEffect(() => {
    const fetchTeamMemeberChoiceList = async () => {
      setIsFetchingMembers(true);
      const choices = await getAllTeamMembersWithoutProjectMembers(
        supabaseClient,
        { teamId: teamId, projectId: selectedProject.team_project_id }
      );
      const teamMemberChoices = choices as unknown as TeamMemberChoiceType[];
      const formattedChoices = teamMemberChoices.map((member) => {
        return {
          label: `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`,
          value: member.team_member_id,
          member: member,
        };
      });
      setProjectMemberChoiceList(formattedChoices);
      setIsFetchingMembers(false);
    };
    if (isAddingMember) {
      fetchTeamMemeberChoiceList();
    }
  }, [isAddingMember]);

  return (
    <Container p={0} fluid pos="relative">
      <LoadingOverlay
        visible={isFetchingMembers}
        overlayBlur={2}
        transitionDuration={500}
      />
      <Flex align="center" justify="space-between">
        <Title order={2}>{`${selectedProject.team_project_name}`}</Title>
        <CloseButton onClick={() => setSelectedProject(null)} />
      </Flex>
      <Divider mb="xl" mt="sm" />

      <Box mt="xl">
        <Paper p="xl" shadow="xs">
          {!isAddingMember ? (
            <MemberList
              projectMemberList={projectMemberList}
              setProjectMemberList={setProjectMemberList}
              projectMemberListCount={projectMemberListCount}
              setProjectMemberListCount={setProjectMemberListCount}
              setIsAddingMember={setIsAddingMember}
              checkList={checkList}
              setCheckList={setCheckList}
              activePage={activePage}
              setActivePage={setActivePage}
              search={search}
              setSearch={setSearch}
              selectedProject={selectedProject}
            />
          ) : null}
          {isAddingMember ? (
            <AddTeamMember
              setIsAddingMember={setIsAddingMember}
              setProjectMemberList={setProjectMemberList}
              setProjectMemberListCount={setProjectMemberListCount}
              projectMemberChoiceList={projectMemberChoiceList}
              selectedProject={selectedProject}
            />
          ) : null}
        </Paper>
      </Box>
    </Container>
  );
};

export default ProjectMembers;
