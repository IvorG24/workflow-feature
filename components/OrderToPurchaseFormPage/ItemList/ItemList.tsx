import { deleteRow } from "@/backend/api/delete";
import { getItemList } from "@/backend/api/get";
import { toggleStatus } from "@/backend/api/update";
import { useActiveTeam } from "@/stores/useTeamStore";
import { ROW_PER_PAGE } from "@/utils/constant";
import {
  ItemDescriptionTableRow,
  ItemWithDescriptionType,
} from "@/utils/types";
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
  itemList: ItemWithDescriptionType[];
  setItemList: Dispatch<SetStateAction<ItemWithDescriptionType[]>>;
  itemCount: number;
  setItemCount: Dispatch<SetStateAction<number>>;
  setIsCreatingItem: Dispatch<SetStateAction<boolean>>;
  setSelectedItem: Dispatch<SetStateAction<ItemWithDescriptionType | null>>;
};

const ItemList = ({
  itemList,
  setItemList,
  itemCount,
  setItemCount,
  setIsCreatingItem,
  setSelectedItem,
}: Props) => {
  const { classes } = useStyles();

  const supabaseClient = useSupabaseClient();
  const activeTeam = useActiveTeam();

  const [isLoading, setIsLoading] = useState(false);

  const [activePage, setActivePage] = useState(1);
  const [checkList, setCheckList] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const headerCheckboxKey = uniqueId();

  const handleCheckRow = (itemId: string) => {
    if (checkList.includes(itemId)) {
      setCheckList(checkList.filter((id) => id !== itemId));
    } else {
      setCheckList([...checkList, itemId]);
    }
  };

  const handleCheckAllRows = (checkAll: boolean) => {
    if (checkAll) {
      const projectIdList = itemList.map((item) => item.item_id);
      setCheckList(projectIdList);
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
      const { data, count } = await getItemList(supabaseClient, {
        teamId: activeTeam.team_id,
        search,
        limit: ROW_PER_PAGE,
        page: page,
      });
      setItemList(data as ItemWithDescriptionType[]);
      setItemCount(Number(count));
    } catch {
      notifications.show({
        message: "Error on fetching item list",
        color: "red",
      });
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    const saveCheckList = checkList;
    const savedRecord = itemList;

    try {
      const updatedItemList = itemList.filter((item) => {
        if (!checkList.includes(item.item_id)) {
          return item;
        }
      });
      setItemList(updatedItemList);
      setCheckList([]);

      await deleteRow(supabaseClient, {
        rowId: checkList,
        table: "item",
      });

      setSelectedItem(null);

      notifications.show({
        message: "Item/s deleted.",
        color: "green",
      });
    } catch {
      setItemList(savedRecord);
      setCheckList(saveCheckList);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleUpdateStatus = async (itemId: string, value: boolean) => {
    const savedRecord = itemList;
    try {
      setItemList((prev) =>
        prev.map((item) => {
          if (item.item_id !== itemId) return item;
          return {
            ...item,
            item_is_available: value,
          };
        })
      );
      await toggleStatus(supabaseClient, {
        table: "item",
        id: itemId,
        status: value,
      });
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
      setItemList(savedRecord);
    }
  };

  const formatItemField = (itemFieldLabel: ItemDescriptionTableRow[]) => {
    let description = "";
    itemFieldLabel.forEach((fieldLabel) => {
      description += `${fieldLabel.item_description_label}, `;
    });
    return description.slice(0, -2);
  };

  const handleColumnClick = (item_id: string) => {
    const selectedItem = itemList.find((item) => item.item_id === item_id);
    setSelectedItem(selectedItem || null);
  };

  return (
    <Box>
      <Flex align="center" justify="space-between" wrap="wrap" gap="xs">
        <Group className={classes.flexGrow}>
          <Title m={0} p={0} order={3}>
            List of Items
          </Title>
          <TextInput
            miw={250}
            placeholder="General Name"
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
                      {checkList.length === 1 ? "this item?" : "these items?"}
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
            onClick={() => setIsCreatingItem(true)}
          >
            Add
          </Button>
        </Group>
      </Flex>
      <DataTable
        idAccessor="item_id"
        mt="xs"
        withBorder
        fw="bolder"
        c="dimmed"
        minHeight={390}
        fetching={isLoading}
        records={itemList}
        columns={[
          {
            accessor: "checkbox",
            title: (
              <Checkbox
                key={headerCheckboxKey}
                className={classes.checkbox}
                checked={
                  checkList.length > 0 && checkList.length === itemList.length
                }
                size="xs"
                onChange={(e) => handleCheckAllRows(e.currentTarget.checked)}
              />
            ),
            render: ({ item_id }) => (
              <Checkbox
                className={classes.checkbox}
                size="xs"
                checked={checkList.includes(item_id)}
                onChange={() => {
                  handleCheckRow(item_id);
                }}
              />
            ),
            width: 40,
          },
          {
            accessor: "item_general_name",
            title: "General Name",
            render: ({ item_general_name, item_id }) => (
              <Text
                className={classes.clickableColumn}
                onClick={() => {
                  handleColumnClick(item_id);
                }}
              >
                {item_general_name}
              </Text>
            ),
          },
          {
            accessor: "item_unit",
            title: "Unit of Measurement",
            render: ({ item_unit, item_id }) => (
              <Text
                className={classes.clickableColumn}
                onClick={() => {
                  handleColumnClick(item_id);
                }}
              >
                {item_unit}
              </Text>
            ),
          },
          {
            accessor: "description",
            title: "Description",
            render: ({ item_id, item_description }) => (
              <Text
                className={classes.clickableColumn}
                onClick={() => {
                  handleColumnClick(item_id);
                }}
              >
                {formatItemField(item_description)}
              </Text>
            ),
          },
          {
            accessor: "item_purpose",
            title: "Purpose",
            render: ({ item_purpose, item_id }) => (
              <Text
                className={classes.clickableColumn}
                onClick={() => {
                  handleColumnClick(item_id);
                }}
              >
                {item_purpose}
              </Text>
            ),
          },
          {
            accessor: "item_cost_code",
            title: "Cost Code",
            render: ({ item_cost_code, item_id }) => (
              <Text
                className={classes.clickableColumn}
                onClick={() => {
                  handleColumnClick(item_id);
                }}
              >
                {item_cost_code}
              </Text>
            ),
          },
          {
            accessor: "item_gl_account",
            title: "GL Account",
            render: ({ item_gl_account, item_id }) => (
              <Text
                className={classes.clickableColumn}
                onClick={() => {
                  handleColumnClick(item_id);
                }}
              >
                {item_gl_account}
              </Text>
            ),
          },
          {
            accessor: "status",
            title: "Status",
            textAlignment: "center",
            render: ({ item_is_available, item_id }) => (
              <Center>
                <Checkbox
                  checked={item_is_available}
                  className={classes.checkbox}
                  size="xs"
                  onChange={(e) =>
                    handleUpdateStatus(item_id, e.currentTarget.checked)
                  }
                />
              </Center>
            ),
          },
        ]}
        totalRecords={itemCount}
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

export default ItemList;
