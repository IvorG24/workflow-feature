import { getJiraFormslyProjectList } from "@/backend/api/get";
import { assignJiraFormslyProject } from "@/backend/api/post";
import { updateJiraFormslyProject } from "@/backend/api/update";
import { useActiveTeam } from "@/stores/useTeamStore";
import { ROW_PER_PAGE } from "@/utils/constant";
import { Database } from "@/utils/database";
import { getPagination } from "@/utils/functions";
import { JiraFormslyProjectType, JiraProjectTableRow } from "@/utils/types";
import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Menu,
  Paper,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import {
  IconPlugConnected,
  IconSearch,
  IconSettings,
  IconUsersGroup,
} from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { Dispatch, SetStateAction, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import JiraProjectForm from "./JiraProjectForm";

type Props = {
  jiraFormslyProjectList: JiraFormslyProjectType[];
  jiraFormslyProjectCount: number;
  jiraProjectList: JiraProjectTableRow[];
  selectedFormslyProject: string | null;
  setIsManagingUserAccountList: Dispatch<SetStateAction<boolean>>;
  setSelectedFormslyProject: Dispatch<SetStateAction<string | null>>;
  setJiraFormslyProjectList: Dispatch<SetStateAction<JiraFormslyProjectType[]>>;
  setJiraFormslyProjectCount: Dispatch<SetStateAction<number>>;
};

export type AssignFormslyProjectForm = {
  jiraProjectId: string;
};

type AssignUpdateFormslyProjectResponseType = {
  success: boolean;
  data: {
    formsly_project_id: string;
    jira_formsly_project_id: string;
    jira_project_id: string;
  } | null;
};

const JiraFormslyProjectList = ({
  jiraFormslyProjectList,
  jiraFormslyProjectCount,
  jiraProjectList,
  setIsManagingUserAccountList,
  setSelectedFormslyProject,
  selectedFormslyProject,
  setJiraFormslyProjectList,
  setJiraFormslyProjectCount,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const activeTeam = useActiveTeam();

  const [isLoading, setIsLoading] = useState(false);
  const [openJiraProjectFormModal, setOpenJiraProjectFormModal] =
    useState(false);

  const [isReassignJiraFormslyProject, setIsReassignJiraFormslyProject] =
    useState(false);
  const [projectActivePage, setProjectActivePage] = useState(1);

  const jiraSelectOptionList = jiraProjectList.map((project) => ({
    value: project.jira_project_id,
    label: project.jira_project_jira_label,
  }));

  const assignFormslyProjectFormMethods = useForm<AssignFormslyProjectForm>({
    defaultValues: { jiraProjectId: "" },
  });

  const { reset: resetAssignFormslyProjectForm } =
    assignFormslyProjectFormMethods;

  const searchTeamProjectFormMethods = useForm<{ search: string }>();

  const handleAssignFormslyProject = async (data: AssignFormslyProjectForm) => {
    try {
      if (!selectedFormslyProject) {
        notifications.show({
          message: "Please select a formsly project.",
          color: "orange",
        });
        return;
      }
      setIsLoading(true);

      let response: AssignUpdateFormslyProjectResponseType;

      if (isReassignJiraFormslyProject) {
        response = await updateJiraFormslyProject(supabaseClient, {
          formslyProjectId: selectedFormslyProject,
          jiraProjectId: data.jiraProjectId,
        });
      } else {
        response = await assignJiraFormslyProject(supabaseClient, {
          formslyProjectId: selectedFormslyProject,
          jiraProjectId: data.jiraProjectId,
        });
      }

      if (!response.success) {
        notifications.show({
          message: "The selected project is already assigned.",
          color: "orange",
        });
        return;
      }

      const newJiraProjectData = jiraProjectList.find(
        (project) => project.jira_project_id === response.data?.jira_project_id
      );

      if (newJiraProjectData) {
        const updatedJiraFormslyProjectList = jiraFormslyProjectList
          .map((project) => {
            if (
              project.team_project_id === selectedFormslyProject &&
              response.data
            ) {
              return {
                ...project,
                assigned_jira_project: {
                  ...response.data,
                  jira_project: newJiraProjectData,
                },
              };
            }

            return project;
          })
          .sort((a, b) =>
            a.team_project_name.localeCompare(b.team_project_name)
          );
        setJiraFormslyProjectList(updatedJiraFormslyProjectList);
        setJiraFormslyProjectCount((prev) => prev + 1);
      }

      notifications.show({
        message: "Successfully assigned to jira project",
        color: "green",
      });
    } catch (error) {
      console.log(error);
      notifications.show({
        message: "Failed to assign to jira project",
        color: "red",
      });
    } finally {
      resetAssignFormslyProjectForm();
      setOpenJiraProjectFormModal(false);
      setSelectedFormslyProject(null);
      setIsLoading(false);
    }
  };

  const handleFetchJiraFormslyProjectList = async (
    index: number,
    search: string
  ) => {
    const { from, to } = getPagination(index, ROW_PER_PAGE);
    const { data, count } = await getJiraFormslyProjectList(supabaseClient, {
      teamId: activeTeam.team_id,
      from,
      to,
      search,
    });

    const processedProjects = data.map((project) => {
      const jiraProjectMatch = jiraProjectList.find(
        (jiraProject) =>
          jiraProject.jira_project_id ===
          project.assigned_jira_project?.jira_project_id
      );

      if (jiraProjectMatch) {
        return {
          ...project,
          assigned_jira_project: {
            ...project.assigned_jira_project,
            jira_project: jiraProjectMatch,
          },
        };
      } else {
        return project;
      }
    });

    return { processedProjects, count };
  };

  const handleSearchTeamProject = async (formData: { search: string }) => {
    try {
      setIsLoading(true);
      setProjectActivePage(1);
      const { processedProjects, count } =
        await handleFetchJiraFormslyProjectList(0, formData.search);
      setJiraFormslyProjectList(processedProjects as JiraFormslyProjectType[]);
      setJiraFormslyProjectCount(count);
    } catch (error) {
      notifications.show({
        message: "Failed to fetch projects",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePagination = async (page: number) => {
    try {
      setProjectActivePage(page);
      setIsLoading(true);
      const { processedProjects, count } =
        await handleFetchJiraFormslyProjectList(
          page - 1,
          searchTeamProjectFormMethods.getValues().search
        );
      setJiraFormslyProjectList(processedProjects as JiraFormslyProjectType[]);
      setJiraFormslyProjectCount(count);
    } catch (error) {
      notifications.show({
        message: "Failed to fetch projects",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Paper p="xl" shadow="xs" pos="relative">
        <Group>
          <Title order={3}>Team Projects</Title>
          <form
            onSubmit={searchTeamProjectFormMethods.handleSubmit(
              handleSearchTeamProject
            )}
          >
            <TextInput
              aria-label="search-project"
              miw={250}
              maxLength={4000}
              placeholder="Project Name"
              rightSection={
                <ActionIcon
                  aria-label="search-project-button"
                  onClick={() =>
                    handleSearchTeamProject(
                      searchTeamProjectFormMethods.getValues()
                    )
                  }
                >
                  <IconSearch size={16} />
                </ActionIcon>
              }
              {...searchTeamProjectFormMethods.register("search", {
                onChange: (e) =>
                  handleSearchTeamProject({ search: e.currentTarget.value }),
              })}
            />
          </form>
        </Group>
        <DataTable
          mt="xs"
          withBorder
          fw="bolder"
          c="dimmed"
          minHeight={390}
          idAccessor="team_project_id"
          totalRecords={jiraFormslyProjectCount}
          recordsPerPage={ROW_PER_PAGE}
          page={projectActivePage}
          onPageChange={handlePagination}
          records={jiraFormslyProjectList}
          fetching={isLoading}
          columns={[
            {
              accessor: "team_project_name",
              title: "Formsly Project Name",
              render: ({ team_project_name }) => team_project_name,
            },
            {
              accessor:
                "assigned_jira_project.jira_project.jira_project_jira_label",
              title: "Jira Project Name",
              render: ({ assigned_jira_project }) =>
                assigned_jira_project?.jira_project.jira_project_jira_label ?? (
                  <Badge color="orange">UNASSIGNED</Badge>
                ),
            },
            {
              accessor: "assign_to_jira_project",
              title: "Action",
              render: ({ team_project_id, assigned_jira_project }) => (
                <Menu aria-label="project-menu">
                  <Menu.Target>
                    <ActionIcon>
                      <IconSettings size={16} />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item
                      icon={<IconPlugConnected size={14} />}
                      onClick={() => {
                        setSelectedFormslyProject(team_project_id);
                        setOpenJiraProjectFormModal(true);

                        if (assigned_jira_project !== null) {
                          setIsReassignJiraFormslyProject(true);
                          assignFormslyProjectFormMethods.setValue(
                            "jiraProjectId",
                            assigned_jira_project.jira_project_id
                          );
                        }
                      }}
                    >
                      {`${
                        assigned_jira_project ? "Reassign" : "Assign"
                      } to Jira Project`}
                    </Menu.Item>

                    <Menu.Divider />

                    <Menu.Item
                      icon={<IconUsersGroup size={14} />}
                      onClick={() => {
                        setIsManagingUserAccountList(true);
                        setSelectedFormslyProject(team_project_id);
                      }}
                    >
                      Manage Project Users
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ),
            },
          ]}
        />
      </Paper>
      {/* Jira Project Form */}
      <FormProvider {...assignFormslyProjectFormMethods}>
        <JiraProjectForm
          opened={openJiraProjectFormModal}
          close={() => {
            resetAssignFormslyProjectForm();
            setSelectedFormslyProject(null);
            setOpenJiraProjectFormModal(false);
          }}
          selectOptionList={jiraSelectOptionList}
          onSubmit={handleAssignFormslyProject}
          isLoading={isLoading}
        />
      </FormProvider>
    </Box>
  );
};

export default JiraFormslyProjectList;
