import { getMemoList } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { DEFAULT_REQUEST_LIST_LIMIT, formatDate } from "@/utils/constant";
import { formatTeamNameToUrlKey, getInitials } from "@/utils/string";
import { getAvatarColor, getStatusToColor } from "@/utils/styling";
import { MemoListItemType, TeamMemberType } from "@/utils/types";
import {
  ActionIcon,
  Alert,
  Anchor,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  CopyButton,
  Flex,
  Group,
  Loader,
  LoadingOverlay,
  MultiSelect,
  Space,
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
  IconCopy,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import ListTable from "../ListTable/ListTable";
import MemoFormatEditor from "../MemoFormatEditor/MemoFormatEditor";
import MemoItemListSignerList from "./MemoListItemSignerList";

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
          <>
            <ListTable
              idAccessor="memo_id"
              records={memoList}
              fetching={isLoading}
              page={activePage}
              onPageChange={setActivePage}
              totalRecords={memoListCount}
              recordsPerPage={DEFAULT_REQUEST_LIST_LIMIT}
              columns={[
                {
                  accessor: "memo_id",
                  title: "ID",
                  width: 180,
                  render: (memo) => {
                    return (
                      <Flex gap="md" align="center">
                        <Text size="xs" truncate maw={150}>
                          <Anchor
                            href={`/${formatTeamNameToUrlKey(
                              activeTeam.team_name ?? ""
                            )}/memo/${memo.memo_id}`}
                            target="_blank"
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
                },
                {
                  accessor: "memo_status",
                  title: "Status",
                  width: 180,
                  render: (memo) => {
                    return (
                      <Badge
                        variant="filled"
                        color={getStatusToColor(String(memo.memo_status))}
                      >
                        {String(memo.memo_status)}
                      </Badge>
                    );
                  },
                },
                {
                  accessor: "memo_author_user_id",
                  title: "Author",
                  width: 180,
                  render: (memo) => {
                    const { memo_author_user, memo_author_user_id } = memo as {
                      memo_author_user: {
                        user_first_name: string;
                        user_last_name: string;
                        user_avatar: string | null;
                      };
                      memo_author_user_id: string;
                    };
                    const { user_first_name, user_last_name, user_avatar } =
                      memo_author_user;
                    const authorFullname = `${user_first_name} ${user_last_name}`;
                    const defaultAvatarProps = {
                      color: "blue",
                      size: "sm",
                      radius: "xl",
                    };

                    return (
                      <Flex px={0} gap={8} wrap="wrap">
                        <Avatar
                          src={user_avatar}
                          {...defaultAvatarProps}
                          color={getAvatarColor(
                            Number(`${memo_author_user_id.charCodeAt(0)}`)
                          )}
                        >
                          {getInitials(authorFullname)}
                        </Avatar>
                        <Text>{String(authorFullname)}</Text>
                      </Flex>
                    );
                  },
                },
                {
                  accessor: "memo_signer_list",
                  title: "Approver",
                  width: 180,
                  render: (memo) => {
                    const { memo_signer_list } = memo as {
                      memo_signer_list: MemoListItemType["memo_signer_list"];
                    };
                    return (
                      <MemoItemListSignerList signerList={memo_signer_list} />
                    );
                  },
                },
                {
                  accessor: "memo_date_created",
                  title: "Date Created",
                  width: 180,
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
          </>
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
      <MemoFormatEditor
        opened={memoFormatEditorIsOpened}
        close={closeMemoFormatEditor}
      />
    </Container>
  );
};

export default MemoListPage;
