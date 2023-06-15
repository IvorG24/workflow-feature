import { deleteRow } from "@/backend/api/delete";
import { getProcessorList } from "@/backend/api/get";
import { toggleStatus } from "@/backend/api/update";
import { useActiveTeam } from "@/stores/useTeamStore";
import { ROW_PER_PAGE } from "@/utils/constant";
import { TreasuryProcessorTableRow } from "@/utils/types";
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
  treasuryProcessorList: TreasuryProcessorTableRow[];
  setTreasuryProcessorList: Dispatch<
    SetStateAction<TreasuryProcessorTableRow[]>
  >;
  treasuryProcessorCount: number;
  setTreasuryProcessorCount: Dispatch<SetStateAction<number>>;
  setIsCreatingTreasuryProcessor: Dispatch<SetStateAction<boolean>>;
};

const TreasuryProcessorList = ({
  treasuryProcessorList,
  setTreasuryProcessorList,
  treasuryProcessorCount,
  setTreasuryProcessorCount,
  setIsCreatingTreasuryProcessor,
}: Props) => {
  const { classes } = useStyles();

  const supabaseClient = useSupabaseClient();
  const activeTeam = useActiveTeam();

  const [isLoading, setIsLoading] = useState(false);

  const [activePage, setActivePage] = useState(1);
  const [checkList, setCheckList] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const headerCheckboxKey = uniqueId();

  const handleCheckRow = (treasuryProcessorId: string) => {
    if (checkList.includes(treasuryProcessorId)) {
      setCheckList(checkList.filter((id) => id !== treasuryProcessorId));
    } else {
      setCheckList([...checkList, treasuryProcessorId]);
    }
  };

  const handleCheckAllRows = (checkAll: boolean) => {
    if (checkAll) {
      const treasuryProcessorIdList = treasuryProcessorList.map(
        (treasuryProcessor) => treasuryProcessor.treasury_processor_id
      );
      setCheckList(treasuryProcessorIdList);
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
        processor: "treasury",
        teamId: activeTeam.team_id,
        search,
        limit: ROW_PER_PAGE,
        page: page,
      });
      setTreasuryProcessorList(data as TreasuryProcessorTableRow[]);
      setTreasuryProcessorCount(Number(count));
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
    const savedRecord = treasuryProcessorList;

    try {
      const updatedTreasuryProcessorList = treasuryProcessorList.filter(
        (treasuryProcessor) => {
          if (!checkList.includes(treasuryProcessor.treasury_processor_id)) {
            return treasuryProcessor;
          }
        }
      );
      setTreasuryProcessorList(updatedTreasuryProcessorList);
      setCheckList([]);

      await deleteRow(supabaseClient, {
        rowId: checkList,
        table: "treasury_processor",
      });

      notifications.show({
        message: "Treasury Processor/s deleted.",
        color: "green",
      });
    } catch {
      setTreasuryProcessorList(savedRecord);
      setCheckList(saveCheckList);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleUpdateStatus = async (
    treasuryProcessorId: string,
    value: boolean
  ) => {
    const savedRecord = treasuryProcessorList;
    try {
      setTreasuryProcessorList((prev) =>
        prev.map((treasuryProcessor) => {
          if (treasuryProcessor.treasury_processor_id !== treasuryProcessorId)
            return treasuryProcessor;

          return {
            ...treasuryProcessor,
            treasury_processor_is_available: value,
          };
        })
      );

      await toggleStatus(supabaseClient, {
        table: "treasury_processor",
        id: treasuryProcessorId,
        status: value,
      });
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
      setTreasuryProcessorList(savedRecord);
    }
  };

  return (
    <Box>
      <Flex align="center" justify="space-between" wrap="wrap" gap="xs">
        <Group className={classes.flexGrow}>
          <Title m={0} p={0} order={3}>
            List of Treasury Processors
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
                        ? "this treasury processor?"
                        : "these treasury processors?"}
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
            onClick={() => setIsCreatingTreasuryProcessor(true)}
          >
            Add
          </Button>
        </Group>
      </Flex>
      <DataTable
        idAccessor="treasury_processor_id"
        mt="xs"
        withBorder
        fw="bolder"
        c="dimmed"
        minHeight={390}
        fetching={isLoading}
        records={treasuryProcessorList}
        columns={[
          {
            accessor: "checkbox",
            title: (
              <Checkbox
                key={headerCheckboxKey}
                className={classes.checkbox}
                checked={
                  checkList.length > 0 &&
                  checkList.length === treasuryProcessorList.length
                }
                size="xs"
                onChange={(e) => handleCheckAllRows(e.currentTarget.checked)}
              />
            ),
            render: ({ treasury_processor_id }) => (
              <Checkbox
                className={classes.checkbox}
                size="xs"
                checked={checkList.includes(treasury_processor_id)}
                onChange={() => {
                  handleCheckRow(treasury_processor_id);
                }}
              />
            ),
            width: 40,
          },
          {
            accessor: "treasury_processor_employee_number",
            title: "Employee Number",
            render: ({ treasury_processor_employee_number }) => (
              <Text>{treasury_processor_employee_number}</Text>
            ),
          },
          {
            accessor: "treasury_processor_first_name",
            title: "First Name",
            render: ({ treasury_processor_first_name }) => (
              <Text>{treasury_processor_first_name}</Text>
            ),
          },
          {
            accessor: "treasury_processor_last_name",
            title: "Last Name",
            render: ({ treasury_processor_last_name }) => (
              <Text>{treasury_processor_last_name}</Text>
            ),
          },
          {
            accessor: "status",
            title: "Status",
            textAlignment: "center",
            render: ({
              treasury_processor_is_available,
              treasury_processor_id,
            }) => (
              <Center>
                <Checkbox
                  checked={treasury_processor_is_available}
                  className={classes.checkbox}
                  size="xs"
                  onChange={(e) =>
                    handleUpdateStatus(
                      treasury_processor_id,
                      e.currentTarget.checked
                    )
                  }
                />
              </Center>
            ),
          },
        ]}
        totalRecords={treasuryProcessorCount}
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

export default TreasuryProcessorList;
