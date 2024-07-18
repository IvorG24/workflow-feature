import { getMemoList } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { DEFAULT_REQUEST_LIST_LIMIT, formatDate } from "@/utils/constant";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { MemoListItemType, TeamMemberType } from "@/utils/types";
import {
  ActionIcon,
  Anchor,
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
  Transition,
} from "@mantine/core";
import { useDisclosure, useFocusWithin } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  IconCopy,
  IconEyeFilled,
  IconReload,
  IconSearch,
} from "@tabler/icons-react";
import { DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import ListTable from "../ListTable/ListTable";
import MemoFormatEditor from "../MemoFormatEditor/MemoFormatEditor";

type Props = {
  memoList: MemoListItemType[];
  memoListCount: number;
  teamMemberList: TeamMemberType[];
};

type FilterFormValues = {
  authorFilter: string[];
  approverFilter: string[];
  status: string[] | undefined;
  isAscendingSort: boolean;
  searchFilter: string;
};

type ApproverType = {
  memo_signer_list: {
    memo_signer_team_member: {
      user: {
        user_first_name: string;
        user_last_name: string;
      };
    };
  }[];
};

const MemoListPage = ({
  memoList: initialMemoList,
  memoListCount: initialMemoListCount,
  teamMemberList,
}: Props) => {
  const userTeamMemberData = useUserTeamMember();
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const [isFilter, setIsfilter] = useState(false);

  // filter data
  const { ref: authorRef, focused: authorRefFocused } = useFocusWithin();
  const { ref: approverRef, focused: approverRefFocused } = useFocusWithin();
  const { ref: statusRef, focused: statusRefFocused } = useFocusWithin();

  const authorList = teamMemberList.map((member) => ({
    value: member.team_member_user.user_id,
    label: `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`,
  }));

  const approverList = teamMemberList.map((member) => ({
    value: member.team_member_id,
    label: `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`,
  }));

  const statusList = [
    { value: "APPROVED", label: "Approved" },
    { value: "PENDING", label: "Pending" },
    { value: "REJECTED", label: "Rejected" },
  ];

  const [
    memoFormatEditorIsOpened,
    { open: openMemoFormatEditor, close: closeMemoFormatEditor },
  ] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [memoListCount, setMemoListCount] = useState(initialMemoListCount);
  const [memoList, setMemoList] = useState(initialMemoList);
  const [filter, setFilter] = useState<FilterFormValues>({
    authorFilter: [],
    approverFilter: [],
    status: undefined,
    isAscendingSort: false,
    searchFilter: "",
  });
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "name",
    direction: "asc",
  });

  const { handleSubmit, getValues, control, register } =
    useForm<FilterFormValues>({
      defaultValues: filter,
    });

  const handleFilterMemo = async (
    {
      authorFilter,
      approverFilter,
      status,
      isAscendingSort,
      searchFilter,
    }: FilterFormValues = getValues()
  ) => {
    try {
      if (!activeTeam.team_id) return;
      setIsLoading(true);

      const { data, count } = await getMemoList(supabaseClient, {
        teamId: activeTeam.team_id,
        page: activePage,
        limit: 13,
        authorFilter:
          authorFilter && authorFilter.length > 0 ? authorFilter : undefined,
        approverFilter:
          approverFilter && approverFilter.length > 0
            ? approverFilter
            : undefined,
        status: status && status.length > 0 ? status : undefined,
        sort: isAscendingSort ? "ascending" : "descending",
        searchFilter,
      });

      setMemoList(data);
      setMemoListCount(count || 0);
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
    key: keyof FilterFormValues,
    value: string[] | boolean = []
  ) => {
    const filterMatch = filter[`${key}`];

    if (value !== filterMatch) {
      handleFilterMemo();
      setFilter((prev) => ({ ...prev, [`${key}`]: value }));
    }
  };

  const handlePagination = async () => {
    try {
      if (!activeTeam.team_id) return;
      setIsLoading(true);

      const { data, count } = await getMemoList(supabaseClient, {
        teamId: activeTeam.team_id,
        page: activePage,
        limit: 13,
      });

      setMemoList(data);
      setMemoListCount(count || 0);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // sorting
  useEffect(() => {
    if (sortStatus.columnAccessor === "memo_id") {
      const result = [...memoList].sort((a, b) => {
        return sortStatus.direction === "asc"
          ? a.memo_id.localeCompare(b.memo_id)
          : b.memo_id.localeCompare(a.memo_id);
      });

      setMemoList(result);
    }
    if (sortStatus.columnAccessor === "memo_subject") {
      const result = memoList.sort((a, b) =>
        sortStatus.direction === "asc"
          ? a.memo_subject.localeCompare(b.memo_subject)
          : sortStatus.direction === "desc"
          ? b.memo_subject.localeCompare(a.memo_subject)
          : 0
      );
      setMemoList(result);
    }
    if (sortStatus.columnAccessor === "memo_status") {
      const result = [...memoList].sort((a, b) => {
        return sortStatus.direction === "asc"
          ? a.memo_status.localeCompare(b.memo_status)
          : b.memo_status.localeCompare(a.memo_status);
      });

      setMemoList(result);
    }

    if (sortStatus.columnAccessor === "memo_author_user_id") {
      const result = [...memoList].sort((a, b) => {
        const firstNameA = a.memo_author_user.user_first_name.toUpperCase();
        const firstNameB = b.memo_author_user.user_first_name.toUpperCase();
        if (sortStatus.direction === "asc") {
          if (firstNameA < firstNameB) {
            return -1;
          }
          if (firstNameA > firstNameB) {
            return 1;
          }
          return 0;
        } else if (sortStatus.direction === "desc") {
          if (firstNameA > firstNameB) {
            return -1;
          }
          if (firstNameA < firstNameB) {
            return 1;
          }
          return 0;
        } else {
          return 0;
        }
      });

      setMemoList(result);
    }

    if (sortStatus.columnAccessor === "memo_signer_list") {
      const result = [...memoList].sort((a, b) => {
        const firstNameA =
          a.memo_signer_list[0].memo_signer_team_member.user.user_first_name.toUpperCase();
        const firstNameB =
          b.memo_signer_list[0].memo_signer_team_member.user.user_first_name.toUpperCase();
        if (sortStatus.direction === "asc") {
          if (firstNameA < firstNameB) {
            return -1;
          }
          if (firstNameA > firstNameB) {
            return 1;
          }
          return 0;
        } else if (sortStatus.direction === "desc") {
          if (firstNameA > firstNameB) {
            return -1;
          }
          if (firstNameA < firstNameB) {
            return 1;
          }
          return 0;
        } else {
          return 0;
        }
      });

      setMemoList(result);
    }
    if (sortStatus.columnAccessor === "memo_date_created") {
      const result = [...memoList].sort((a, b) => {
        return sortStatus.direction === "asc"
          ? a.memo_date_created.localeCompare(b.memo_date_created)
          : b.memo_date_created.localeCompare(a.memo_date_created);
      });

      setMemoList(result);
    }
  }, [sortStatus]);

  useEffect(() => {
    handlePagination();
  }, [activePage]);

  return (
    <Container maw={3840} h="100%">
      <Group pb="sm">
        <Box>
          <Title order={4}>Memo List Page</Title>
          <Text>Manage your team memo here.</Text>
        </Box>
        {["OWNER", "ADMIN"].includes(
          `${userTeamMemberData?.team_member_role}`
        ) && (
          <Button variant="light" onClick={openMemoFormatEditor}>
            Manage Memo Format
          </Button>
        )}
      </Group>
      {/* memo filters */}
      <Paper p="md">
        <form onSubmit={handleSubmit(handleFilterMemo)}>
          <Flex gap="sm" wrap="wrap" align="center">
            <TextInput
              placeholder="Search memo"
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
                handleFilterMemo();
              }}
            >
              Refresh
            </Button>
            <Flex gap="sm" wrap="wrap" align="center">
              <p>Filter</p>
              <Switch
                onLabel={<IconEyeFilled size="14" />}
                checked={isFilter}
                onChange={(event) => setIsfilter(event.currentTarget.checked)}
              />
            </Flex>
          </Flex>
          <Divider my="md" />
          <Transition
            mounted={isFilter}
            transition="slide-down"
            duration={500}
            timingFunction="ease-in-out"
          >
            {() => (
              <Flex gap="sm" wrap="wrap" align="center" my="sm">
                <Controller
                  control={control}
                  name="status"
                  render={({ field: { value, onChange } }) => (
                    <MultiSelect
                      data={statusList}
                      placeholder="Status"
                      ref={statusRef}
                      value={value}
                      onChange={(value) => {
                        onChange(value);
                        if (!statusRefFocused)
                          handleFilterChange("status", value);
                      }}
                      onDropdownClose={() =>
                        handleFilterChange("status", value as string[])
                      }
                      miw={250}
                      maw={320}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="authorFilter"
                  render={({ field: { value, onChange } }) => (
                    <MultiSelect
                      searchable
                      clearable
                      data={authorList}
                      placeholder="Author"
                      ref={authorRef}
                      value={value}
                      onChange={(value) => {
                        onChange(value);
                        if (!authorRefFocused)
                          handleFilterChange("authorFilter", value);
                      }}
                      onDropdownClose={() =>
                        handleFilterChange("authorFilter", value as string[])
                      }
                      miw={250}
                      maw={320}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="approverFilter"
                  render={({ field: { value, onChange } }) => (
                    <MultiSelect
                      searchable
                      clearable
                      data={approverList}
                      placeholder="Approver"
                      ref={approverRef}
                      value={value}
                      onChange={(value) => {
                        onChange(value);
                        if (!approverRefFocused)
                          handleFilterChange("approverFilter", value);
                      }}
                      onDropdownClose={() =>
                        handleFilterChange("approverFilter", value as string[])
                      }
                      miw={250}
                      maw={320}
                    />
                  )}
                />
              </Flex>
            )}
          </Transition>
        </form>

        <Box h="fit-content" pos="relative">
          {/* memo list */}
          <ListTable
            idAccessor="memo_id"
            records={memoList}
            fetching={isLoading}
            page={activePage}
            onPageChange={setActivePage}
            totalRecords={memoListCount}
            recordsPerPage={DEFAULT_REQUEST_LIST_LIMIT}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            columns={[
              {
                accessor: "memo_id",
                title: "ID",
                width: 180,
                sortable: true,
                render: (memo) => {
                  return (
                    <Flex gap="md" align="center">
                      <Text size="xs" truncate maw={150}>
                        <Anchor
                          href={`/${formatTeamNameToUrlKey(
                            activeTeam.team_name ?? ""
                          )}/memo/${memo.memo_id}`}
                          target="_blank"
                          color="black"
                        >
                          {String(memo.memo_reference_number)}
                        </Anchor>
                      </Text>

                      <CopyButton value={String(memo.memo_reference_number)}>
                        {({ copied, copy }) => (
                          <Tooltip
                            label={
                              copied
                                ? "Copied"
                                : `Copy ${memo.memo_reference_number}`
                            }
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
                accessor: "memo_subject",
                title: "Subject",
                width: 180,
                sortable: true,
              },
              {
                accessor: "memo_status",
                title: "Status",
                width: 180,
                sortable: true,
              },
              {
                accessor: "memo_author_user_id",
                title: "Author",
                width: 180,
                sortable: true,
                render: (memo) => {
                  const { memo_author_user } = memo as {
                    memo_author_user: {
                      user_first_name: string;
                      user_last_name: string;
                      user_avatar: string | null;
                    };
                    memo_author_user_id: string;
                  };
                  const { user_first_name, user_last_name } = memo_author_user;
                  const authorFullname = `${user_first_name} ${user_last_name}`;

                  return <Text>{String(authorFullname)}</Text>;
                },
              },
              {
                accessor: "memo_signer_list",
                title: "Approver",
                width: 180,
                sortable: true,
                render: (memo) => {
                  const { memo_signer_list } = memo as ApproverType;
                  const { memo_signer_team_member } = memo_signer_list[0];
                  const { user } = memo_signer_team_member;
                  const { user_first_name, user_last_name } = user;

                  return <Text>{`${user_first_name} ${user_last_name}`}</Text>;
                },
              },
              {
                accessor: "memo_date_created",
                title: "Date Created",
                width: 180,
                sortable: true,
                render: (memo) => {
                  if (!memo.memo_date_created) {
                    return null;
                  }

                  return (
                    <Text>
                      {formatDate(new Date(String(memo.memo_date_created)))}
                    </Text>
                  );
                },
              },
            ]}
          />
        </Box>
        <MemoFormatEditor
          opened={memoFormatEditorIsOpened}
          close={closeMemoFormatEditor}
        />
      </Paper>
    </Container>
  );
};

export default MemoListPage;
