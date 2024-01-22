import { getMemoList } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { DEFAULT_REQUEST_LIST_LIMIT } from "@/utils/constant";
import { MemoListItemType, TeamMemberType } from "@/utils/types";
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  Group,
  Loader,
  LoadingOverlay,
  MultiSelect,
  Pagination,
  Paper,
  ScrollArea,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useFocusWithin } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  IconAlertCircle,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import MemoFormatEditor from "./MemoFormatEditor";
import MemoListItemRow from "./MemoListItemRow";

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

const MemoListPage = ({
  memoList: initialMemoList,
  memoListCount: initialMemoListCount,
  teamMemberList,
}: Props) => {
  const userTeamMemberData = useUserTeamMember();
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();

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

  const { handleSubmit, getValues, control, setValue, register } =
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

  useEffect(() => {
    handlePagination();
  }, [activePage]);

  return (
    <Container maw={3840} h="100%">
      <Group>
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
      <form onSubmit={handleSubmit(handleFilterMemo)}>
        <Flex mt="sm" gap="sm" wrap="wrap" align="center">
          <Controller
            control={control}
            name="isAscendingSort"
            render={({ field: { value } }) => {
              return (
                <Tooltip
                  label={
                    getValues("isAscendingSort") ? "Ascending" : "Descending"
                  }
                  openDelay={800}
                >
                  <ActionIcon
                    onClick={async () => {
                      setValue(
                        "isAscendingSort",
                        !getValues("isAscendingSort")
                      );
                      handleFilterMemo();
                    }}
                    size={36}
                    color="dark"
                    variant="outline"
                  >
                    {value ? (
                      <IconSortAscending size={18} />
                    ) : (
                      <IconSortDescending size={18} />
                    )}
                  </ActionIcon>
                </Tooltip>
              );
            }}
          />
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
                  if (!statusRefFocused) handleFilterChange("status", value);
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
      </form>

      <Space h="xl" />

      <Box h="fit-content" pos="relative">
        <LoadingOverlay
          visible={isLoading}
          overlayBlur={0}
          overlayOpacity={0.2}
          loader={<Loader variant="dots" />}
        />
        {/* memo list */}
        {memoList.length > 0 ? (
          <Paper withBorder>
            <ScrollArea h="fit-content" type="auto">
              <Stack spacing={0} miw={1074}>
                <Box
                  sx={(theme) => ({
                    backgroundColor:
                      theme.colorScheme === "dark"
                        ? theme.colors.dark[5]
                        : theme.colors.gray[1],
                  })}
                >
                  <Grid m={0} px="sm" justify="space-between">
                    <Grid.Col span={2}>
                      <Text weight={600}>Reference Number</Text>
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <Text weight={600}>Subject</Text>
                    </Grid.Col>
                    <Grid.Col span={1}>
                      <Text weight={600}>Status</Text>
                    </Grid.Col>
                    <Grid.Col span={1}>
                      <Text weight={600}>Author</Text>
                    </Grid.Col>
                    <Grid.Col span={1}>
                      <Text weight={600}>Approver</Text>
                    </Grid.Col>
                    <Grid.Col span={1}>
                      <Text weight={600}>Date Created</Text>
                    </Grid.Col>
                  </Grid>
                </Box>
                {memoList.map((memo, idx) => (
                  <Box key={memo.memo_id}>
                    <MemoListItemRow memo={memo} />
                    {idx + 1 < DEFAULT_REQUEST_LIST_LIMIT ? <Divider /> : null}
                  </Box>
                ))}
              </Stack>
            </ScrollArea>
          </Paper>
        ) : (
          <Text align="center" size={24} weight="bolder" color="dimmed">
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              color="orange"
              mt="xs"
            >
              No memo found.
            </Alert>
          </Text>
        )}
      </Box>

      <Flex justify="flex-end">
        <Pagination
          value={activePage}
          onChange={setActivePage}
          total={Math.ceil(memoListCount / DEFAULT_REQUEST_LIST_LIMIT)}
          mt="xl"
        />
      </Flex>

      <MemoFormatEditor
        opened={memoFormatEditorIsOpened}
        close={closeMemoFormatEditor}
      />
    </Container>
  );
};

export default MemoListPage;
