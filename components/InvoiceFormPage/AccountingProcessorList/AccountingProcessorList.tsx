import { deleteRow } from "@/backend/api/delete";
import { getProcessorList } from "@/backend/api/get";
import { toggleStatus } from "@/backend/api/update";
import { useActiveTeam } from "@/stores/useTeamStore";
import { ROW_PER_PAGE } from "@/utils/constant";
import { AccountingProcessorTableRow } from "@/utils/types";
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
  accountingProcessorList: AccountingProcessorTableRow[];
  setAccountingProcessorList: Dispatch<
    SetStateAction<AccountingProcessorTableRow[]>
  >;
  accountingProcessorCount: number;
  setAccountingProcessorCount: Dispatch<SetStateAction<number>>;
  setIsCreatingAccountingProcessor: Dispatch<SetStateAction<boolean>>;
};

const AccountingProcessorList = ({
  accountingProcessorList,
  setAccountingProcessorList,
  accountingProcessorCount,
  setAccountingProcessorCount,
  setIsCreatingAccountingProcessor,
}: Props) => {
  const { classes } = useStyles();

  const supabaseClient = useSupabaseClient();
  const activeTeam = useActiveTeam();

  const [isLoading, setIsLoading] = useState(false);

  const [activePage, setActivePage] = useState(1);
  const [checkList, setCheckList] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const headerCheckboxKey = uniqueId();

  const handleCheckRow = (accountingProcessorId: string) => {
    if (checkList.includes(accountingProcessorId)) {
      setCheckList(checkList.filter((id) => id !== accountingProcessorId));
    } else {
      setCheckList([...checkList, accountingProcessorId]);
    }
  };

  const handleCheckAllRows = (checkAll: boolean) => {
    if (checkAll) {
      const accountingProcessorIdList = accountingProcessorList.map(
        (accountingProcessor) => accountingProcessor.accounting_processor_id
      );
      setCheckList(accountingProcessorIdList);
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
        processor: "accounting",
        teamId: activeTeam.team_id,
        search,
        limit: ROW_PER_PAGE,
        page: page,
      });
      setAccountingProcessorList(data as AccountingProcessorTableRow[]);
      setAccountingProcessorCount(Number(count));
    } catch {
      showNotification({
        message: "Error on fetching accounting processor list",
        color: "red",
      });
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    const saveCheckList = checkList;
    const savedRecord = accountingProcessorList;

    try {
      const updatedAccountingProcessorList = accountingProcessorList.filter(
        (accountingProcessor) => {
          if (
            !checkList.includes(accountingProcessor.accounting_processor_id)
          ) {
            return accountingProcessor;
          }
        }
      );
      setAccountingProcessorList(updatedAccountingProcessorList);
      setCheckList([]);

      await deleteRow(supabaseClient, {
        rowId: checkList,
        table: "accounting_processor",
      });

      showNotification({
        title: "Success!",
        message: "Accounting Processor/s deleted",
        color: "green",
      });
    } catch {
      setAccountingProcessorList(savedRecord);
      setCheckList(saveCheckList);
      showNotification({
        title: "Error!",
        message: "Accounting Processor/s failed to delete",
        color: "red",
      });
    }
  };

  const handleUpdateStatus = async (
    accountingProcessorId: string,
    value: boolean
  ) => {
    const savedRecord = accountingProcessorList;
    try {
      setAccountingProcessorList((prev) =>
        prev.map((accountingProcessor) => {
          if (
            accountingProcessor.accounting_processor_id !==
            accountingProcessorId
          )
            return accountingProcessor;

          return {
            ...accountingProcessor,
            accounting_processor_is_available: value,
          };
        })
      );

      await toggleStatus(supabaseClient, {
        table: "accounting_processor",
        id: accountingProcessorId,
        status: value,
      });
    } catch {
      showNotification({
        message: "Error on changing status",
        color: "red",
      });
      setAccountingProcessorList(savedRecord);
    }
  };

  return (
    <Box>
      <Flex align="center" justify="space-between" wrap="wrap" gap="xs">
        <Group className={classes.flexGrow}>
          <Title m={0} p={0} order={3}>
            List of Accounting Processors
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
                        ? "this accounting processor?"
                        : "these accounting processors?"}
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
            onClick={() => setIsCreatingAccountingProcessor(true)}
          >
            Add
          </Button>
        </Group>
      </Flex>
      <DataTable
        idAccessor="accounting_processor_id"
        mt="xs"
        withBorder
        fw="bolder"
        c="dimmed"
        minHeight={390}
        fetching={isLoading}
        records={accountingProcessorList}
        columns={[
          {
            accessor: "checkbox",
            title: (
              <Checkbox
                key={headerCheckboxKey}
                className={classes.checkbox}
                checked={
                  checkList.length > 0 &&
                  checkList.length === accountingProcessorList.length
                }
                size="xs"
                onChange={(e) => handleCheckAllRows(e.currentTarget.checked)}
              />
            ),
            render: ({ accounting_processor_id }) => (
              <Checkbox
                className={classes.checkbox}
                size="xs"
                checked={checkList.includes(accounting_processor_id)}
                onChange={() => {
                  handleCheckRow(accounting_processor_id);
                }}
              />
            ),
            width: 40,
          },
          {
            accessor: "accounting_processor_employee_number",
            title: "Employee Number",
            render: ({ accounting_processor_employee_number }) => (
              <Text>{accounting_processor_employee_number}</Text>
            ),
          },
          {
            accessor: "accounting_processor_first_name",
            title: "First Name",
            render: ({ accounting_processor_first_name }) => (
              <Text>{accounting_processor_first_name}</Text>
            ),
          },
          {
            accessor: "accounting_processor_last_name",
            title: "Last Name",
            render: ({ accounting_processor_last_name }) => (
              <Text>{accounting_processor_last_name}</Text>
            ),
          },
          {
            accessor: "status",
            title: "Status",
            textAlignment: "center",
            render: ({
              accounting_processor_is_available,
              accounting_processor_id,
            }) => (
              <Center>
                <Checkbox
                  checked={accounting_processor_is_available}
                  className={classes.checkbox}
                  size="xs"
                  onChange={(e) =>
                    handleUpdateStatus(
                      accounting_processor_id,
                      e.currentTarget.checked
                    )
                  }
                />
              </Center>
            ),
          },
        ]}
        totalRecords={accountingProcessorCount}
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

export default AccountingProcessorList;
