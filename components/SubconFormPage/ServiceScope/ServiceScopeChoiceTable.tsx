import { deleteRow } from "@/backend/api/delete";
import { getServiceScopeChoiceList } from "@/backend/api/get";
import { toggleStatus } from "@/backend/api/update";
import { ROW_PER_PAGE } from "@/utils/constant";
import { generateRandomId } from "@/utils/functions";
import {
  ServiceScopeChoiceTableRow,
  ServiceScopeTableRow,
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
import { DataTable } from "mantine-datatable";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

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
  scope: ServiceScopeTableRow;
  records: ServiceScopeChoiceTableRow[];
  setRecords: Dispatch<SetStateAction<ServiceScopeChoiceTableRow[]>>;
  count: number;
  setCount: Dispatch<SetStateAction<number>>;
  setIsCreating: Dispatch<SetStateAction<boolean>>;
};

const ServiceScopeChoiceTable = ({
  scope,
  records,
  setRecords,
  count,
  setCount,
  setIsCreating,
}: Props) => {
  const { classes } = useStyles();
  const supabaseClient = useSupabaseClient();

  const [isLoading, setIsLoading] = useState(false);

  const [activePage, setActivePage] = useState(1);
  const [checkList, setCheckList] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const headerCheckboxKey = generateRandomId();

  useEffect(() => {
    handleFetch("", 1);
  }, [scope]);

  const handleCheckRow = (scopeId: string) => {
    if (checkList.includes(scopeId)) {
      setCheckList(checkList.filter((id) => id !== scopeId));
    } else {
      setCheckList([...checkList, scopeId]);
    }
  };

  const handleCheckAllRows = (checkAll: boolean) => {
    if (checkAll) {
      const choiceList = records.map(
        (choice) => choice.service_scope_choice_id
      );
      setCheckList(choiceList);
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
      const { data, count } = await getServiceScopeChoiceList(supabaseClient, {
        scopeId: scope.service_scope_id,
        search: search,
        page: page,
        limit: ROW_PER_PAGE,
      });
      setRecords(data);
      setCount(Number(count));
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
    const savedRecord = records;

    try {
      const updatedChoiceList = records.filter((choice) => {
        if (!checkList.includes(choice.service_scope_choice_id)) {
          return choice;
        }
      });
      setRecords(updatedChoiceList);
      setCheckList([]);

      await deleteRow(supabaseClient, {
        rowId: checkList,
        table: "service_scope_choice",
      });

      notifications.show({
        message: "Choice/s deleted.",
        color: "green",
      });
    } catch {
      setRecords(savedRecord);
      setCheckList(saveCheckList);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleUpdateStatus = async (choiceId: string, value: boolean) => {
    const savedRecords = records;

    try {
      setRecords((prev) =>
        prev.map((choice) => {
          if (choice.service_scope_choice_id !== choiceId) return choice;
          return {
            ...choice,
            service_scope_choice_is_available: value,
          };
        })
      );
      await toggleStatus(supabaseClient, {
        table: "service_scope_choice",
        id: choiceId,
        status: value,
      });
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
      setRecords(savedRecords);
    }
  };

  return (
    <Box mt="xl">
      <Flex align="center" justify="space-between" wrap="wrap" gap="xs">
        <Group className={classes.flexGrow}>
          <Group>
            <Title m={0} p={0} order={3}>
              List of {scope.service_scope_name}
            </Title>
            <Title m={0} p={0} order={5} color="dimmed">
              ({scope.service_scope_type})
            </Title>
          </Group>
          <TextInput
            miw={250}
            placeholder="Name"
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
                      Are you sure you want to delete{" "}
                      {checkList.length === 1 ? "this scope?" : "these scopes?"}
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
            onClick={() => setIsCreating(true)}
          >
            Add
          </Button>
        </Group>
      </Flex>
      <DataTable
        idAccessor="service_scope_choice_id"
        mt="xs"
        withBorder
        fw="bolder"
        c="dimmed"
        minHeight={390}
        fetching={isLoading}
        records={records}
        columns={[
          {
            accessor: "checkbox",
            title: (
              <Checkbox
                key={headerCheckboxKey}
                className={classes.checkbox}
                checked={
                  checkList.length > 0 && checkList.length === records.length
                }
                size="xs"
                onChange={(e) => handleCheckAllRows(e.currentTarget.checked)}
              />
            ),
            render: ({ service_scope_choice_id }) => (
              <Checkbox
                className={classes.checkbox}
                size="xs"
                checked={checkList.includes(service_scope_choice_id)}
                onChange={() => {
                  handleCheckRow(service_scope_choice_id);
                }}
              />
            ),
            width: 40,
          },
          { accessor: "service_scope_choice_name", title: "Name" },
          {
            accessor: "service_scope_choice_is_available",
            title: "Status",
            textAlignment: "center",
            render: ({
              service_scope_choice_is_available,
              service_scope_choice_id,
            }) => {
              return (
                <Center>
                  <Checkbox
                    checked={service_scope_choice_is_available}
                    className={classes.checkbox}
                    size="xs"
                    onChange={(e) =>
                      handleUpdateStatus(
                        service_scope_choice_id,
                        e.currentTarget.checked
                      )
                    }
                  />
                </Center>
              );
            },
          },
        ]}
        totalRecords={count}
        recordsPerPage={ROW_PER_PAGE}
        page={activePage}
        onPageChange={(page) => {
          setActivePage(page);
          handleFetch(search, page);
        }}
      />
    </Box>
  );
};

export default ServiceScopeChoiceTable;
