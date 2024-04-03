import { getJiraProjectList } from "@/backend/api/get";
import { ROW_PER_PAGE } from "@/utils/constant";
import { Database } from "@/utils/database";
import { getPagination } from "@/utils/functions";
import { JiraProjectTableRow } from "@/utils/types";
import { ActionIcon, Box, Group, Paper, TextInput, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconSearch, IconSettings } from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { useState } from "react";
import { useForm } from "react-hook-form";

type Props = {
  jiraProjectData: {
    data: JiraProjectTableRow[];
    count: number;
  };
};

const JiraProjectLookupTable = ({ jiraProjectData }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();

  const [isLoading, setIsLoading] = useState(false);
  // const [openJiraProjectFormModal, setOpenJiraProjectFormModal] =
  //   useState(false);
  const [jiraProjectList, setJiraProjectList] = useState(
    jiraProjectData.data.slice(0, ROW_PER_PAGE)
  );
  const [jiraProjectCount, setJiraProjectCount] = useState(
    jiraProjectData.count
  );
  const [activePage, setActivePage] = useState(1);

  const searchJiraProjectFormMethods = useForm<{ search: string }>();

  const handleFetchJiraProjectList = async ({
    index,
    search,
  }: {
    index: number;
    search?: string;
  }) => {
    const { from, to } = getPagination(index, ROW_PER_PAGE);
    const jiraProjectData = await getJiraProjectList(supabaseClient, {
      from,
      to,
      search,
    });

    return jiraProjectData;
  };

  const handleSearchJiraProject = async (data: { search: string }) => {
    try {
      setIsLoading(true);

      const { data: projectList, count } = await handleFetchJiraProjectList({
        index: 0,
        search: data.search,
      });

      setJiraProjectList(projectList);
      setJiraProjectCount(count);
    } catch (error) {
      console.log(error);
      notifications.show({
        message: "Failed to fetch jira project list",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePagination = async (page: number) => {
    try {
      setIsLoading(true);
      setActivePage(page);

      const { data, count } = await handleFetchJiraProjectList({
        index: page - 1,
        search: searchJiraProjectFormMethods.getValues().search,
      });

      setJiraProjectList(data);
      setJiraProjectCount(count);
    } catch (error) {
      console.log(error);
      notifications.show({
        message: "Failed to fetch jira project list",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Paper p="xl" shadow="xs" pos="relative">
        <Group>
          <Title order={3}>Jira Projects</Title>

          <TextInput
            miw={250}
            maxLength={4000}
            placeholder="Project Name"
            rightSection={
              <ActionIcon
                onClick={() =>
                  handleSearchJiraProject(
                    searchJiraProjectFormMethods.getValues()
                  )
                }
              >
                <IconSearch size={16} />
              </ActionIcon>
            }
            {...searchJiraProjectFormMethods.register("search", {
              onChange: (e) =>
                handleSearchJiraProject({ search: e.currentTarget.value }),
            })}
          />
        </Group>
        <DataTable
          mt="xs"
          withBorder
          fw="bolder"
          c="dimmed"
          minHeight={390}
          idAccessor="jira_project_id"
          totalRecords={jiraProjectCount}
          recordsPerPage={ROW_PER_PAGE}
          page={activePage}
          onPageChange={handlePagination}
          records={jiraProjectList}
          fetching={isLoading}
          columns={[
            {
              accessor: "jira_project_jira_id",
              title: "Project Id",
              render: ({ jira_project_jira_id }) => jira_project_jira_id,
            },
            {
              accessor: "jira_project_jira_label",
              title: "Project Label",
              render: ({ jira_project_jira_label }) => jira_project_jira_label,
            },

            {
              accessor: "jira_project_id",
              title: "Action",
              render: ({ jira_project_id }) => (
                <ActionIcon key={jira_project_id}>
                  <IconSettings size={16} />
                </ActionIcon>
              ),
            },
          ]}
        />
      </Paper>
    </Box>
  );
};

export default JiraProjectLookupTable;
