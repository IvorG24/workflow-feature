import { deleteRow } from "@/backend/api/delete";
import { getNameList } from "@/backend/api/get";
import { toggleStatus } from "@/backend/api/update";
import { useActiveTeam } from "@/stores/useTeamStore";
import { ROW_PER_PAGE } from "@/utils/constant";
import { VendorTableRow } from "@/utils/types";
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
  vendorList: VendorTableRow[];
  setVendorList: Dispatch<SetStateAction<VendorTableRow[]>>;
  vendorCount: number;
  setVendorCount: Dispatch<SetStateAction<number>>;
  setIsCreatingVendor: Dispatch<SetStateAction<boolean>>;
};

const VendorList = ({
  vendorList,
  setVendorList,
  vendorCount,
  setVendorCount,
  setIsCreatingVendor,
}: Props) => {
  const { classes } = useStyles();

  const supabaseClient = useSupabaseClient();
  const activeTeam = useActiveTeam();

  const [isLoading, setIsLoading] = useState(false);

  const [activePage, setActivePage] = useState(1);
  const [checkList, setCheckList] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const headerCheckboxKey = uniqueId();

  const handleCheckRow = (vendorId: string) => {
    if (checkList.includes(vendorId)) {
      setCheckList(checkList.filter((id) => id !== vendorId));
    } else {
      setCheckList([...checkList, vendorId]);
    }
  };

  const handleCheckAllRows = (checkAll: boolean) => {
    if (checkAll) {
      const vendorIdList = vendorList.map((vendor) => vendor.vendor_id);
      setCheckList(vendorIdList);
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
        table: "vendor",
        teamId: activeTeam.team_id,
        search,
        limit: ROW_PER_PAGE,
        page: page,
      });
      setVendorList(data as VendorTableRow[]);
      setVendorCount(Number(count));
    } catch {
      notifications.show({
        message: "Error on fetching vendor list",
        color: "red",
      });
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    const saveCheckList = checkList;
    const savedRecord = vendorList;

    try {
      const updatedVendorList = vendorList.filter((vendor) => {
        if (!checkList.includes(vendor.vendor_id)) {
          return vendor;
        }
      });
      setVendorList(updatedVendorList);
      setCheckList([]);

      await deleteRow(supabaseClient, {
        rowId: checkList,
        table: "vendor",
      });

      notifications.show({
        message: "Vendor/s deleted.",
        color: "green",
      });
    } catch {
      setVendorList(savedRecord);
      setCheckList(saveCheckList);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleUpdateStatus = async (vendorId: string, value: boolean) => {
    const savedRecord = vendorList;
    try {
      setVendorList((prev) =>
        prev.map((vendor) => {
          if (vendor.vendor_id !== vendorId) return vendor;
          return {
            ...vendor,
            vendor_is_available: value,
          };
        })
      );
      await toggleStatus(supabaseClient, {
        table: "vendor",
        id: vendorId,
        status: value,
      });
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
      setVendorList(savedRecord);
    }
  };

  return (
    <Box>
      <Flex align="center" justify="space-between" wrap="wrap" gap="xs">
        <Group className={classes.flexGrow}>
          <Title m={0} p={0} order={3}>
            List of Vendors
          </Title>
          <TextInput
            miw={250}
            placeholder="Vendor Name"
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
                        ? "this vendor?"
                        : "these vendors?"}
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
            onClick={() => setIsCreatingVendor(true)}
          >
            Add
          </Button>
        </Group>
      </Flex>
      <DataTable
        idAccessor="vendor_id"
        mt="xs"
        withBorder
        fw="bolder"
        c="dimmed"
        minHeight={390}
        fetching={isLoading}
        records={vendorList}
        columns={[
          {
            accessor: "checkbox",
            title: (
              <Checkbox
                key={headerCheckboxKey}
                className={classes.checkbox}
                checked={
                  checkList.length > 0 && checkList.length === vendorList.length
                }
                size="xs"
                onChange={(e) => handleCheckAllRows(e.currentTarget.checked)}
              />
            ),
            render: ({ vendor_id }) => (
              <Checkbox
                className={classes.checkbox}
                size="xs"
                checked={checkList.includes(vendor_id)}
                onChange={() => {
                  handleCheckRow(vendor_id);
                }}
              />
            ),
            width: 40,
          },
          {
            accessor: "vendor_name",
            title: "Vendor Name",
            render: ({ vendor_name }) => <Text>{vendor_name}</Text>,
          },
          {
            accessor: "status",
            title: "Status",
            textAlignment: "center",
            render: ({ vendor_is_available, vendor_id }) => (
              <Center>
                <Checkbox
                  checked={vendor_is_available}
                  className={classes.checkbox}
                  size="xs"
                  onChange={(e) =>
                    handleUpdateStatus(vendor_id, e.currentTarget.checked)
                  }
                />
              </Center>
            ),
          },
        ]}
        totalRecords={vendorCount}
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

export default VendorList;
