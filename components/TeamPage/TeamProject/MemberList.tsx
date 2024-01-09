import { removeMemberFromProject } from "@/backend/api/delete";
import { getTeamProjectMemberList } from "@/backend/api/get";
import { ROW_PER_PAGE } from "@/utils/constant";
import { generateRandomId } from "@/utils/functions";
import { getAvatarColor } from "@/utils/styling";
import { TeamProjectTableRow } from "@/utils/types";
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
import { TeamMemberType } from "./ProjectMembers";

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
  projectMemberList: TeamMemberType[];
  setProjectMemberList: Dispatch<SetStateAction<TeamMemberType[]>>;
  projectMemberListCount: number;
  setProjectMemberListCount: Dispatch<SetStateAction<number>>;
  setIsAddingMember: Dispatch<SetStateAction<boolean>>;
  checkList: string[];
  setCheckList: Dispatch<SetStateAction<string[]>>;
  activePage: number;
  setActivePage: Dispatch<SetStateAction<number>>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  selectedProject: TeamProjectTableRow;
  isOwnerOrAdmin: boolean;
};

const MemberList = ({
  projectMemberList,
  setProjectMemberList,
  projectMemberListCount,
  setProjectMemberListCount,
  setIsAddingMember,
  checkList,
  setCheckList,
  activePage,
  setActivePage,
  search,
  setSearch,
  selectedProject,
  isOwnerOrAdmin,
}: Props) => {
  const { classes } = useStyles();
  const supabaseClient = useSupabaseClient();

  const [isLoading, setIsLoading] = useState(false);

  const headerCheckboxKey = generateRandomId();

  const handleCheckRow = (projectMemberId: string) => {
    if (checkList.includes(projectMemberId)) {
      setCheckList(checkList.filter((id) => id !== projectMemberId));
    } else {
      setCheckList([...checkList, projectMemberId]);
    }
  };

  const handleCheckAllRows = (checkAll: boolean) => {
    if (checkAll) {
      const memberIdList = projectMemberList.map(
        (projectMember) => projectMember.team_project_member_id
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
      const { data, count } = await getTeamProjectMemberList(supabaseClient, {
        projectId: selectedProject.team_project_id,
        search,
        limit: ROW_PER_PAGE,
        page: page,
      });

      setProjectMemberList(data as unknown as TeamMemberType[]);
      setProjectMemberListCount(Number(count));
    } catch {
      notifications.show({
        message: "Error on fetching project member list",
        color: "red",
      });
    }
    setIsLoading(false);
  };

  const handleRemove = async () => {
    const saveCheckList = checkList;
    const savedRecord = projectMemberList;

    try {
      const updatedProjectMemberList = projectMemberList.filter(
        (projectMember) => {
          if (!checkList.includes(projectMember.team_project_member_id)) {
            return projectMember;
          }
        }
      );
      setProjectMemberList(updatedProjectMemberList);
      setCheckList([]);

      await removeMemberFromProject(supabaseClient, {
        teamProjectMemberIdList: checkList,
      });

      notifications.show({
        message: "Project member/s removed.",
        color: "green",
      });
    } catch {
      setProjectMemberList(savedRecord);
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
            checkList.length > 0 &&
            checkList.length === projectMemberList.length
          }
          size="xs"
          onChange={(e) => handleCheckAllRows(e.currentTarget.checked)}
        />
      ),
      render: ({ team_project_member_id }) => (
        <Checkbox
          className={classes.checkbox}
          size="xs"
          checked={checkList.includes(team_project_member_id)}
          onChange={() => {
            handleCheckRow(team_project_member_id);
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
      accessor: "team_member.team_member_role",
      title: "Role",
      render: ({ team_member }) => <Text>{team_member.team_member_role}</Text>,
    },
    {
      accessor: "team_member.team_member_group_list",
      title: "Group",
      render: ({ team_member }) => (
        <Text>{team_member.team_member_group_list.join(",")}</Text>
      ),
    },
  ];

  return (
    <Box>
      <Flex align="center" justify="space-between" wrap="wrap" gap="xs">
        <Group className={classes.flexGrow}>
          <Title m={0} p={0} order={3}>
            Project Members
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
                        ? "this project member?"
                        : "these project members?"}
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
        idAccessor="team_project_member_id"
        mt="xs"
        withBorder
        fw="bolder"
        c="dimmed"
        minHeight={390}
        fetching={isLoading}
        records={projectMemberList}
        columns={columnData.slice(isOwnerOrAdmin ? 0 : 1)}
        totalRecords={projectMemberListCount}
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
