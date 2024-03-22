import { createOrUpdateJiraFormslyProject } from "@/backend/api/post";
import { ROW_PER_PAGE } from "@/utils/constant";
import { Database } from "@/utils/database";
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
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import JiraProjectForm from "./JiraProjectForm";

type Props = {
  jiraFormslyProjectList: JiraFormslyProjectType[];
  jiraFormslyProjectCount: number;
  jiraProjectList: JiraProjectTableRow[];
};

export type AssignFormslyProjectForm = {
  jiraProjectId: string;
};

const JiraFormslyProjectList = ({
  jiraFormslyProjectList: initialJiraFormslyProjectList,
  jiraFormslyProjectCount: initialJiraFormslyProjectCount,
  jiraProjectList,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();

  const [isLoading, setIsLoading] = useState(false);
  const [openJiraProjectFormModal, setOpenJiraProjectFormModal] =
    useState(false);
  const [selectedFormslyProject, setSelectedFormslyProject] = useState<
    string | null
  >(null);
  const [jiraFormslyProjectList, setJiraFormslyProjectList] = useState(
    initialJiraFormslyProjectList
  );
  const [jiraFormslyProjectCount, setJiraFormslyProjectCount] = useState(
    initialJiraFormslyProjectCount
  );
  const [isCreateJiraFormslyProject, setIsCreateJiraFormslyProject] =
    useState(true);
  const [projectActivePage, setProjectActivePage] = useState(1);

  const jiraSelectOptionList = jiraProjectList.map((project) => ({
    value: project.jira_project_id,
    label: project.jira_project_jira_label,
  }));

  const assignFormslyProjectFormMethods = useForm<AssignFormslyProjectForm>();
  const { reset: resetAssignFormslyProjectForm } =
    assignFormslyProjectFormMethods;

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

      const response = await createOrUpdateJiraFormslyProject(supabaseClient, {
        formslyProjectId: selectedFormslyProject,
        jiraProjectId: data.jiraProjectId,
        isCreate: isCreateJiraFormslyProject,
      });
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
                  jira_formsly_project_id:
                    response.data.jira_formsly_project_id,
                  formsly_project_id: response.data.formsly_project_id,
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

      resetAssignFormslyProjectForm();
      setOpenJiraProjectFormModal(false);
      setSelectedFormslyProject(null);
    } catch (error) {
      console.log(error);
      notifications.show({
        message: "Failed to assign to jira project",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // const handleSearchTeamProject = async (searchValue: string) => {
  //   try {
  //     setIsLoading(true);

  //   } catch (error) {
  //     notifications.show({
  //       message: "Failed to fetch projects",
  //       color: "red",
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  return (
    <Box>
      <Paper p="xl" shadow="xs" pos="relative">
        <Group>
          <Title order={3}>Team Projects</Title>
          <TextInput
            miw={250}
            maxLength={4000}
            placeholder="Project Name"
            rightSection={
              <ActionIcon onClick={() => console.log("search")}>
                <IconSearch size={16} />
              </ActionIcon>
            }
          />
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
          onPageChange={(p) => setProjectActivePage(p)}
          records={jiraFormslyProjectList}
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
                <Menu>
                  <Menu.Target>
                    <ActionIcon>
                      <IconSettings size={16} />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                    {assigned_jira_project ? (
                      <Menu.Item
                        icon={<IconPlugConnected size={14} />}
                        onClick={() => {
                          setIsCreateJiraFormslyProject(false);
                          setSelectedFormslyProject(team_project_id);
                          setOpenJiraProjectFormModal(true);
                        }}
                      >
                        Reassign to Jira Project
                      </Menu.Item>
                    ) : (
                      <Menu.Item
                        icon={<IconPlugConnected size={14} />}
                        onClick={() => {
                          setSelectedFormslyProject(team_project_id);
                          setOpenJiraProjectFormModal(true);
                        }}
                      >
                        Assign to Jira Project
                      </Menu.Item>
                    )}

                    <Menu.Divider />

                    <Menu.Item icon={<IconUsersGroup size={14} />}>
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
