import { getTeamAdminListWithFilter } from "@/backend/api/get";
import { updateAdminRole } from "@/backend/api/update";
import { ROW_PER_PAGE } from "@/utils/constant";
import { getAvatarColor } from "@/utils/styling";
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
import { toUpper, uniqueId } from "lodash";
import { DataTable, DataTableColumn } from "mantine-datatable";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { TeamAdminType } from "./AdminGroup";

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
  adminList: TeamAdminType[];
  setAdminList: Dispatch<SetStateAction<TeamAdminType[]>>;
  setIsAddingAdmin: Dispatch<SetStateAction<boolean>>;
  adminListCount: number;
  setAdminListCount: Dispatch<SetStateAction<number>>;
};

const AdminList = ({
  teamId,
  adminList,
  setAdminList,
  setIsAddingAdmin,
  adminListCount,
  setAdminListCount,
}: Props) => {
  const { classes } = useStyles();
  const supabaseClient = useSupabaseClient();
  const headerCheckboxKey = uniqueId();

  const [checkList, setCheckList] = useState<string[]>([]);
  const [activePage, setActivePage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFetchingAdminList, setIsFetchingAdminList] = useState(true);

  useEffect(() => {
    handleFetch("", 1);
  }, []);

  const columnData: DataTableColumn<TeamAdminType>[] = [
    {
      accessor: "checkbox",
      title: (
        <Checkbox
          key={headerCheckboxKey}
          className={classes.checkbox}
          checked={
            checkList.length > 0 && checkList.length === adminList.length
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
      title: "Admin Name",
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
            {toUpper(team_member_user.user_first_name[0])}
            {toUpper(team_member_user.user_last_name[0])}
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

  const handleCheckRow = (adminId: string) => {
    if (checkList.includes(adminId)) {
      setCheckList(checkList.filter((id) => id !== adminId));
    } else {
      setCheckList([...checkList, adminId]);
    }
  };

  const handleCheckAllRows = (checkAll: boolean) => {
    if (checkAll) {
      const adminIdList = adminList.map((admin) => admin.team_member_id);
      setCheckList(adminIdList);
    } else {
      setCheckList([]);
    }
  };

  const handleFetch = async (search: string, page: number) => {
    setIsFetchingAdminList(true);
    try {
      const { data, count } = await getTeamAdminListWithFilter(supabaseClient, {
        teamId,
        search,
        limit: ROW_PER_PAGE,
        page: page,
      });

      setAdminList(data as unknown as TeamAdminType[]);
      setAdminListCount(Number(count));
    } catch (e) {
      notifications.show({
        message: "Error on fetching group admin list",
        color: "red",
      });
    }
    setIsFetchingAdminList(false);
  };

  const handleRemove = async () => {
    const saveCheckList = checkList;
    const savedRecord = adminList;

    try {
      const updatedAdminList = adminList.filter((admin) => {
        if (!checkList.includes(admin.team_member_id)) {
          return admin;
        }
      });
      setAdminList(updatedAdminList);
      setCheckList([]);

      await updateAdminRole(supabaseClient, {
        teamAdminIdList: checkList,
        updateRole: "MEMBER",
      });

      notifications.show({
        message: "Team admin/s removed.",
        color: "green",
      });
    } catch {
      setAdminList(savedRecord);
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
            Admin List
          </Title>
          <TextInput
            miw={250}
            placeholder="Admin Name"
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
                        ? "this group admin?"
                        : "these group admins?"}
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
            onClick={() => setIsAddingAdmin(true)}
          >
            Add
          </Button>
        </Group>
      </Flex>
      <DataTable
        idAccessor="team_group_admin_id"
        mt="xs"
        withBorder
        fw="bolder"
        c="dimmed"
        minHeight={390}
        fetching={isFetchingAdminList}
        records={adminList}
        columns={columnData}
        totalRecords={adminListCount}
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

export default AdminList;
