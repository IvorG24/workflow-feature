import { getJiraItemCategoryList } from "@/backend/api/get";
import {
  assignJiraUserToItemCategory,
  createJiraFormslyItemCategory,
} from "@/backend/api/post";
import { updateJiraItemCategory } from "@/backend/api/update";
import { ROW_PER_PAGE } from "@/utils/constant";
import { Database } from "@/utils/database";
import { getPagination } from "@/utils/functions";
import {
  JiraFormslyItemCategoryWithUserDataType,
  JiraItemCategoryTableInsert,
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
  Button,
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
  IconPlus,
  IconSearch,
  IconSettings,
  IconUserPlus,
} from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { JiraAutomationFormObject } from "../JiraSettingsPage";
import JiraFormslyItemCategoryForm from "./JiraFormslyItemCategoryForm";
import JiraFormslyItemCategoryUserForm from "./JiraFormslyItemCategoryUserForm";

type Props = {
  jiraItemCategoryData: {
    data: JiraFormslyItemCategoryWithUserDataType[];
    count: number;
  };
  jiraUserAcountList: JiraUserAccountTableRow[];
  jiraUserRoleList: JiraUserRoleTableRow[];
  jiraAutomationFormData: JiraAutomationFormObject | null;
};

const JiraFormslyItemCategoryList = ({
  jiraItemCategoryData,
  jiraUserAcountList,
  jiraUserRoleList,
  jiraAutomationFormData,
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
  const [
    isUpdatingJiraFormslyItemCategory,
    setIsUpdatingJiraFormslyItemCategory,
  ] = useState(false);

  const userSelectOptionList = jiraUserAcountList.map((user) => ({
    value: user.jira_user_account_id,
    label: user.jira_user_account_display_name,
  }));

  const searchJiraFormslyItemCategoryMethods = useForm<{ search: string }>();
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

      if (!jiraAutomationFormData) {
        notifications.show({
          message: "Jira Form data is empty. Please contact the dev team.",
          color: "orange",
        });
        return;
      }

      const existingJiraProjectList = jiraAutomationFormData["23"];
      // verify if jira id
      const isValid = existingJiraProjectList.choices?.find(
        (project) => project.id === data.jira_item_category_jira_id
      );

      if (!isValid) {
        notifications.show({
          message:
            "Jira id not found in current jira item category list. Please contact IT.",
          color: "orange",
        });
        return;
      }

      if (isUpdatingJiraFormslyItemCategory) {
        setIsUpdatingJiraFormslyItemCategory(false);
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
      } else {
        await createJiraFormslyItemCategory(
          supabaseClient,
          data as JiraItemCategoryTableInsert
        );
        handlePagination(activePage);
      }

      setOpenJiraFormslyItemCategoryForm(false);
      updateJiraFormslyItemCategoryMethods.reset();

      notifications.show({
        message: `Successfully ${
          isUpdatingJiraFormslyItemCategory ? "updated" : "created"
        } item category.`,
        color: "green",
      });
    } catch (error) {
      notifications.show({
        message: "Failed to update item category",
        color: "red",
      });
    } finally {
      setIsLoading(false);
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

  const handleFetchJiraItemCategoryList = async (
    index: number,
    search: string
  ) => {
    const { from, to } = getPagination(index, ROW_PER_PAGE);
    const { data, count } = await getJiraItemCategoryList(supabaseClient, {
      from,
      to,
      search,
    });

    return { data, count };
  };

  const handlePagination = async (page: number) => {
    try {
      setActivePage(page);
      setIsLoading(true);
      const searchValue =
        searchJiraFormslyItemCategoryMethods.getValues().search;
      const { data, count } = await handleFetchJiraItemCategoryList(
        page - 1,
        searchValue
      );
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

  const handleSearchJiraFormslyItemCategory = async (data: {
    search: string;
  }) => {
    try {
      setIsLoading(true);

      const { data: itemCategoryList, count } =
        await handleFetchJiraItemCategoryList(0, data.search);

      setJiraItemCategoryList(itemCategoryList);
      setJiraItemCategoryCount(count);
    } catch (error) {
      console.log(error);
      notifications.show({
        message: "Failed to fetch jira item category list",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Paper p="xl" shadow="xs" pos="relative">
        <Group position="apart">
          <Group>
            <Title order={3}>Item Category</Title>
            <TextInput
              miw={250}
              maxLength={4000}
              placeholder="Item Name"
              rightSection={
                <ActionIcon
                  onClick={() =>
                    handleSearchJiraFormslyItemCategory(
                      searchJiraFormslyItemCategoryMethods.getValues()
                    )
                  }
                >
                  <IconSearch size={16} />
                </ActionIcon>
              }
              {...searchJiraFormslyItemCategoryMethods.register("search")}
            />
          </Group>
          <Button
            size="xs"
            leftIcon={<IconPlus size={14} />}
            onClick={() => {
              setOpenJiraFormslyItemCategoryForm(true);
              setIsUpdatingJiraFormslyItemCategory(false);
            }}
          >
            Add Item Category
          </Button>
        </Group>
        <DataTable
          mt="xs"
          withBorder
          fw="bolder"
          c="dimmed"
          minHeight={600}
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
                        setIsUpdatingJiraFormslyItemCategory(true);
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
                      Assign Corporate Lead
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
          isUpdating={isUpdatingJiraFormslyItemCategory}
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
