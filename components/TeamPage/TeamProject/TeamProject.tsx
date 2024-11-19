import { getTeamProjectList } from "@/backend/api/get";
import { ROW_PER_PAGE } from "@/utils/constant";
import { TeamProjectWithAddressType } from "@/utils/types";
import { Box } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";
import BreadcrumbWrapper from "@/components/BreadCrumbs/BreadCrumbWrapper";
import CreateProject from "./CreateProject";
import ProjectList from "./ProjectList";
import ProjectMembers from "./ProjectMembers";

type Props = {
  teamProjects: TeamProjectWithAddressType[];
  teamProjectsCount: number;
  isOwnerOrAdmin: boolean;
  teamId: string;
};

const TeamProject = ({
  teamProjects,
  teamProjectsCount,
  isOwnerOrAdmin,
  teamId,
}: Props) => {
  const supabaseClient = useSupabaseClient();

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectList, setProjectList] = useState(teamProjects);
  const [projectCount, setProjectCount] = useState(teamProjectsCount);
  const [selectedProject, setSelectedProject] =
    useState<TeamProjectWithAddressType | null>(null);
  const [isFetchingMembers, setIsFetchingMembers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetch = async (search: string, page: number) => {
    setIsLoading(true);
    try {
      const { data, count } = await getTeamProjectList(supabaseClient, {
        teamId: teamId,
        search,
        limit: ROW_PER_PAGE,
        page: page,
      });
      setProjectList(data as unknown as TeamProjectWithAddressType[]);
      setProjectCount(Number(count));
    } catch (e) {
      notifications.show({
        message: "Error on fetching project list",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const teamProjectItems = [
    {
      title: "Team Projects",
      action: () => setSelectedProject(null),
    }
  ]

  if (selectedProject) {
    teamProjectItems.push({
      title: selectedProject.team_project_name,
      action: () => setSelectedProject(selectedProject),
    });
  }

  return (
    <Box mt="xl">
      <BreadcrumbWrapper breadcrumbItems={teamProjectItems}>
      {!isCreatingProject  && !selectedProject ? (
          <ProjectList
            projectList={projectList}
            setProjectList={setProjectList}
            setIsCreatingProject={setIsCreatingProject}
            setSelectedProject={setSelectedProject}
            setIsFetchingMembers={setIsFetchingMembers}
            selectedProject={selectedProject}
            isOwnerOrAdmin={isOwnerOrAdmin}
            handleFetch={handleFetch}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            isFetchingMembers={isFetchingMembers}
            projectCount={projectCount}
          />
        ) : null}
        {isCreatingProject ? (
          <CreateProject
            setIsCreatingProject={setIsCreatingProject}
            handleFetch={handleFetch}
          />
        ) : null}
        {selectedProject ? (
          <ProjectMembers
            teamId={teamId}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            isFetchingMembers={isFetchingMembers}
            setIsFetchingMembers={setIsFetchingMembers}
            isOwnerOrAdmin={isOwnerOrAdmin}
          />
        ) : null}
      </BreadcrumbWrapper>
    </Box>
  );
};

export default TeamProject;
