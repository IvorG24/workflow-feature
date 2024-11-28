import { getModuleList } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { DEFAULT_REQUEST_LIST_LIMIT, formatDate } from "@/utils/constant";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { getAvatarColor } from "@/utils/styling";
import { ModuleListType } from "@/utils/types";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  CopyButton,
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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import ListTable from "../ListTable/ListTable";

type FilterFormValues = {
  creator: string[];
  dateRange: Date[];
  searchFilter: string;
  isAscendingSort: boolean;
};

const inputFilterProps = {
  w: { base: 200, sm: 300 },
  clearable: true,
  clearSearchOnChange: true,
  clearSearchOnBlur: true,
  searchable: true,
  nothingFound: "Nothing found",
};

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
const dateFilterProps = {
  w: { base: 200, sm: 300 },
  clearable: true,
};
const ModuleTable = () => {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const activeTeam = useActiveTeam();
  const [filter, setFilter] = useState<FilterFormValues>({
    creator: [],
    dateRange: [],
    searchFilter: "",
    isAscendingSort: false,
  });
  const [showTableColumnFilter, setShowTableColumnFilter] = useState(false);
  const [isFilter, setIsfilter] = useState(false);
  const { ref: dateRef, focused: dateRefFocused } = useFocusWithin();
  const { ref: creatorRef, focused: creatorRefFocused } = useFocusWithin();
  const [isLoading, setIsLoading] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [moduleList, setModuleList] = useState<ModuleListType[]>([]);
  const [moduleListCount, setModuleListCount] = useState(0);
  const [listTableColumnFilter, setListTableColumnFilter] = useLocalStorage<
    string[]
  >({
    key: "module-list-table-column-filter",
    defaultValue: [],
  });

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "module_version_date_created",
    direction: "desc",
  });

  const [filterSelectedValues, setFilterSelectedValues] =
    useState<FilterFormValues>({
      creator: [],
      dateRange: [],
      searchFilter: "",
      isAscendingSort: false,
    });
  const { handleSubmit, getValues, register, setValue, control } =
    useForm<FilterFormValues>({
      defaultValues: filter,
    });

  const handleFilterChange = async (
    key: keyof FilterFormValues,
    value: string[] | Date[] | boolean = []
  ) => {
    const filterMatch = filter[`${key}`];

    if (value !== filterMatch) {
      handleFilterForms();
      setFilter((prev) => ({ ...prev, [`${key}`]: value }));
      setFilterSelectedValues((prev) => ({ ...prev, [`${key}`]: value }));
      setFilterSelectedValues({ ...filterSelectedValues, [key]: value });
    }
  };

  const tableColumnList = [
    { value: "module_id", label: "Module ID" },
    { value: "module_name", label: "Module Name" },
    { value: "module_version_label", label: "Module Label" },
    { value: "module_version_date_created", label: "Module Date Created" },
    { value: "module_version_date_updated", label: "Module Date Updated" },
    {
      value: "module_version_created_by_team_member_id",
      label: "Module Created By",
    },
    {
      value: "module_version_updated_by_team_member_id",
      label: "Module Updated By",
    },
    { value: "view", label: "View" },
  ];

  const checkIfColumnIsHidden = (column: string) => {
    const isHidden = listTableColumnFilter.includes(column);
    return isHidden;
  };

  const handleFetchModule = async (page: number) => {
    try {
      setIsLoading(true);
      if (!activeTeam.team_id) {
        console.warn(
          "RequestListPage handleFilterFormsError: active team_id not found"
        );
        return;
      }
      const { searchFilter, isAscendingSort, creator, dateRange } = getValues();

      const { moduleCount, moduleData } = await getModuleList(supabaseClient, {
        teamId: activeTeam.team_id,
        page: page || 1,
        limit: DEFAULT_REQUEST_LIST_LIMIT,
        searchFilter: searchFilter,
        dateRange: dateRange,
        creator: creator,
        columnAccessor: sortStatus.columnAccessor,
        sort: isAscendingSort,
      });

      setModuleList(moduleData);
      setModuleListCount(moduleCount || 0);
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
      await handleFetchModule(page);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterForms = async () => {
    try {
      setActivePage(1);
      await handleFetchModule(1);
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };
  // sorting
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
          <Title order={4}>Module List Page</Title>
          <Text>Manage your module here.</Text>
        </Box>
      </Group>

      {/* table */}
      <Paper p="md">
        <form
          onSubmit={handleSubmit(() => {
            handlePagination(activePage);
          })}
        >
          <Flex gap="sm" wrap="wrap" align="center" justify="space-between">
            <Flex align="center" gap="sm" wrap="wrap">
              <TextInput
                placeholder="Search Module ID"
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
                  onLabel="ON"
                  offLabel="OFF"
                  checked={showTableColumnFilter}
                  onChange={(event) =>
                    setShowTableColumnFilter(event.currentTarget.checked)
                  }
                />
              </Flex>
              <Flex gap="sm" wrap="wrap" align="center">
                <p>Filter</p>
                <Switch
                  onLabel="ON"
                  offLabel="OFF"
                  checked={isFilter}
                  onChange={(event) => setIsfilter(event.currentTarget.checked)}
                />
              </Flex>
            </Flex>

            <Flex align="center" gap="xs">
              <Button
                leftIcon={<IconPlus size={16} />}
                onClick={() =>
                  router.push(
                    `/${formatTeamNameToUrlKey(
                      activeTeam.team_name ?? ""
                    )}/modules/create`
                  )
                }
              >
                Create Module
              </Button>
            </Flex>
          </Flex>
          <Divider my="md" />
          {isFilter && (
            <Flex gap="sm" wrap="wrap" mb="sm">
              <Controller
                control={control}
                name="creator"
                render={({ field: { value, onChange } }) => (
                  <MultiSelect
                    data={creatorList}
                    placeholder="Creator"
                    ref={creatorRef}
                    value={value}
                    onChange={(value) => {
                      onChange(value);
                      if (!creatorRefFocused)
                        handleFilterChange("creator", value);
                    }}
                    onDropdownClose={() => handleFilterChange("creator", value)}
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
                      onChange(value as unknown as Date[]);
                      if (!dateRefFocused)
                        handleFilterChange(
                          "dateRange",
                          value as unknown as Date[]
                        );
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
            idAccessor="module_id"
            records={moduleList}
            fetching={isLoading}
            page={activePage}
            onPageChange={(page) => {
              setActivePage(page);
              // handlePagination({ overidePage: page });
            }}
            totalRecords={moduleListCount}
            recordsPerPage={DEFAULT_REQUEST_LIST_LIMIT}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            columns={[
              {
                accessor: "module_id",
                title: "Module ID",
                width: 180,
                hidden: checkIfColumnIsHidden("module_id"),
                render: ({ module_id }) => {
                  return (
                    <Flex gap="md" align="center">
                      <Text truncate maw={150}>
                        <Anchor
                          target="_blank"
                          color="blue"
                          href={`/${formatTeamNameToUrlKey(
                            activeTeam.team_name ?? ""
                          )}/modules/${module_id}`}
                        >
                          {String(module_id)}
                        </Anchor>
                      </Text>

                      <CopyButton value={String(module_id)}>
                        {({ copied, copy }) => (
                          <Tooltip
                            label={copied ? "Copied" : `Copy ${module_id}`}
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
                accessor: "module_name",
                title: "Module Name",
                hidden: checkIfColumnIsHidden("module_name"),
                sortable: true,
              },
              {
                accessor: "module_version_label",
                title: "Module Version",
                hidden: checkIfColumnIsHidden("module_version_label"),
                sortable: true,
                render: ({ module_version_label }) => {
                  return (
                    <Badge variant="filled">
                      VERSION {String(module_version_label)}
                    </Badge>
                  );
                },
              },
              {
                accessor: "module_version_date_created",
                title: "Date Created",
                hidden: checkIfColumnIsHidden("module_version_date_created"),
                sortable: true,
                render: ({ module_version_date_created }) => {
                  if (!module_version_date_created) return null;
                  return (
                    <Text>
                      {formatDate(
                        new Date(String(module_version_date_created))
                      )}
                    </Text>
                  );
                },
              },
              {
                accessor: "module_version_date_updated",
                title: "Date Updated",
                hidden: checkIfColumnIsHidden("module_version_date_updated"),
                sortable: true,
                render: ({ module_version_date_updated }) => {
                  if (module_version_date_updated === null) return null;

                  return (
                    <Text>
                      {formatDate(
                        new Date(String(module_version_date_updated))
                      )}
                    </Text>
                  );
                },
              },
              {
                accessor: "module_version_created_by_team_member_id",
                title: "Created By",
                hidden: checkIfColumnIsHidden(
                  "module_version_created_by_team_member_id"
                ),
                render: (record) => {
                  const {
                    user_id,
                    user_first_name,
                    user_last_name,
                    request_team_member_id,
                  } = record.module_created_by as {
                    user_id: string;
                    user_first_name: string;
                    user_last_name: string;
                    request_team_member_id: string;
                  };

                  return (
                    <Flex px={0} gap={8} align="center">
                      <Avatar
                        size="sm"
                        radius="xl"
                        color={getAvatarColor(
                          Number(`${user_id.charCodeAt(0)}`)
                        )}
                        src={""}
                      >
                        {(user_first_name[0] + user_last_name[0]).toUpperCase()}
                      </Avatar>

                      <Anchor
                        href={`/member/${request_team_member_id}`}
                        target="_blank"
                      >
                        <Text>{`${user_first_name} ${user_last_name}`}</Text>
                      </Anchor>
                    </Flex>
                  );
                },
              },
              {
                accessor: "module_version_updated_by_team_member_id",
                title: "Updated By",
                hidden: checkIfColumnIsHidden(
                  "module_version_updated_by_team_member_id"
                ),
                render: (record) => {
                  if (!record.module_updated_by) {
                    return null;
                  }

                  const {
                    user_id,
                    user_first_name,
                    user_last_name,
                    request_team_member_id,
                  } = record.module_updated_by as {
                    user_id: string | null;
                    user_first_name: string | null;
                    user_last_name: string | null;
                    request_team_member_id: string | null;
                  };

                  const avatarColor = user_id
                    ? getAvatarColor(Number(user_id.charCodeAt(0)))
                    : getAvatarColor(0);

                  return (
                    <Flex px={0} gap={8} align="center">
                      {user_first_name && user_last_name ? (
                        <Avatar
                          size="sm"
                          radius="xl"
                          color={avatarColor}
                          src={""}
                        >
                          {`${user_first_name[0]}${user_last_name[0]}`.toUpperCase()}
                        </Avatar>
                      ) : null}

                      {user_first_name && user_last_name ? (
                        <Anchor
                          href={
                            request_team_member_id
                              ? `/member/${request_team_member_id}`
                              : "#"
                          }
                          target={request_team_member_id ? "_blank" : undefined}
                        >
                          <Text>{`${user_first_name} ${user_last_name}`}</Text>
                        </Anchor>
                      ) : null}
                    </Flex>
                  );
                },
              },
              {
                accessor: "view",
                title: "view",
                hidden: checkIfColumnIsHidden("view"),
                render: ({ module_id }) => {
                  return (
                    <Flex justify="center">
                      <ActionIcon
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/${formatTeamNameToUrlKey(
                              activeTeam.team_name ?? ""
                            )}/modules/${module_id}`
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

export default ModuleTable;
