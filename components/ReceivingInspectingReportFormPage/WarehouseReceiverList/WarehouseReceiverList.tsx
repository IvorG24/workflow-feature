import { deleteRow } from "@/backend/api/delete";
import { getReceiverList } from "@/backend/api/get";
import { toggleStatus } from "@/backend/api/update";
import { useActiveTeam } from "@/stores/useTeamStore";
import { ROW_PER_PAGE } from "@/utils/constant";
import { WarehouseReceiverTableRow } from "@/utils/types";
import {
  ActionIcon,
  Box,
  Button,
  Center,
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
import { uniqueId } from "lodash";
import { DataTable } from "mantine-datatable";
import { Dispatch, SetStateAction, useState } from "react";

const useStyles = createStyles((theme) => ({
  checkbox: {
    input: { cursor: "pointer" },
  },
  flexGrow: {
    [theme.fn.smallerThan("lg")]: {
      flexGrow: 1,
    },
  },
  clickableColumn: {
    "&:hover": {
      color:
        theme.colorScheme === "dark"
          ? theme.colors.gray[7]
          : theme.colors.gray[5],
    },
    cursor: "pointer",
  },
}));

type Props = {
  warehouseReceiverList: WarehouseReceiverTableRow[];
  setWarehouseReceiverList: Dispatch<
    SetStateAction<WarehouseReceiverTableRow[]>
  >;
  warehouseReceiverCount: number;
  setWarehouseReceiverCount: Dispatch<SetStateAction<number>>;
  setIsCreatingWarehouseReceiver: Dispatch<SetStateAction<boolean>>;
};

const WarehouseReceiverList = ({
  warehouseReceiverList,
  setWarehouseReceiverList,
  warehouseReceiverCount,
  setWarehouseReceiverCount,
  setIsCreatingWarehouseReceiver,
}: Props) => {
  const { classes } = useStyles();

  const supabaseClient = useSupabaseClient();
  const activeTeam = useActiveTeam();

  const [isLoading, setIsLoading] = useState(false);

  const [activePage, setActivePage] = useState(1);
  const [checkList, setCheckList] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const headerCheckboxKey = uniqueId();

  const handleCheckRow = (warehouseReceiverId: string) => {
    if (checkList.includes(warehouseReceiverId)) {
      setCheckList(checkList.filter((id) => id !== warehouseReceiverId));
    } else {
      setCheckList([...checkList, warehouseReceiverId]);
    }
  };

  const handleCheckAllRows = (checkAll: boolean) => {
    if (checkAll) {
      const warehouseReceiverIdList = warehouseReceiverList.map(
        (warehouseReceiver) => warehouseReceiver.warehouse_receiver_id
      );
      setCheckList(warehouseReceiverIdList);
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
      const { data, count } = await getReceiverList(supabaseClient, {
        receiver: "warehouse",
        teamId: activeTeam.team_id,
        search,
        limit: ROW_PER_PAGE,
        page: page,
      });
      setWarehouseReceiverList(data as WarehouseReceiverTableRow[]);
      setWarehouseReceiverCount(Number(count));
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    const saveCheckList = checkList;
    const savedRecord = warehouseReceiverList;

    try {
      const updatedWarehouseReceiverList = warehouseReceiverList.filter(
        (warehouseReceiver) => {
          if (!checkList.includes(warehouseReceiver.warehouse_receiver_id)) {
            return warehouseReceiver;
          }
        }
      );
      setWarehouseReceiverList(updatedWarehouseReceiverList);
      setCheckList([]);

      await deleteRow(supabaseClient, {
        rowId: checkList,
        table: "warehouse_receiver",
      });

      notifications.show({
        message: "Accounting Processor/s deleted.",
        color: "green",
      });
    } catch {
      setWarehouseReceiverList(savedRecord);
      setCheckList(saveCheckList);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleUpdateStatus = async (
    warehouseReceiverId: string,
    value: boolean
  ) => {
    const savedRecord = warehouseReceiverList;
    try {
      setWarehouseReceiverList((prev) =>
        prev.map((warehouseReceiver) => {
          if (warehouseReceiver.warehouse_receiver_id !== warehouseReceiverId)
            return warehouseReceiver;

          return {
            ...warehouseReceiver,
            warehouse_receiver_is_available: value,
          };
        })
      );

      await toggleStatus(supabaseClient, {
        table: "warehouse_receiver",
        id: warehouseReceiverId,
        status: value,
      });
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
      setWarehouseReceiverList(savedRecord);
    }
  };

  return (
    <Box>
      <Flex align="center" justify="space-between" wrap="wrap" gap="xs">
        <Group className={classes.flexGrow}>
          <Title m={0} p={0} order={3}>
            List of Warehouse Receivers
          </Title>
          <TextInput
            miw={250}
            placeholder="Employee"
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
            onKeyPress={(e) => {
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
                      Are you sure you want to delete{" "}
                      {checkList.length === 1
                        ? "this warehouse receiver?"
                        : "these warehouse receivers?"}
                    </Text>
                  ),
                  labels: { confirm: "Confirm", cancel: "Cancel" },
                  centered: true,
                  onConfirm: handleDelete,
                });
              }}
            >
              Delete
            </Button>
          ) : null}
          <Button
            rightIcon={<IconPlus size={16} />}
            className={classes.flexGrow}
            onClick={() => setIsCreatingWarehouseReceiver(true)}
          >
            Add
          </Button>
        </Group>
      </Flex>
      <DataTable
        idAccessor="warehouse_receiver_id"
        mt="xs"
        withBorder
        fw="bolder"
        c="dimmed"
        minHeight={390}
        fetching={isLoading}
        records={warehouseReceiverList}
        columns={[
          {
            accessor: "checkbox",
            title: (
              <Checkbox
                key={headerCheckboxKey}
                className={classes.checkbox}
                checked={
                  checkList.length > 0 &&
                  checkList.length === warehouseReceiverList.length
                }
                size="xs"
                onChange={(e) => handleCheckAllRows(e.currentTarget.checked)}
              />
            ),
            render: ({ warehouse_receiver_id }) => (
              <Checkbox
                className={classes.checkbox}
                size="xs"
                checked={checkList.includes(warehouse_receiver_id)}
                onChange={() => {
                  handleCheckRow(warehouse_receiver_id);
                }}
              />
            ),
            width: 40,
          },
          {
            accessor: "warehouse_receiver_employee_number",
            title: "Employee Number",
            render: ({ warehouse_receiver_employee_number }) => (
              <Text>{warehouse_receiver_employee_number}</Text>
            ),
          },
          {
            accessor: "warehouse_receiver_first_name",
            title: "First Name",
            render: ({ warehouse_receiver_first_name }) => (
              <Text>{warehouse_receiver_first_name}</Text>
            ),
          },
          {
            accessor: "warehouse_receiver_last_name",
            title: "Last Name",
            render: ({ warehouse_receiver_last_name }) => (
              <Text>{warehouse_receiver_last_name}</Text>
            ),
          },
          {
            accessor: "status",
            title: "Status",
            textAlignment: "center",
            render: ({
              warehouse_receiver_is_available,
              warehouse_receiver_id,
            }) => (
              <Center>
                <Checkbox
                  checked={warehouse_receiver_is_available}
                  className={classes.checkbox}
                  size="xs"
                  onChange={(e) =>
                    handleUpdateStatus(
                      warehouse_receiver_id,
                      e.currentTarget.checked
                    )
                  }
                />
              </Center>
            ),
          },
        ]}
        totalRecords={warehouseReceiverCount}
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

export default WarehouseReceiverList;
