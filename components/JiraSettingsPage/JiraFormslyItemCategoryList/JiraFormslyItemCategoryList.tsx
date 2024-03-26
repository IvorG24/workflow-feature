import { getJiraItemCategoryList } from "@/backend/api/get";
import { assignJiraUserToItemCategory } from "@/backend/api/post";
import { updateJiraItemCategory } from "@/backend/api/update";
import { ROW_PER_PAGE } from "@/utils/constant";
import { Database } from "@/utils/database";
import { getPagination } from "@/utils/functions";
import {
  JiraFormslyItemCategoryWithUserDataType,
  JiraItemCategoryTableUpdate,
  JiraItemCategoryUserTableInsert,
  JiraItemCategoryUserTableUpdate,
  JiraUserAccountTableRow,
  JiraUserRoleTableRow,
} from "@/utils/types";
import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Menu,
  Paper,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import {
  IconPlugConnected,
  IconSettings,
  IconUserPlus,
} from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import JiraFormslyItemCategoryForm from "./JiraFormslyItemCategoryForm";
import JiraFormslyItemCategoryUserForm from "./JiraFormslyItemCategoryUserForm";

type Props = {
  jiraItemCategoryData: {
    data: JiraFormslyItemCategoryWithUserDataType[];
    count: number;
  };
  jiraUserAcountList: JiraUserAccountTableRow[];
  jiraUserRoleList: JiraUserRoleTableRow[];
};

const JiraFormslyItemCategoryList = ({
  jiraItemCategoryData,
  jiraUserAcountList,
  jiraUserRoleList,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const [isLoading, setIsLoading] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [jiraItemCategoryList, setJiraItemCategoryList] = useState(
    jiraItemCategoryData.data
  );
  const [jiraItemCategoryCount, setJiraItemCategoryCount] = useState(
    jiraItemCategoryData.count
  );
  const [openJiraFormslyItemCategoryForm, setOpenJiraFormslyItemCategoryForm] =
    useState(false);
  const [
    openJiraFormslyItemCategoryUserForm,
    setOpenJiraFormslyItemCategoryUserForm,
  ] = useState(false);
  const [selectedItemCategory, setSelectedItemCategory] =
    useState<JiraFormslyItemCategoryWithUserDataType | null>(null);

  const userSelectOptionList = jiraUserAcountList.map((user) => ({
    value: user.jira_user_account_id,
    label: user.jira_user_account_display_name,
  }));

  const updateJiraFormslyItemCategoryMethods =
    useForm<JiraItemCategoryTableUpdate>();

  const assignJiraFormslyItemCategoryUserMethods = useForm<
    JiraItemCategoryUserTableInsert | JiraItemCategoryUserTableUpdate
  >();

  const handleUpdateJiraFormslyItemCategory = async (
    data: JiraItemCategoryTableUpdate
  ) => {
    try {
      setIsLoading(true);
      const updatedJiraItemCategory = await updateJiraItemCategory(
        supabaseClient,
        data
      );

      const updatedJiraItemCategoryIndex = jiraItemCategoryList.findIndex(
        (item) => item.jira_item_category_id
      );

      if (updatedJiraItemCategory) {
        jiraItemCategoryList[updatedJiraItemCategoryIndex] =
          updatedJiraItemCategory;
      }

      updateJiraFormslyItemCategoryMethods.reset();
    } catch (error) {
      notifications.show({
        message: "Failed to update item category",
        color: "red",
      });
    } finally {
      setIsLoading(false);
      setOpenJiraFormslyItemCategoryForm(false);
    }
  };

  const handleAssignJiraFormslyItemCategoryUser = async (
    data: JiraItemCategoryUserTableInsert
  ) => {
    try {
      setIsLoading(true);
      if (!selectedItemCategory) {
        notifications.show({
          message: `Item category is not defined`,
          color: "orange",
        });
        return;
      }
      const warehouseCorporateLeadRole = jiraUserRoleList.filter(
        (role) => role.jira_user_role_label === "WAREHOUSE CORPORATE LEAD"
      )[0];

      const isUpdate = Boolean(data.jira_item_user_id);
      const dataWithRoleId = {
        ...data,
        jira_item_user_role_id: warehouseCorporateLeadRole.jira_user_role_id,
        jira_item_user_item_category_id:
          selectedItemCategory.jira_item_category_id,
      };
      const response = await assignJiraUserToItemCategory(supabaseClient, {
        data: dataWithRoleId,
        isUpdate,
      });

      if (response.error) {
        return notifications.show({
          message: `${response.error}`,
          color: "red",
        });
      }

      const jiraItemCategoryMatch = jiraItemCategoryList.find(
        (item) =>
          item.jira_item_category_id ===
          response.data?.jira_item_user_item_category_id
      );

      if (jiraItemCategoryMatch) {
        const updatedJiraItemCategory = {
          ...jiraItemCategoryMatch,
          assigned_jira_user:
            response.data as JiraFormslyItemCategoryWithUserDataType["assigned_jira_user"],
        };
        const updatedJiraItemCategoryList = jiraItemCategoryList.map((item) => {
          if (
            item.jira_item_category_id ===
            updatedJiraItemCategory.jira_item_category_id
          ) {
            return updatedJiraItemCategory;
          } else {
            return item;
          }
        });
        setJiraItemCategoryList(updatedJiraItemCategoryList);
        notifications.show({
          message: `Successfully ${
            isUpdate ? "updated" : "assigned"
          } jira user.`,
          color: "green",
        });
      }
    } catch (error) {
      const isUpdate = Boolean(data.jira_item_user_id);
      notifications.show({
        message: `Failed to ${isUpdate ? "update" : "assign"} jira user.`,
        color: "red",
      });
    } finally {
      setIsLoading(false);
      setOpenJiraFormslyItemCategoryUserForm(false);
      setSelectedItemCategory(null);
      assignJiraFormslyItemCategoryUserMethods.reset();
    }
  };

  const handleFetchJiraItemCategoryList = async (index: number) => {
    const { from, to } = getPagination(index, ROW_PER_PAGE);
    const { data, count } = await getJiraItemCategoryList(supabaseClient, {
      from,
      to,
    });

    return { data, count };
  };

  const handlePagination = async (page: number) => {
    try {
      setActivePage(page);
      setIsLoading(true);
      const { data, count } = await handleFetchJiraItemCategoryList(page - 1);
      setJiraItemCategoryList(data);
      setJiraItemCategoryCount(count);
    } catch (error) {
      notifications.show({
        message: "Failed to fetch item category list",
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
          <Title order={3}>Item Category</Title>
        </Group>
        <DataTable
          mt="xs"
          withBorder
          fw="bolder"
          c="dimmed"
          minHeight={390}
          idAccessor="jira_item_category_id"
          records={jiraItemCategoryList}
          totalRecords={jiraItemCategoryCount}
          recordsPerPage={ROW_PER_PAGE}
          page={activePage}
          onPageChange={handlePagination}
          fetching={isLoading}
          columns={[
            {
              accessor: "jira_item_category_formsly_label",
              title: "Formsly Label",
              render: ({ jira_item_category_formsly_label }) =>
                jira_item_category_formsly_label,
            },
            {
              accessor: "jira_item_category_jira_label",
              title: "Jira Label",
              render: ({ jira_item_category_jira_label }) =>
                jira_item_category_jira_label,
            },
            {
              accessor: "assigned_jira_user",
              title: "WHS Corporate Lead",
              render: ({ assigned_jira_user }) =>
                assigned_jira_user?.jira_user_account_display_name ?? (
                  <Badge color="orange">UNASSIGNED</Badge>
                ),
            },
            {
              accessor: "assign_to_jira_project",
              title: "Action",
              render: (record) => (
                <Menu>
                  <Menu.Target>
                    <ActionIcon>
                      <IconSettings size={16} />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item
                      icon={<IconPlugConnected size={14} />}
                      onClick={() => {
                        setOpenJiraFormslyItemCategoryForm(true);
                        updateJiraFormslyItemCategoryMethods.setValue(
                          "jira_item_category_id",
                          record.jira_item_category_id
                        );
                        updateJiraFormslyItemCategoryMethods.setValue(
                          "jira_item_category_jira_id",
                          record.jira_item_category_jira_id
                        );
                        updateJiraFormslyItemCategoryMethods.setValue(
                          "jira_item_category_jira_label",
                          record.jira_item_category_jira_label
                        ),
                          updateJiraFormslyItemCategoryMethods.setValue(
                            "jira_item_category_formsly_label",
                            record.jira_item_category_formsly_label
                          );
                      }}
                    >
                      Update Item Category
                    </Menu.Item>

                    <Menu.Divider />

                    <Menu.Item
                      icon={<IconUserPlus size={14} />}
                      onClick={() => {
                        setOpenJiraFormslyItemCategoryUserForm(true);
                        setSelectedItemCategory(record);
                        assignJiraFormslyItemCategoryUserMethods.setValue(
                          "jira_item_user_account_id",
                          record.assigned_jira_user?.jira_user_account_id
                        );
                        assignJiraFormslyItemCategoryUserMethods.setValue(
                          "jira_item_user_id",
                          record.assigned_jira_user?.jira_item_user_id
                        );
                      }}
                    >
                      Assign User
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ),
            },
          ]}
        />
      </Paper>
      {/* item category form */}
      <FormProvider {...updateJiraFormslyItemCategoryMethods}>
        <JiraFormslyItemCategoryForm
          opened={openJiraFormslyItemCategoryForm}
          close={() => {
            setOpenJiraFormslyItemCategoryForm(false);
            updateJiraFormslyItemCategoryMethods.reset();
          }}
          onSubmit={handleUpdateJiraFormslyItemCategory}
          isLoading={isLoading}
        />
      </FormProvider>

      {/* item category user form */}
      <FormProvider {...assignJiraFormslyItemCategoryUserMethods}>
        <JiraFormslyItemCategoryUserForm
          opened={openJiraFormslyItemCategoryUserForm}
          close={() => {
            setOpenJiraFormslyItemCategoryUserForm(false);
            assignJiraFormslyItemCategoryUserMethods.reset();
            setSelectedItemCategory(null);
          }}
          onSubmit={handleAssignJiraFormslyItemCategoryUser}
          isLoading={isLoading}
          selectOptionList={userSelectOptionList}
        />
      </FormProvider>
    </Box>
  );
};

export default JiraFormslyItemCategoryList;
