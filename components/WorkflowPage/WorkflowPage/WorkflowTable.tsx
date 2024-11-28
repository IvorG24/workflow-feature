import { getWorkFlowTableOnLoad } from "@/backend/api/get";
import ListTable from "@/components/ListTable/ListTable";
import { useActiveTeam } from "@/stores/useTeamStore";
import { DEFAULT_REQUEST_LIST_LIMIT, formatDate } from "@/utils/constant";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { getAvatarColor, getStatusToColor } from "@/utils/styling";
import { FilterFormValues, WorkFlowTableValues } from "@/utils/types";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  CopyButton,
  createStyles,
  Divider,
  Flex,
  Group,
  MultiSelect,
  Paper,
  Switch,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useFocusWithin, useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  IconArrowsMaximize,
  IconCopy,
  IconPlus,
  IconReload,
  IconSearch,
} from "@tabler/icons-react";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

type FilterSelectedValuesType = {
  creatorList: string[];
  dateRange: Date[];
};

const useStyles = createStyles(() => ({
  requestor: {
    border: "solid 2px white",
    cursor: "pointer",
  },
  clickable: {
    cursor: "pointer",
  },
}));
const defaultAvatarProps = { color: "blue", size: "sm", radius: "xl" };
const inputFilterProps = {
  w: { base: 200, sm: 300 },
  clearable: true,
  clearSearchOnChange: true,
  clearSearchOnBlur: true,
  searchable: true,
  nothingFound: "Nothing found",
};
const dateFilterProps = {
  w: { base: 200, sm: 300 },
  clearable: true,
};

const tableColumnList = [
  { value: "workflow_id", label: "Workflow ID" },
  { value: "workflow_label", label: "Label" },
  { value: "workflow_date_created", label: "Date Created" },
  { value: "workflow_date_updated", label: "Date Updated" },
  { value: "created_by", label: "Created By" },
  { value: "updated_by", label: "Updated By" },
  { value: "workflow_version_label", label: "Workflow Version" },
  { value: "view", label: "View" },
];

const creatorList = [
  {
    value: "OWNER",
    label: "Owner",
  },
  {
    value: "ADMIN",
    label: "Admin",
  },
];
const WorkFlowTable = () => {
  const { classes } = useStyles();
  const { ref: dateRef, focused: dateRefFocused } = useFocusWithin();
  const { ref: creatorRef, focused: creatorRefFocused } = useFocusWithin();
  const router = useRouter();
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const [activePage, setActivePage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showTableColumnFilter, setShowTableColumnFilter] = useState(false);
  const [isFilter, setIsfilter] = useState(false);
  const [workflowCount, setWorkFlowCount] = useState(0);
  const [workFlowList, setWorkFlowList] = useState<WorkFlowTableValues[]>([]);
  const [filter, setFilter] = useState<FilterFormValues>({
    isAscendingSort: false,
    searchFilter: "",
    creatorList: [],
    dateRange: [],
  });

  const [listTableColumnFilter, setListTableColumnFilter] = useLocalStorage<
    string[]
  >({
    key: "worflow-list-table-column-filter",
    defaultValue: [],
  });

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "workflow_date_created",
    direction: "desc",
  });

  const [filterSelectedValues, setFilterSelectedValues] =
    useState<FilterSelectedValuesType>({
      creatorList: [],
      dateRange: [],
    });

  const { handleSubmit, getValues, register, setValue, control } =
    useForm<FilterFormValues>({
      defaultValues: filter,
    });

  const memberList = creatorList.map((member) => ({
    value: member.value,
    label: `${member.label}`,
  }));

  const checkIfColumnIsHidden = (column: string) => {
    const isHidden = listTableColumnFilter.includes(column);
    return isHidden;
  };

  const handleFetchWorkflowList = async (page: number) => {
    try {
      setIsLoading(true);
      if (!activeTeam.team_id) {
        console.warn(
          "RequestListPage handleFilterFormsError: active team_id not found"
        );
        return;
      }
      const { searchFilter, isAscendingSort, creatorList, dateRange } =
        getValues();

      const params = {
        isAscendingSort: isAscendingSort,
        page: page,
        limit: DEFAULT_REQUEST_LIST_LIMIT,
        search: searchFilter || "",
        creatorList: creatorList || [],
        dateRange: dateRange.map((date) => (date ? new Date(date) : "")) || [],
        teamId: activeTeam.team_id,
      };

      const { workFlowData, count } = await getWorkFlowTableOnLoad(
        supabaseClient,
        params
      );

      setWorkFlowList(workFlowData);
      setWorkFlowCount(count);
    } catch (e) {
      notifications.show({
        message: "Failed to fetch workflow list.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePagination = async (page: number) => {
    try {
      await handleFetchWorkflowList(page);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFilterChange = async (
    key: keyof FilterSelectedValuesType,
    value: string[] | Date[] | boolean = []
  ) => {
    const filterMatch = filterSelectedValues[`${key}`];
    if (value !== filterMatch) {
      handleFilterForms();
      setFilterSelectedValues((prev) => ({ ...prev, [`${key}`]: value }));
      setFilterSelectedValues({ ...filterSelectedValues, [key]: value });
    }
  };
  const handleFilterForms = async () => {
    try {
      setActivePage(1);
      await handleFetchWorkflowList(1);
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setValue("isAscendingSort", sortStatus.direction === "asc" ? true : false);
    setFilter((prev) => {
      return {
        ...prev,
        isAscendingSort: sortStatus.direction === "asc" ? false : true,
      };
    });
    handlePagination(activePage);
  }, [sortStatus]);

  useEffect(() => {
    handlePagination(activePage);
  }, [activeTeam]);

  return (
    <Container maw={3840} h="100%">
      <Group pb="sm">
        <Box>
          <Title order={4}>Workflow List Page</Title>
          <Text>Manage your workflow here.</Text>
        </Box>
      </Group>
      <Paper p="md">
        <form
          onSubmit={handleSubmit(() => {
            handlePagination(activePage);
          })}
        >
          <Flex justify={"space-between"} align={"center"}>
            <Flex gap="sm" wrap="wrap" align="center">
              <TextInput
                placeholder="Search Workflow ID"
                rightSection={
                  <ActionIcon size="xs" type="submit">
                    <IconSearch />
                  </ActionIcon>
                }
                {...register("searchFilter")}
                sx={{ flex: 2 }}
                miw={250}
                maw={320}
              />
              <Button
                variant="light"
                leftIcon={<IconReload size={16} />}
                onClick={() => {
                  setActivePage(1);
                  handlePagination(activePage);
                }}
              >
                Refresh
              </Button>
              <Flex gap="sm" wrap="wrap" align="center">
                <p>Show/Hide Table Columns</p>
                <Switch
                  onLabel={"ON"}
                  offLabel={"OFF"}
                  checked={showTableColumnFilter}
                  onChange={(event) =>
                    setShowTableColumnFilter(event.currentTarget.checked)
                  }
                />
              </Flex>
              <Flex gap="sm" wrap="wrap" align="center">
                <p>Filter</p>
                <Switch
                  onLabel={"ON"}
                  offLabel={"OFF"}
                  checked={isFilter}
                  onChange={(event) => setIsfilter(event.currentTarget.checked)}
                />
              </Flex>
            </Flex>
            <Button
              onClick={() =>
                router.push(
                  `/${formatTeamNameToUrlKey(
                    activeTeam.team_name
                  )}/workflows/create`
                )
              }
              leftIcon={<IconPlus size={16} />}
            >
              Create Workflow
            </Button>
          </Flex>
          <Divider my="md" />
          {isFilter && (
            <Flex gap="sm" wrap="wrap" mb="sm">
              <Controller
                control={control}
                name="creatorList"
                render={({ field: { value, onChange } }) => (
                  <MultiSelect
                    data={memberList}
                    placeholder="Creator"
                    ref={creatorRef}
                    value={value}
                    onChange={(value) => {
                      onChange(value);
                      if (!creatorRefFocused)
                        handleFilterChange("creatorList", value);
                    }}
                    onDropdownClose={() =>
                      handleFilterChange("creatorList", value)
                    }
                    {...inputFilterProps}
                    sx={{ flex: 1 }}
                    miw={250}
                    maw={320}
                  />
                )}
              />
              <Controller
                control={control}
                name="dateRange"
                render={({ field: { value, onChange } }) => (
                  <DatePickerInput
                    ref={dateRef}
                    placeholder="Pick date range"
                    type="range"
                    value={value as unknown as [Date | null, Date | null]}
                    onChange={(value) => {
                      onChange(value as Date[]);
                      if (!dateRefFocused)
                        handleFilterChange("dateRange", value as Date[]);
                    }}
                    popoverProps={{
                      onClose: () =>
                        handleFilterChange(
                          "dateRange",
                          value as unknown as Date[]
                        ),
                    }}
                    sx={{ flex: 1 }}
                    miw={250}
                    maw={320}
                    {...dateFilterProps}
                  />
                )}
              />
            </Flex>
          )}
        </form>

        <Box h="fit-content" pos="relative">
          <ListTable
            idAccessor="workflow_id"
            records={workFlowList}
            fetching={isLoading}
            page={activePage}
            onPageChange={(page) => {
              setActivePage(page);
              handlePagination(activePage);
            }}
            totalRecords={workflowCount}
            recordsPerPage={DEFAULT_REQUEST_LIST_LIMIT}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            columns={[
              {
                accessor: "workflow_id",
                title: "Workflow ID",
                width: 180,
                hidden: checkIfColumnIsHidden("workflow_id"),
                render: ({ workflow_id }) => {
                  return (
                    <Flex key={String(workflow_id)} justify="space-between">
                      <Text truncate maw={150}>
                        <Anchor
                          href={`/${formatTeamNameToUrlKey(
                            activeTeam.team_name ?? ""
                          )}/workflows/${workflow_id}`}
                          target="_blank"
                          color="blue"
                        >
                          {String(workflow_id)}
                        </Anchor>
                      </Text>

                      <CopyButton value={String(workflow_id)}>
                        {({ copied, copy }) => (
                          <Tooltip
                            label={copied ? "Copied" : `Copy ${workflow_id}`}
                            onClick={copy}
                          >
                            <ActionIcon>
                              <IconCopy size={16} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </Flex>
                  );
                },
              },
              {
                accessor: "workflow_label",
                title: "Workflow Name",
                hidden: checkIfColumnIsHidden("workflow_label"),
                render: ({ workflow_label }) => {
                  return <Flex justify="start">{String(workflow_label)}</Flex>;
                },
              },
              {
                accessor: "workflow_version_label",
                title: "Workflow Version",
                sortable: true,
                hidden: checkIfColumnIsHidden("workflow_version_label"),
                render: ({ workflow_version_label }) => {
                  return (
                    <Flex justify="start">
                      <Badge
                        variant="filled"
                        color={getStatusToColor(String(workflow_version_label))}
                      >
                        Version {String(workflow_version_label)}
                      </Badge>
                    </Flex>
                  );
                },
              },
              {
                accessor: "user_id",
                title: "Created By",
                sortable: true,
                hidden: checkIfColumnIsHidden("user_id"),
                render: (workflow) => {
                  if (!workflow) {
                    console.error("No data for created_by");
                    return null;
                  }

                  const {
                    user_id: user_id,
                    user_first_name: user_first_name,
                    user_last_name: user_last_name,
                    team_member_id,
                  } = workflow.created_by as {
                    user_id: string;
                    user_first_name: string;
                    user_last_name: string;
                    team_member_id: string;
                  };
                  return (
                    <Flex px={0} gap={8} align="center">
                      <Avatar
                        {...defaultAvatarProps}
                        color={getAvatarColor(
                          Number(`${user_id.charCodeAt(0)}`)
                        )}
                        className={classes.requestor}
                        onClick={() => window.open(`/member/${team_member_id}`)}
                      >
                        {user_first_name[0] + user_last_name[0]}
                      </Avatar>
                      <Anchor
                        href={`/member/${team_member_id}`}
                        target="_blank"
                      >
                        <Text>{`${user_first_name} ${user_last_name}`}</Text>
                      </Anchor>
                    </Flex>
                  );
                },
              },
              {
                accessor: "user_id",
                title: "Updated By",
                sortable: true,
                hidden: checkIfColumnIsHidden("updated_id"),
                render: (workflow) => {
                  if (!workflow.updated_by) {
                    return null;
                  }
                  const {
                    user_id: user_id,
                    user_first_name: user_first_name,
                    user_last_name: user_last_name,
                    team_member_id,
                  } = workflow.updated_by as {
                    user_id: string;
                    user_first_name: string;
                    user_last_name: string;
                    team_member_id: string;
                  };
                  return (
                    <Flex px={0} gap={8} align="center">
                      <Avatar
                        {...defaultAvatarProps}
                        color={getAvatarColor(
                          Number(`${user_id.charCodeAt(0)}`)
                        )}
                        className={classes.requestor}
                        onClick={() => window.open(`/member/${team_member_id}`)}
                      >
                        {user_first_name[0] + user_last_name[0]}
                      </Avatar>
                      <Anchor
                        href={`/member/${team_member_id}`}
                        target="_blank"
                      >
                        <Text>{`${user_first_name} ${user_last_name}`}</Text>
                      </Anchor>
                    </Flex>
                  );
                },
              },
              {
                accessor: "workflow_date_created",
                title: "Date Created",
                sortable: true,
                hidden: checkIfColumnIsHidden("workflow_date_created"),
                render: ({ workflow_date_created }) => {
                  if (!workflow_date_created) {
                    return null;
                  }

                  return (
                    <Flex justify="start">
                      <Text>
                        {formatDate(new Date(String(workflow_date_created)))}
                      </Text>
                    </Flex>
                  );
                },
              },
              {
                accessor: "workflow_date_updated",
                title: "Date Updated",
                sortable: true,
                hidden: checkIfColumnIsHidden("workflow_date_updated"),
                render: ({ workflow_date_updated }) => {
                  if (!workflow_date_updated) {
                    return null;
                  }

                  return (
                    <Flex justify="start">
                      <Text>
                        {formatDate(new Date(String(workflow_date_updated)))}
                      </Text>
                    </Flex>
                  );
                },
              },
              {
                accessor: "view",
                title: "View",
                hidden: checkIfColumnIsHidden("view"),
                render: ({ workflow_id }) => {
                  return (
                    <Flex justify="center">
                      <ActionIcon
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/${formatTeamNameToUrlKey(
                              activeTeam.team_name ?? ""
                            )}/workflows/${workflow_id}`
                          )
                        }
                      >
                        <IconArrowsMaximize size={16} />
                      </ActionIcon>
                    </Flex>
                  );
                },
              },
            ]}
            showTableColumnFilter={showTableColumnFilter}
            setShowTableColumnFilter={setShowTableColumnFilter}
            listTableColumnFilter={listTableColumnFilter}
            setListTableColumnFilter={setListTableColumnFilter}
            tableColumnList={tableColumnList}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default WorkFlowTable;
