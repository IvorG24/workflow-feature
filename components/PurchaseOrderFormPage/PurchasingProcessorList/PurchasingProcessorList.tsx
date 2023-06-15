import { deleteRow } from "@/backend/api/delete";
import { getProcessorList } from "@/backend/api/get";
import { toggleStatus } from "@/backend/api/update";
import { useActiveTeam } from "@/stores/useTeamStore";
import { ROW_PER_PAGE } from "@/utils/constant";
import { PurchasingProcessorTableRow } from "@/utils/types";
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
  purchasingProcessorList: PurchasingProcessorTableRow[];
  setPurchasingProcessorList: Dispatch<
    SetStateAction<PurchasingProcessorTableRow[]>
  >;
  purchasingProcessorCount: number;
  setPurchasingProcessorCount: Dispatch<SetStateAction<number>>;
  setIsCreatingPurchasingProcessor: Dispatch<SetStateAction<boolean>>;
};

const PurchasingProcessorList = ({
  purchasingProcessorList,
  setPurchasingProcessorList,
  purchasingProcessorCount,
  setPurchasingProcessorCount,
  setIsCreatingPurchasingProcessor,
}: Props) => {
  const { classes } = useStyles();

  const supabaseClient = useSupabaseClient();
  const activeTeam = useActiveTeam();

  const [isLoading, setIsLoading] = useState(false);

  const [activePage, setActivePage] = useState(1);
  const [checkList, setCheckList] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const headerCheckboxKey = uniqueId();

  const handleCheckRow = (purchasingProcessorId: string) => {
    if (checkList.includes(purchasingProcessorId)) {
      setCheckList(checkList.filter((id) => id !== purchasingProcessorId));
    } else {
      setCheckList([...checkList, purchasingProcessorId]);
    }
  };

  const handleCheckAllRows = (checkAll: boolean) => {
    if (checkAll) {
      const purchasingProcessorIdList = purchasingProcessorList.map(
        (purchasingProcessor) => purchasingProcessor.purchasing_processor_id
      );
      setCheckList(purchasingProcessorIdList);
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
      const { data, count } = await getProcessorList(supabaseClient, {
        processor: "purchasing",
        teamId: activeTeam.team_id,
        search,
        limit: ROW_PER_PAGE,
        page: page,
      });
      setPurchasingProcessorList(data as PurchasingProcessorTableRow[]);
      setPurchasingProcessorCount(Number(count));
    } catch {
      notifications.show({
        message: "Error on fetching purchasing processor list",
        color: "red",
      });
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    const saveCheckList = checkList;
    const savedRecord = purchasingProcessorList;

    try {
      const updatedPurchasingProcessorList = purchasingProcessorList.filter(
        (purchasingProcessor) => {
          if (
            !checkList.includes(purchasingProcessor.purchasing_processor_id)
          ) {
            return purchasingProcessor;
          }
        }
      );
      setPurchasingProcessorList(updatedPurchasingProcessorList);
      setCheckList([]);

      await deleteRow(supabaseClient, {
        rowId: checkList,
        table: "purchasing_processor",
      });

      notifications.show({
        message: "Purchasing Processor/s deleted.",
        color: "green",
      });
    } catch {
      setPurchasingProcessorList(savedRecord);
      setCheckList(saveCheckList);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleUpdateStatus = async (
    purchasingProcessorId: string,
    value: boolean
  ) => {
    const savedRecord = purchasingProcessorList;
    try {
      setPurchasingProcessorList((prev) =>
        prev.map((purchasingProcessor) => {
          if (
            purchasingProcessor.purchasing_processor_id !==
            purchasingProcessorId
          )
            return purchasingProcessor;

          return {
            ...purchasingProcessor,
            purchasing_processor_is_available: value,
          };
        })
      );

      await toggleStatus(supabaseClient, {
        table: "purchasing_processor",
        id: purchasingProcessorId,
        status: value,
      });
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
      setPurchasingProcessorList(savedRecord);
    }
  };

  return (
    <Box>
      <Flex align="center" justify="space-between" wrap="wrap" gap="xs">
        <Group className={classes.flexGrow}>
          <Title m={0} p={0} order={3}>
            List of Purchasing Processors
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
                        ? "this purchasing processor?"
                        : "these purchasing processors?"}
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
            onClick={() => setIsCreatingPurchasingProcessor(true)}
          >
            Add
          </Button>
        </Group>
      </Flex>
      <DataTable
        idAccessor="purchasing_processor_id"
        mt="xs"
        withBorder
        fw="bolder"
        c="dimmed"
        minHeight={390}
        fetching={isLoading}
        records={purchasingProcessorList}
        columns={[
          {
            accessor: "checkbox",
            title: (
              <Checkbox
                key={headerCheckboxKey}
                className={classes.checkbox}
                checked={
                  checkList.length > 0 &&
                  checkList.length === purchasingProcessorList.length
                }
                size="xs"
                onChange={(e) => handleCheckAllRows(e.currentTarget.checked)}
              />
            ),
            render: ({ purchasing_processor_id }) => (
              <Checkbox
                className={classes.checkbox}
                size="xs"
                checked={checkList.includes(purchasing_processor_id)}
                onChange={() => {
                  handleCheckRow(purchasing_processor_id);
                }}
              />
            ),
            width: 40,
          },
          {
            accessor: "purchasing_processor_employee_number",
            title: "Employee Number",
            render: ({ purchasing_processor_employee_number }) => (
              <Text>{purchasing_processor_employee_number}</Text>
            ),
          },
          {
            accessor: "purchasing_processor_first_name",
            title: "First Name",
            render: ({ purchasing_processor_first_name }) => (
              <Text>{purchasing_processor_first_name}</Text>
            ),
          },
          {
            accessor: "purchasing_processor_last_name",
            title: "Last Name",
            render: ({ purchasing_processor_last_name }) => (
              <Text>{purchasing_processor_last_name}</Text>
            ),
          },
          {
            accessor: "status",
            title: "Status",
            textAlignment: "center",
            render: ({
              purchasing_processor_is_available,
              purchasing_processor_id,
            }) => (
              <Center>
                <Checkbox
                  checked={purchasing_processor_is_available}
                  className={classes.checkbox}
                  size="xs"
                  onChange={(e) =>
                    handleUpdateStatus(
                      purchasing_processor_id,
                      e.currentTarget.checked
                    )
                  }
                />
              </Center>
            ),
          },
        ]}
        totalRecords={purchasingProcessorCount}
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

export default PurchasingProcessorList;
