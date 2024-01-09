import { getTeamApproverListWithFilter } from "@/backend/api/get";
import { updateApproverRole } from "@/backend/api/update";
import { ROW_PER_PAGE } from "@/utils/constant";
import { generateRandomId } from "@/utils/functions";
import { getAvatarColor } from "@/utils/styling";
import { TeamMemberType } from "@/utils/types";
import {
  ActionIcon,
  Avatar,
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
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { TeamApproverType } from "./ApproverGroup";

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
  teamId: string;
  approverList: TeamApproverType[];
  setApproverList: Dispatch<SetStateAction<TeamApproverType[]>>;
  setIsAddingApprover: Dispatch<SetStateAction<boolean>>;
  approverListCount: number;
  setApproverListCount: Dispatch<SetStateAction<number>>;
  teamMemberList: TeamMemberType[];
};

const ApproverList = ({
  teamId,
  approverList,
  setApproverList,
  setIsAddingApprover,
  approverListCount,
  setApproverListCount,
  teamMemberList,
}: Props) => {
  const { classes } = useStyles();
  const supabaseClient = useSupabaseClient();
  const headerCheckboxKey = generateRandomId();

  const [checkList, setCheckList] = useState<string[]>([]);
  const [activePage, setActivePage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFetchingApproverList, setIsFetchingApproverList] = useState(true);

  useEffect(() => {
    handleFetch("", 1);
  }, []);

  useEffect(() => {
    const updatedApproverList = teamMemberList.filter(
      (member) => member.team_member_role === "APPROVER"
    );

    if (!search) {
      setApproverList(updatedApproverList);
    }
  }, [setApproverList, teamMemberList, search]);

  const columnData: DataTableColumn<TeamApproverType>[] = [
    {
      accessor: "checkbox",
      title: (
        <Checkbox
          key={headerCheckboxKey}
          className={classes.checkbox}
          checked={
            checkList.length > 0 && checkList.length === approverList.length
          }
          size="xs"
          onChange={(e) => handleCheckAllRows(e.currentTarget.checked)}
        />
      ),
      render: ({ team_member_id }) => (
        <Checkbox
          className={classes.checkbox}
          size="xs"
          checked={checkList.includes(team_member_id)}
          onChange={() => {
            handleCheckRow(team_member_id);
          }}
        />
      ),
      width: 40,
    },
    {
      accessor: "team_member_user",
      title: "Approver Name",
      render: ({ team_member_user }) => (
        <Flex gap="xs">
          <Avatar
            size={24}
            src={team_member_user.user_avatar}
            color={getAvatarColor(
              Number(`${team_member_user.user_id.charCodeAt(0)}`)
            )}
            radius="xl"
          >
            {(
              team_member_user.user_first_name[0] +
              team_member_user.user_last_name[0]
            ).toUpperCase()}
          </Avatar>
          <Text>
            {team_member_user.user_first_name} {team_member_user.user_last_name}
          </Text>
        </Flex>
      ),
    },
    {
      accessor: "team_member_user.user_email",
      title: "Email",
      render: ({ team_member_user }) => (
        <Text>{team_member_user.user_email}</Text>
      ),
    },
  ];

  const handleCheckRow = (approverId: string) => {
    if (checkList.includes(approverId)) {
      setCheckList(checkList.filter((id) => id !== approverId));
    } else {
      setCheckList([...checkList, approverId]);
    }
  };

  const handleCheckAllRows = (checkAll: boolean) => {
    if (checkAll) {
      const approverIdList = approverList.map(
        (approver) => approver.team_member_id
      );
      setCheckList(approverIdList);
    } else {
      setCheckList([]);
    }
  };

  const handleFetch = async (search: string, page: number) => {
    setIsFetchingApproverList(true);
    try {
      const { data, count } = await getTeamApproverListWithFilter(
        supabaseClient,
        {
          teamId,
          search,
          limit: ROW_PER_PAGE,
          page: page,
        }
      );

      setApproverList(data as unknown as TeamApproverType[]);
      setApproverListCount(Number(count));
    } catch (e) {
      notifications.show({
        message: "Error on fetching group approver list",
        color: "red",
      });
    }
    setIsFetchingApproverList(false);
  };

  const handleRemove = async () => {
    const saveCheckList = checkList;
    const savedRecord = approverList;

    try {
      const updatedApproverList = approverList.filter((approver) => {
        if (!checkList.includes(approver.team_member_id)) {
          return approver;
        }
      });
      setApproverList(updatedApproverList);
      setCheckList([]);

      await updateApproverRole(supabaseClient, {
        teamApproverIdList: checkList,
        updateRole: "MEMBER",
      });

      notifications.show({
        message: "Team approver/s removed.",
        color: "green",
      });
    } catch {
      setApproverList(savedRecord);
      setCheckList(saveCheckList);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleSearch = async (isEmpty?: boolean) => {
    if (activePage !== 1) {
      setActivePage(1);
    }
    handleFetch(isEmpty ? "" : search, 1);
  };

  return (
    <>
      <Flex align="center" justify="space-between" wrap="wrap" gap="xs">
        <Group className={classes.flexGrow}>
          <Title m={0} p={0} order={3}>
            Approver List
          </Title>
          <TextInput
            miw={250}
            placeholder="Approver Name"
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
                        ? "this group approver?"
                        : "these group approvers?"}
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

          <Button
            rightIcon={<IconPlus size={16} />}
            className={classes.flexGrow}
            onClick={() => setIsAddingApprover(true)}
          >
            Add
          </Button>
        </Group>
      </Flex>
      <DataTable
        idAccessor="team_member_id"
        mt="xs"
        withBorder
        fw="bolder"
        c="dimmed"
        minHeight={390}
        fetching={isFetchingApproverList}
        records={approverList}
        columns={columnData}
        totalRecords={approverListCount}
        recordsPerPage={ROW_PER_PAGE}
        page={activePage}
        onPageChange={(page: number) => {
          setActivePage(page);
          handleFetch(search, page);
        }}
      />
    </>
  );
};

export default ApproverList;
