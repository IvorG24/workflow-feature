import { getJiraOrganizationList } from "@/backend/api/get";
import { createJiraOrganization } from "@/backend/api/post";
import { updateJiraOrganization } from "@/backend/api/update";
import { ROW_PER_PAGE } from "@/utils/constant";
import { Database } from "@/utils/database";
import { getPagination } from "@/utils/functions";
import {
  JiraOrganizationTableInsert,
  JiraOrganizationTableRow,
  JiraOrganizationTableUpdate,
} from "@/utils/types";
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Group,
  Paper,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import {
  IconPlus,
  IconReload,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import JiraOrganizationLookupForm from "./JiraOrganizationLookupForm";

type Props = {
  jiraOrganizationData: {
    data: JiraOrganizationTableRow[];
    count: number;
  };
};

const JiraOrganizationLookupTable = ({ jiraOrganizationData }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();

  const [isLoading, setIsLoading] = useState(false);
  const [
    openJiraOrganizationLookupFormModal,
    setOpenJiraOrganizationLookupFormModal,
  ] = useState(false);
  const [isUpdatingJiraOrganization, setIsUpdatingJiraOrganization] =
    useState(false);
  const [jiraOrganizationList, setJiraOrganizationList] = useState<
    JiraOrganizationTableRow[]
  >(jiraOrganizationData.data.slice(0, ROW_PER_PAGE));
  const [jiraOrganizationCount, setJiraOrganizationCount] = useState(
    jiraOrganizationData.count
  );
  const [activePage, setActivePage] = useState(1);

  const searchJiraUserFormMethods = useForm<{ search: string }>();
  const updateOrCreateJiraOrganization = useForm<
    JiraOrganizationTableInsert | JiraOrganizationTableUpdate
  >();

  const handleFetchJiraOrganizationList = async ({
    index,
    search,
  }: {
    index: number;
    search?: string;
  }) => {
    const { from, to } = getPagination(index, ROW_PER_PAGE);
    const jiraUserData = await getJiraOrganizationList(supabaseClient, {
      from,
      to,
      search,
    });

    return jiraUserData;
  };

  const handleSearchJiraOrganization = async (data: { search: string }) => {
    try {
      setIsLoading(true);

      const { data: organizationList, count } =
        await handleFetchJiraOrganizationList({
          index: 0,
          search: data.search,
        });

      setJiraOrganizationList(organizationList);
      setJiraOrganizationCount(count);
    } catch (error) {
      console.log(error);
      notifications.show({
        message: "Failed to fetch jira organization list",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePagination = async (page: number) => {
    try {
      setIsLoading(true);
      setActivePage(page);

      const { data, count } = await handleFetchJiraOrganizationList({
        index: page - 1,
        search: searchJiraUserFormMethods.getValues().search,
      });

      setJiraOrganizationList(data);
      setJiraOrganizationCount(count);
    } catch (error) {
      console.log(error);
      notifications.show({
        message: "Failed to fetch jira user list",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrCreateJiraOrganization = async (
    data: JiraOrganizationTableInsert | JiraOrganizationTableUpdate
  ) => {
    try {
      const response = await fetch(
        `/api/get-jira-organization?organizationId=${data.jira_organization_jira_id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        notifications.show({
          message:
            "Jira id not found in current jira organization list. Please contact IT.",
          color: "orange",
        });
        return;
      }

      if (isUpdatingJiraOrganization) {
        setIsUpdatingJiraOrganization(false);
        await updateJiraOrganization(supabaseClient, data);
      } else {
        const { error } = await createJiraOrganization(
          supabaseClient,
          data as JiraOrganizationTableInsert
        );

        if (error) {
          notifications.show({
            message: `${error}`,
            color: "red",
          });
          return;
        }
      }

      notifications.show({
        message: `Successfully ${
          isUpdatingJiraOrganization ? "updated" : "created"
        } jira organization.`,
        color: "green",
      });

      setOpenJiraOrganizationLookupFormModal(false);
      updateOrCreateJiraOrganization.reset();
    } catch (error) {
      console.log(error);
      notifications.show({
        message: "Failed to update or create jira user",
        color: "red",
      });
    }
  };

  return (
    <Box>
      <Paper p="xl" shadow="xs" pos="relative">
        <Flex justify="space-between" align="center">
          <Group>
            <Title order={3}>Jira Users</Title>

            <TextInput
              miw={250}
              maxLength={4000}
              placeholder="User Name"
              rightSection={
                <ActionIcon
                  onClick={() =>
                    handleSearchJiraOrganization(
                      searchJiraUserFormMethods.getValues()
                    )
                  }
                >
                  <IconSearch size={16} />
                </ActionIcon>
              }
              {...searchJiraUserFormMethods.register("search")}
            />
            <Button
              variant="light"
              leftIcon={<IconReload size={16} />}
              onClick={() => handlePagination(activePage)}
            >
              Refresh
            </Button>
          </Group>

          <Button
            size="xs"
            leftIcon={<IconPlus size={14} />}
            onClick={() => {
              setOpenJiraOrganizationLookupFormModal(true);
              setIsUpdatingJiraOrganization(false);
            }}
          >
            Add Users
          </Button>
        </Flex>
        <DataTable
          mt="xs"
          withBorder
          fw="bolder"
          c="dimmed"
          minHeight={390}
          idAccessor="jira_organization_id"
          totalRecords={jiraOrganizationCount}
          recordsPerPage={ROW_PER_PAGE}
          page={activePage}
          onPageChange={handlePagination}
          records={jiraOrganizationList}
          fetching={isLoading}
          columns={[
            {
              accessor: "jira_organization_jira_id",
              title: "Jira Id",
              render: ({ jira_organization_jira_id }) => (
                <Text maw={320}>{jira_organization_jira_id}</Text>
              ),
            },
            {
              accessor: "jira_organization_jira_label",
              title: "Display Name",
              render: ({ jira_organization_jira_label }) =>
                jira_organization_jira_label,
            },
            {
              accessor: "jira_organization_id",
              title: "Action",
              render: ({
                jira_organization_id,
                jira_organization_jira_id,
                jira_organization_jira_label,
              }) => (
                <ActionIcon
                  onClick={() => {
                    setOpenJiraOrganizationLookupFormModal(true);
                    setIsUpdatingJiraOrganization(true);
                    updateOrCreateJiraOrganization.setValue(
                      "jira_organization_id",
                      jira_organization_id
                    );
                    updateOrCreateJiraOrganization.setValue(
                      "jira_organization_jira_id",
                      jira_organization_jira_id
                    );
                    updateOrCreateJiraOrganization.setValue(
                      "jira_organization_jira_label",
                      jira_organization_jira_label
                    );
                  }}
                >
                  <IconSettings size={16} />
                </ActionIcon>
              ),
            },
          ]}
        />
      </Paper>
      <FormProvider {...updateOrCreateJiraOrganization}>
        <JiraOrganizationLookupForm
          opened={openJiraOrganizationLookupFormModal}
          close={() => {
            setOpenJiraOrganizationLookupFormModal(false);
            updateOrCreateJiraOrganization.reset();
          }}
          onSubmit={handleUpdateOrCreateJiraOrganization}
          isLoading={isLoading}
          isUpdate={isUpdatingJiraOrganization}
        />
      </FormProvider>
    </Box>
  );
};

export default JiraOrganizationLookupTable;