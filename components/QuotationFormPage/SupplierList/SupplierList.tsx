import { deleteRow } from "@/backend/api/delete";
import { getNameList } from "@/backend/api/get";
import { toggleStatus } from "@/backend/api/update";
import { useActiveTeam } from "@/stores/useTeamStore";
import { ROW_PER_PAGE } from "@/utils/constant";
import { SupplierTableRow } from "@/utils/types";
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
  supplierList: SupplierTableRow[];
  setSupplierList: Dispatch<SetStateAction<SupplierTableRow[]>>;
  supplierCount: number;
  setSupplierCount: Dispatch<SetStateAction<number>>;
  setIsCreatingSupplier: Dispatch<SetStateAction<boolean>>;
};

const SupplierList = ({
  supplierList,
  setSupplierList,
  supplierCount,
  setSupplierCount,
  setIsCreatingSupplier,
}: Props) => {
  const { classes } = useStyles();

  const supabaseClient = useSupabaseClient();
  const activeTeam = useActiveTeam();

  const [isLoading, setIsLoading] = useState(false);

  const [activePage, setActivePage] = useState(1);
  const [checkList, setCheckList] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const headerCheckboxKey = uniqueId();

  const handleCheckRow = (supplierId: string) => {
    if (checkList.includes(supplierId)) {
      setCheckList(checkList.filter((id) => id !== supplierId));
    } else {
      setCheckList([...checkList, supplierId]);
    }
  };

  const handleCheckAllRows = (checkAll: boolean) => {
    if (checkAll) {
      const supplierIdList = supplierList.map(
        (supplier) => supplier.supplier_id
      );
      setCheckList(supplierIdList);
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
      const { data, count } = await getNameList(supabaseClient, {
        table: "supplier",
        teamId: activeTeam.team_id,
        search,
        limit: ROW_PER_PAGE,
        page: page,
      });
      setSupplierList(data as SupplierTableRow[]);
      setSupplierCount(Number(count));
    } catch {
      notifications.show({
        message: "Error on fetching supplier list",
        color: "red",
      });
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    const saveCheckList = checkList;
    const savedRecord = supplierList;

    try {
      const updatedSupplierList = supplierList.filter((supplier) => {
        if (!checkList.includes(supplier.supplier_id)) {
          return supplier;
        }
      });
      setSupplierList(updatedSupplierList);
      setCheckList([]);

      await deleteRow(supabaseClient, {
        rowId: checkList,
        table: "supplier",
      });

      notifications.show({
        message: "Supplier/s deleted.",
        color: "green",
      });
    } catch {
      setSupplierList(savedRecord);
      setCheckList(saveCheckList);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleUpdateStatus = async (supplierId: string, value: boolean) => {
    const savedRecord = supplierList;
    try {
      setSupplierList((prev) =>
        prev.map((supplier) => {
          if (supplier.supplier_id !== supplierId) return supplier;
          return {
            ...supplier,
            supplier_is_available: value,
          };
        })
      );
      await toggleStatus(supabaseClient, {
        table: "supplier",
        id: supplierId,
        status: value,
      });
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
      setSupplierList(savedRecord);
    }
  };

  return (
    <Box>
      <Flex align="center" justify="space-between" wrap="wrap" gap="xs">
        <Group className={classes.flexGrow}>
          <Title m={0} p={0} order={3}>
            List of Suppliers
          </Title>
          <TextInput
            miw={250}
            placeholder="Supplier Name"
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
                        ? "this supplier?"
                        : "these suppliers?"}
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
            onClick={() => setIsCreatingSupplier(true)}
          >
            Add
          </Button>
        </Group>
      </Flex>
      <DataTable
        idAccessor="supplier_id"
        mt="xs"
        withBorder
        fw="bolder"
        c="dimmed"
        minHeight={390}
        fetching={isLoading}
        records={supplierList}
        columns={[
          {
            accessor: "checkbox",
            title: (
              <Checkbox
                key={headerCheckboxKey}
                className={classes.checkbox}
                checked={
                  checkList.length > 0 &&
                  checkList.length === supplierList.length
                }
                size="xs"
                onChange={(e) => handleCheckAllRows(e.currentTarget.checked)}
              />
            ),
            render: ({ supplier_id }) => (
              <Checkbox
                className={classes.checkbox}
                size="xs"
                checked={checkList.includes(supplier_id)}
                onChange={() => {
                  handleCheckRow(supplier_id);
                }}
              />
            ),
            width: 40,
          },
          {
            accessor: "supplier_name",
            title: "Supplier Name",
            render: ({ supplier_name }) => <Text>{supplier_name}</Text>,
          },
          {
            accessor: "status",
            title: "Status",
            textAlignment: "center",
            render: ({ supplier_is_available, supplier_id }) => (
              <Center>
                <Checkbox
                  checked={supplier_is_available}
                  className={classes.checkbox}
                  size="xs"
                  onChange={(e) =>
                    handleUpdateStatus(supplier_id, e.currentTarget.checked)
                  }
                />
              </Center>
            ),
          },
        ]}
        totalRecords={supplierCount}
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

export default SupplierList;
