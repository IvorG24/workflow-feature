import { removeMemberFromGroup } from "@/backend/api/delete";
import { getTeamGroupMemberList } from "@/backend/api/get";
import { ROW_PER_PAGE } from "@/utils/constant";
import { generateRandomId } from "@/utils/functions";
import { getAvatarColor } from "@/utils/styling";
import { TeamGroupTableRow } from "@/utils/types";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Checkbox,
  Flex,
  Group,
  Text,
  TextInput,
  Title,
  createStyles,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { DataTable, DataTableColumn } from "mantine-datatable";
import { Dispatch, SetStateAction, useState } from "react";
import { TeamMemberType } from "./GroupMembers";

const useStyles = createStyles((theme) => ({
  checkbox: {
    input: { cursor: "pointer" },
  },
  flexGrow: {
    [theme.fn.smallerThan("lg")]: {
      flexGrow: 1,
    },
  },
}));

type Props = {
  groupMemberList: TeamMemberType[];
  setGroupMemberList: Dispatch<SetStateAction<TeamMemberType[]>>;
  groupMemberListCount: number;
  setGroupMemberListCount: Dispatch<SetStateAction<number>>;
  setIsAddingMember: Dispatch<SetStateAction<boolean>>;
  checkList: string[];
  setCheckList: Dispatch<SetStateAction<string[]>>;
  activePage: number;
  setActivePage: Dispatch<SetStateAction<number>>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  selectedGroup: TeamGroupTableRow;
  isOwnerOrAdmin: boolean;
};

const MemberList = ({
  groupMemberList,
  setGroupMemberList,
  groupMemberListCount,
  setGroupMemberListCount,
  setIsAddingMember,
  checkList,
  setCheckList,
  activePage,
  setActivePage,
  search,
  setSearch,
  selectedGroup,
  isOwnerOrAdmin,
}: Props) => {
  const { classes } = useStyles();
  const supabaseClient = useSupabaseClient();

  const [isLoading, setIsLoading] = useState(false);

  const headerCheckboxKey = generateRandomId();

  const handleCheckRow = (groupMemberId: string) => {
    if (checkList.includes(groupMemberId)) {
      setCheckList(checkList.filter((id) => id !== groupMemberId));
    } else {
      setCheckList([...checkList, groupMemberId]);
    }
  };

  const handleCheckAllRows = (checkAll: boolean) => {
    if (checkAll) {
      const memberIdList = groupMemberList.map(
        (groupMember) => groupMember.team_group_member_id
      );
      setCheckList(memberIdList);
    } else {
      setCheckList([]);
    }
  };

  const handleSearch = async (isEmpty?: boolean) => {
    if (activePage !== 1) {
      setActivePage(1);
    }
    handleFetch(isEmpty ? "" : search, 1);
  };

  const handleFetch = async (search: string, page: number) => {
    setIsLoading(true);
    try {
      const { data, count } = await getTeamGroupMemberList(supabaseClient, {
        groupId: selectedGroup.team_group_id,
        search,
        limit: ROW_PER_PAGE,
        page: page,
      });

      setGroupMemberList(data as unknown as TeamMemberType[]);
      setGroupMemberListCount(Number(count));
    } catch (e) {
      notifications.show({
        message: "Error on fetching group member list",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    const saveCheckList = checkList;
    const savedRecord = groupMemberList;

    try {
      setCheckList([]);
      await removeMemberFromGroup(supabaseClient, {
        teamGroupMemberIdList: checkList,
      });
      handleFetch("", 1);
      notifications.show({
        message: "Group member/s removed.",
        color: "green",
      });
    } catch {
      setGroupMemberList(savedRecord);
      setCheckList(saveCheckList);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const columnData: DataTableColumn<TeamMemberType>[] = [
    {
      accessor: "checkbox",
      title: (
        <Checkbox
          key={headerCheckboxKey}
          className={classes.checkbox}
          checked={
            checkList.length > 0 && checkList.length === groupMemberList.length
          }
          size="xs"
          onChange={(e) => handleCheckAllRows(e.currentTarget.checked)}
        />
      ),
      render: ({ team_group_member_id }) => (
        <Checkbox
          className={classes.checkbox}
          size="xs"
          checked={checkList.includes(team_group_member_id)}
          onChange={() => {
            handleCheckRow(team_group_member_id);
          }}
        />
      ),
      width: 40,
    },
    {
      accessor: "team_member.team_member_user.user_id",
      title: "Member Name",
      render: ({ team_member }) => (
        <Flex gap="xs">
          <Avatar
            size={24}
            src={team_member.team_member_user.user_avatar}
            color={getAvatarColor(
              Number(`${team_member.team_member_user.user_id.charCodeAt(0)}`)
            )}
            radius="xl"
          >
            {(
              team_member.team_member_user.user_first_name[0] +
              team_member.team_member_user.user_last_name[0]
            ).toUpperCase()}
          </Avatar>
          <Text>
            {team_member.team_member_user.user_first_name}{" "}
            {team_member.team_member_user.user_last_name}
          </Text>
        </Flex>
      ),
    },
    {
      accessor: "team_member.team_member_user.user_email",
      title: "Email",
      render: ({ team_member }) => (
        <Text>{team_member.team_member_user.user_email}</Text>
      ),
    },
    {
      accessor: "team_member.team_member_project_list",
      title: "Project",
      render: ({ team_member }) => (
        <Text>
          {team_member.team_member_project_list
            ? team_member.team_member_project_list.join(", ")
            : ""}
        </Text>
      ),
    },
  ];

  return (
    <Box>
      <Flex align="center" justify="space-between" wrap="wrap" gap="xs">
        <Group className={classes.flexGrow}>
          <Title m={0} p={0} order={3}>
            Group Members
          </Title>
          <TextInput
            miw={250}
            placeholder="Member Name"
            rightSection={
              <ActionIcon onClick={() => search && handleSearch()}>
                <IconSearch size={16} />
              </ActionIcon>
            }
            value={search}
            onChange={async (e) => {
              setSearch(e.target.value);
              if (e.target.value === "") {
                handleSearch(true);
              }
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                if (search) {
                  handleSearch();
                }
              }
            }}
            maxLength={4000}
            className={classes.flexGrow}
          />
        </Group>
        <Group className={classes.flexGrow}>
          {checkList.length !== 0 ? (
            <Button
              variant="outline"
              rightIcon={<IconTrash size={16} />}
              className={classes.flexGrow}
              onClick={() => {
                openConfirmModal({
                  title: <Text>Please confirm your action.</Text>,
                  children: (
                    <Text size={14}>
                      Are you sure you want to remove{" "}
                      {checkList.length === 1
                        ? "this group member?"
                        : "these group members?"}
                    </Text>
                  ),
                  labels: { confirm: "Confirm", cancel: "Cancel" },
                  centered: true,
                  onConfirm: handleRemove,
                });
              }}
            >
              Remove
            </Button>
          ) : null}
          {isOwnerOrAdmin && (
            <Button
              rightIcon={<IconPlus size={16} />}
              className={classes.flexGrow}
              onClick={() => setIsAddingMember(true)}
            >
              Add
            </Button>
          )}
        </Group>
      </Flex>
      <DataTable
        idAccessor="team_group_member_id"
        mt="xs"
        withBorder
        fw="bolder"
        c="dimmed"
        minHeight={390}
        fetching={isLoading}
        records={groupMemberList}
        columns={columnData.slice(isOwnerOrAdmin ? 0 : 1)}
        totalRecords={groupMemberListCount}
        recordsPerPage={ROW_PER_PAGE}
        page={activePage}
        onPageChange={(page: number) => {
          setActivePage(page);
          handleFetch(search, page);
        }}
      />
    </Box>
  );
};

export default MemberList;