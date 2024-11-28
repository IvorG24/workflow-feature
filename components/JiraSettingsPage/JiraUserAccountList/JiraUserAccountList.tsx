import { removeJiraUserFromProject } from "@/backend/api/delete";
import { getProjectJiraUserAccountList } from "@/backend/api/get";
import { assignJiraUserToProject } from "@/backend/api/post";
import { ROW_PER_PAGE } from "@/utils/constant";
import { Database } from "@/utils/database";
import { getPagination } from "@/utils/functions";
import {
  JiraUserAccountTableRow,
  JiraUserRoleTableRow,
  ProjectJiraUserAccountType,
} from "@/utils/types";
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  LoadingOverlay,
  Paper,
  Text,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconTrashFilled, IconX } from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import JiraUserAccountForm from "./JiraUserAccountForm";

type Props = {
  jiraUserAcountList: JiraUserAccountTableRow[];
  setIsManagingUserAccountList: Dispatch<SetStateAction<boolean>>;
  setIsShowTable: Dispatch<SetStateAction<boolean>>;
  setSelectedFormslyProject: Dispatch<SetStateAction<string | null>>;
  selectedFormslyProject: string | null;
  selectedFormslyProjectName: string;
  jiraUserRoleList: JiraUserRoleTableRow[];
};

export type AddProjectJiraUserForm = {
  userAccountId: string;
  userRoleId: string;
};

const JiraUserAccountList = ({
  jiraUserAcountList,
  setIsManagingUserAccountList,
  setSelectedFormslyProject,
  selectedFormslyProject,
  selectedFormslyProjectName,
  setIsShowTable,
  jiraUserRoleList,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingProjectJiraUser, setIsAddingProjectJiraUser] = useState(false);

  const [openJiraUserAccountForm, setOpenJiraUserAccountForm] = useState(false);
  const [projectJiraUserAccountList, setProjectJiraUserAccountList] = useState<
    ProjectJiraUserAccountType[]
  >([]);
  const [projectJiraUserAccountCount, setProjectJiraUserAccountCount] =
    useState(0);
  const [activePage, setActivePage] = useState(1);

  const userSelectOptionList = jiraUserAcountList.map((user) => ({
    value: user.jira_user_account_id,
    label: user.jira_user_account_display_name,
  }));
  const roleSelectOptionList = jiraUserRoleList
    .map((role) => ({
      value: role.jira_user_role_id,
      label: role.jira_user_role_label,
    }))
    .filter((role) => !role.label.includes("CORPORATE"));

  const addJiraUserToProjectMethods = useForm<AddProjectJiraUserForm>();

  const handleAddJiraUserToProject = async (data: AddProjectJiraUserForm) => {
    try {
      if (!selectedFormslyProject) {
        notifications.show({
          message: "Something went wrong.",
          color: "red",
        });
        return;
      }
      setIsAddingProjectJiraUser(true);

      const selectedRoleLabel = roleSelectOptionList.filter(
        (role) => role.value === data.userRoleId
      )[0].label;

      const response = await assignJiraUserToProject(supabaseClient, {
        userAccountId: data.userAccountId,
        userRoleId: data.userRoleId,
        teamProjectId: selectedFormslyProject,
        selectedRoleLabel: selectedRoleLabel,
      });

      if (response.error) {
        notifications.show({
          message: `${response.error}`,
          color: "red",
        });
        return;
      }

      if (response.data) {
        const jiraUserAccountMatch = jiraUserAcountList.find(
          (account) =>
            account.jira_user_account_id ===
            response.data.jira_project_user_account_id
        );
        const jiraUserRoleMatch = jiraUserRoleList.find(
          (role) =>
            role.jira_user_role_id === response.data.jira_project_user_role_id
        );

        if (jiraUserAccountMatch && jiraUserRoleMatch) {
          const newProjectJiraUserAccount = {
            ...response.data,
            ...jiraUserAccountMatch,
            ...jiraUserRoleMatch,
          };

          const updatedProjectJiraUserAccountList = [
            ...projectJiraUserAccountList,
            newProjectJiraUserAccount,
          ].sort((a, b) =>
            a.jira_user_account_display_name.localeCompare(
              b.jira_user_account_display_name
            )
          );

          setProjectJiraUserAccountList(updatedProjectJiraUserAccountList);
          setProjectJiraUserAccountCount((prev) => prev + 1);
        }
      }
      setOpenJiraUserAccountForm(false);
      addJiraUserToProjectMethods.reset();
    } catch (e) {
      notifications.show({
        message: "Failed to add jira user",
        color: "red",
      });
    } finally {
      setIsAddingProjectJiraUser(false);
    }
  };

  const handleDeleteJiraUserFromProject = async (jiraProjectUserId: string) => {
    try {
      setIsLoading(true);

      await removeJiraUserFromProject(supabaseClient, {
        jiraProjectUserId,
      });

      const updatedProjectJiraUserAccountList =
        projectJiraUserAccountList.filter(
          (user) => user.jira_project_user_id !== jiraProjectUserId
        );

      setProjectJiraUserAccountList(updatedProjectJiraUserAccountList);
      setProjectJiraUserAccountCount((prev) => prev - 1);
    } catch (e) {
      notifications.show({
        message: "Failed to delete jira user",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteJiraUserFromProjectModal = (jiraProjectUserId: string) =>
    modals.openConfirmModal({
      title: "Please confirm your action",
      children: (
        <Text size="sm">
          Are you sure you want to remove user from the project?
        </Text>
      ),
      labels: { confirm: "Remove User", cancel: "Cancel" },
      onConfirm: async () =>
        await handleDeleteJiraUserFromProject(jiraProjectUserId),
      confirmProps: {
        color: "red",
      },
      centered: true,
    });

  const handleFetchJiraUserAccountList = async (index: number) => {
    try {
      if (!selectedFormslyProject) {
        console.warn("Missing selectedFormslyProject");
        return;
      }
      setIsLoading(true);
      const { from, to } = getPagination(index, ROW_PER_PAGE);
      const { data, count } = await getProjectJiraUserAccountList(
        supabaseClient,
        {
          from,
          to,
          teamProjectId: selectedFormslyProject,
        }
      );

      const newProjectJiraUserAccountList = data.map((d) => {
        const jiraUserAccountMatch = jiraUserAcountList.find(
          (account) =>
            account.jira_user_account_id === d.jira_project_user_account_id
        );

        const jiraUserRoleMatch = jiraUserRoleList.find(
          (role) => role.jira_user_role_id === d.jira_project_user_role_id
        );

        return jiraUserAccountMatch
          ? { ...d, ...jiraUserAccountMatch, ...jiraUserRoleMatch }
          : null;
      });

      const filteredProjectJiraUserAccountList =
        newProjectJiraUserAccountList.filter(
          (d) => d !== null
        ) as ProjectJiraUserAccountType[];

      const sortedProjectJiraUserAccountList =
        filteredProjectJiraUserAccountList.sort((a, b) =>
          a.jira_user_account_display_name.localeCompare(
            b.jira_user_account_display_name
          )
        );

      setProjectJiraUserAccountList(sortedProjectJiraUserAccountList);
      setProjectJiraUserAccountCount(count);
    } catch (e) {
      notifications.show({
        message: "Failed to fetch jira user account list",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePagination = async (page: number) => {
    try {
      setActivePage(page);
      setIsLoading(true);
      await handleFetchJiraUserAccountList(page - 1);
    } catch (e) {
      notifications.show({
        message: "Failed to fetch projects",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFormslyProject) {
      handleFetchJiraUserAccountList(0);
    }
  }, [selectedFormslyProject]);

  return (
    <Box pos="relative">
      <LoadingOverlay visible={isLoading} overlayBlur={2} />
      <Paper pos="relative">
        <Flex justify="space-between" align="center">
          <Title order={3}>{`${selectedFormslyProjectName} Jira Users`}</Title>
          <ActionIcon
            onClick={() => {
              setIsManagingUserAccountList(false);
              setIsShowTable(true);
              setSelectedFormslyProject(null);
            }}
          >
            <IconX size={16} />
          </ActionIcon>
        </Flex>
        <Flex mt="xs" justify="space-between" align="center">
          <Text c="dimmed">Manage project JIRA users.</Text>
          <Button size="xs" onClick={() => setOpenJiraUserAccountForm(true)}>
            Assign User
          </Button>
        </Flex>
        <DataTable
          mt="xs"
          withBorder
          fw="bolder"
          c="dimmed"
          minHeight={390}
          idAccessor="jira_project_user_id"
          totalRecords={projectJiraUserAccountCount}
          recordsPerPage={ROW_PER_PAGE}
          page={activePage}
          onPageChange={handlePagination}
          records={projectJiraUserAccountList}
          columns={[
            {
              accessor: "jira_user_account_display_name",
              title: "Name",
              render: ({ jira_user_account_display_name }) =>
                jira_user_account_display_name,
            },
            {
              accessor: "jira_user_account_email_address",
              title: "Email Address",
              render: ({ jira_user_account_email_address }) =>
                jira_user_account_email_address,
            },
            {
              accessor: "jira_user_role_label",
              title: "Role",
              render: ({ jira_user_role_label }) => jira_user_role_label,
            },
            {
              accessor: "action",
              title: "Action",
              render: ({ jira_project_user_id }) => (
                <ActionIcon
                  color="red"
                  onClick={() =>
                    openDeleteJiraUserFromProjectModal(jira_project_user_id)
                  }
                >
                  <IconTrashFilled size={16} />
                </ActionIcon>
              ),
            },
          ]}
        />
      </Paper>
      <FormProvider {...addJiraUserToProjectMethods}>
        <JiraUserAccountForm
          opened={openJiraUserAccountForm}
          close={() => {
            setOpenJiraUserAccountForm(false);
            addJiraUserToProjectMethods.reset();
          }}
          userSelectOptionList={userSelectOptionList}
          roleSelectOptionList={roleSelectOptionList}
          onSubmit={handleAddJiraUserToProject}
          isLoading={isAddingProjectJiraUser}
        />
      </FormProvider>
    </Box>
  );
};

export default JiraUserAccountList;
