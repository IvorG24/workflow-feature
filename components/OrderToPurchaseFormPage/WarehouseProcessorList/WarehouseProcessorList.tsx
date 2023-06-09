import { deleteRow } from "@/backend/api/delete";
import { getWarehouseProcessorList } from "@/backend/api/get";
import { toggleStatus } from "@/backend/api/update";
import { useActiveTeam } from "@/stores/useTeamStore";
import { ROW_PER_PAGE } from "@/utils/constant";
import { WarehouseProcessorTableRow } from "@/utils/types";
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
import { showNotification } from "@mantine/notifications";
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
  warehouseProcessorList: WarehouseProcessorTableRow[];
  setWarehouseProcessorList: Dispatch<
    SetStateAction<WarehouseProcessorTableRow[]>
  >;
  warehouseProcessorCount: number;
  setWarehouseProcessorCount: Dispatch<SetStateAction<number>>;
  setIsCreatingWarehouseProcessor: Dispatch<SetStateAction<boolean>>;
};

const WarehouseProcessorList = ({
  warehouseProcessorList,
  setWarehouseProcessorList,
  warehouseProcessorCount,
  setWarehouseProcessorCount,
  setIsCreatingWarehouseProcessor,
}: Props) => {
  const { classes } = useStyles();

  const supabaseClient = useSupabaseClient();
  const activeTeam = useActiveTeam();

  const [isLoading, setIsLoading] = useState(false);

  const [activePage, setActivePage] = useState(1);
  const [checkList, setCheckList] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const headerCheckboxKey = uniqueId();

  const handleCheckRow = (warehouseProcessorId: string) => {
    if (checkList.includes(warehouseProcessorId)) {
      setCheckList(checkList.filter((id) => id !== warehouseProcessorId));
    } else {
      setCheckList([...checkList, warehouseProcessorId]);
    }
  };

  const handleCheckAllRows = (checkAll: boolean) => {
    if (checkAll) {
      const warehouseProcessorIdList = warehouseProcessorList.map(
        (warehouseProcessor) => warehouseProcessor.warehouse_processor_id
      );
      setCheckList(warehouseProcessorIdList);
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
      const { data, count } = await getWarehouseProcessorList(supabaseClient, {
        teamId: activeTeam.team_id,
        search,
        limit: ROW_PER_PAGE,
        page: page,
      });
      setWarehouseProcessorList(data);
      setWarehouseProcessorCount(Number(count));
    } catch {
      showNotification({
        message: "Error on fetching warehouse processor list",
        color: "red",
      });
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    const saveCheckList = checkList;
    const savedRecord = warehouseProcessorList;

    try {
      const updatedWarehouseProcessorList = warehouseProcessorList.filter(
        (warehouseProcessor) => {
          if (!checkList.includes(warehouseProcessor.warehouse_processor_id)) {
            return warehouseProcessor;
          }
        }
      );
      setWarehouseProcessorList(updatedWarehouseProcessorList);
      setCheckList([]);

      await deleteRow(supabaseClient, {
        rowId: checkList,
        table: "warehouse_processor",
      });

      showNotification({
        title: "Success!",
        message: "Warehouse Processor/s deleted",
        color: "green",
      });
    } catch {
      setWarehouseProcessorList(savedRecord);
      setCheckList(saveCheckList);
      showNotification({
        title: "Error!",
        message: "Warehouse Processor/s failed to delete",
        color: "red",
      });
    }
  };

  const handleUpdateStatus = async (
    warehouseProcessorId: string,
    value: boolean
  ) => {
    const savedRecord = warehouseProcessorList;
    try {
      setWarehouseProcessorList((prev) =>
        prev.map((warehouseProcessor) => {
          if (
            warehouseProcessor.warehouse_processor_id !== warehouseProcessorId
          )
            return warehouseProcessor;

          return {
            ...warehouseProcessor,
            warehouse_processor_is_available: value,
          };
        })
      );

      await toggleStatus(supabaseClient, {
        table: "warehouse_processor",
        id: warehouseProcessorId,
        status: value,
      });
    } catch {
      showNotification({
        message: "Error on changing status",
        color: "red",
      });
      setWarehouseProcessorList(savedRecord);
    }
  };

  return (
    <Box>
      <Flex align="center" justify="space-between" wrap="wrap" gap="xs">
        <Group className={classes.flexGrow}>
          <Title m={0} p={0} order={3}>
            List of Warehouse Processors
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
                        ? "this warehouse processor?"
                        : "these warehouse processors?"}
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
            onClick={() => setIsCreatingWarehouseProcessor(true)}
          >
            Add
          </Button>
        </Group>
      </Flex>
      <DataTable
        idAccessor="warehouse_processor_id"
        mt="xs"
        withBorder
        fw="bolder"
        c="dimmed"
        minHeight={390}
        fetching={isLoading}
        records={warehouseProcessorList}
        columns={[
          {
            accessor: "checkbox",
            title: (
              <Checkbox
                key={headerCheckboxKey}
                className={classes.checkbox}
                checked={
                  checkList.length > 0 &&
                  checkList.length === warehouseProcessorList.length
                }
                size="xs"
                onChange={(e) => handleCheckAllRows(e.currentTarget.checked)}
              />
            ),
            render: ({ warehouse_processor_id }) => (
              <Checkbox
                className={classes.checkbox}
                size="xs"
                checked={checkList.includes(warehouse_processor_id)}
                onChange={() => {
                  handleCheckRow(warehouse_processor_id);
                }}
              />
            ),
            width: 40,
          },
          {
            accessor: "warehouse_processor_employee_number",
            title: "Employee Number",
            render: ({ warehouse_processor_employee_number }) => (
              <Text>{warehouse_processor_employee_number}</Text>
            ),
          },
          {
            accessor: "warehouse_processor_first_name",
            title: "First Name",
            render: ({ warehouse_processor_first_name }) => (
              <Text>{warehouse_processor_first_name}</Text>
            ),
          },
          {
            accessor: "warehouse_processor_last_name",
            title: "Last Name",
            render: ({ warehouse_processor_last_name }) => (
              <Text>{warehouse_processor_last_name}</Text>
            ),
          },
          {
            accessor: "status",
            title: "Status",
            textAlignment: "center",
            render: ({
              warehouse_processor_is_available,
              warehouse_processor_id,
            }) => (
              <Center>
                <Checkbox
                  checked={warehouse_processor_is_available}
                  className={classes.checkbox}
                  size="xs"
                  onChange={(e) =>
                    handleUpdateStatus(
                      warehouse_processor_id,
                      e.currentTarget.checked
                    )
                  }
                />
              </Center>
            ),
          },
        ]}
        totalRecords={warehouseProcessorCount}
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

export default WarehouseProcessorList;
