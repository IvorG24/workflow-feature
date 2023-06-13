import { deleteRow } from "@/backend/api/delete";
import { getProcessorList } from "@/backend/api/get";
import { toggleStatus } from "@/backend/api/update";
import { useActiveTeam } from "@/stores/useTeamStore";
import { ROW_PER_PAGE } from "@/utils/constant";
import { AuditProcessorTableRow } from "@/utils/types";
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
  auditProcessorList: AuditProcessorTableRow[];
  setAuditProcessorList: Dispatch<SetStateAction<AuditProcessorTableRow[]>>;
  auditProcessorCount: number;
  setAuditProcessorCount: Dispatch<SetStateAction<number>>;
  setIsCreatingAuditProcessor: Dispatch<SetStateAction<boolean>>;
};

const AuditProcessorList = ({
  auditProcessorList,
  setAuditProcessorList,
  auditProcessorCount,
  setAuditProcessorCount,
  setIsCreatingAuditProcessor,
}: Props) => {
  const { classes } = useStyles();

  const supabaseClient = useSupabaseClient();
  const activeTeam = useActiveTeam();

  const [isLoading, setIsLoading] = useState(false);

  const [activePage, setActivePage] = useState(1);
  const [checkList, setCheckList] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const headerCheckboxKey = uniqueId();

  const handleCheckRow = (auditProcessorId: string) => {
    if (checkList.includes(auditProcessorId)) {
      setCheckList(checkList.filter((id) => id !== auditProcessorId));
    } else {
      setCheckList([...checkList, auditProcessorId]);
    }
  };

  const handleCheckAllRows = (checkAll: boolean) => {
    if (checkAll) {
      const auditProcessorIdList = auditProcessorList.map(
        (auditProcessor) => auditProcessor.audit_processor_id
      );
      setCheckList(auditProcessorIdList);
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
        processor: "audit",
        teamId: activeTeam.team_id,
        search,
        limit: ROW_PER_PAGE,
        page: page,
      });
      setAuditProcessorList(data as AuditProcessorTableRow[]);
      setAuditProcessorCount(Number(count));
    } catch {
      showNotification({
        message: "Error on fetching audit processor list",
        color: "red",
      });
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    const saveCheckList = checkList;
    const savedRecord = auditProcessorList;

    try {
      const updatedAuditProcessorList = auditProcessorList.filter(
        (auditProcessor) => {
          if (!checkList.includes(auditProcessor.audit_processor_id)) {
            return auditProcessor;
          }
        }
      );
      setAuditProcessorList(updatedAuditProcessorList);
      setCheckList([]);

      await deleteRow(supabaseClient, {
        rowId: checkList,
        table: "audit_processor",
      });

      showNotification({
        title: "Success!",
        message: "Audit Processor/s deleted",
        color: "green",
      });
    } catch {
      setAuditProcessorList(savedRecord);
      setCheckList(saveCheckList);
      showNotification({
        title: "Error!",
        message: "Audit Processor/s failed to delete",
        color: "red",
      });
    }
  };

  const handleUpdateStatus = async (
    auditProcessorId: string,
    value: boolean
  ) => {
    const savedRecord = auditProcessorList;
    try {
      setAuditProcessorList((prev) =>
        prev.map((auditProcessor) => {
          if (auditProcessor.audit_processor_id !== auditProcessorId)
            return auditProcessor;

          return {
            ...auditProcessor,
            audit_processor_is_available: value,
          };
        })
      );

      await toggleStatus(supabaseClient, {
        table: "audit_processor",
        id: auditProcessorId,
        status: value,
      });
    } catch {
      showNotification({
        message: "Error on changing status",
        color: "red",
      });
      setAuditProcessorList(savedRecord);
    }
  };

  return (
    <Box>
      <Flex align="center" justify="space-between" wrap="wrap" gap="xs">
        <Group className={classes.flexGrow}>
          <Title m={0} p={0} order={3}>
            List of Audit Processors
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
                        ? "this audit processor?"
                        : "these audit processors?"}
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
            onClick={() => setIsCreatingAuditProcessor(true)}
          >
            Add
          </Button>
        </Group>
      </Flex>
      <DataTable
        idAccessor="audit_processor_id"
        mt="xs"
        withBorder
        fw="bolder"
        c="dimmed"
        minHeight={390}
        fetching={isLoading}
        records={auditProcessorList}
        columns={[
          {
            accessor: "checkbox",
            title: (
              <Checkbox
                key={headerCheckboxKey}
                className={classes.checkbox}
                checked={
                  checkList.length > 0 &&
                  checkList.length === auditProcessorList.length
                }
                size="xs"
                onChange={(e) => handleCheckAllRows(e.currentTarget.checked)}
              />
            ),
            render: ({ audit_processor_id }) => (
              <Checkbox
                className={classes.checkbox}
                size="xs"
                checked={checkList.includes(audit_processor_id)}
                onChange={() => {
                  handleCheckRow(audit_processor_id);
                }}
              />
            ),
            width: 40,
          },
          {
            accessor: "audit_processor_employee_number",
            title: "Employee Number",
            render: ({ audit_processor_employee_number }) => (
              <Text>{audit_processor_employee_number}</Text>
            ),
          },
          {
            accessor: "audit_processor_first_name",
            title: "First Name",
            render: ({ audit_processor_first_name }) => (
              <Text>{audit_processor_first_name}</Text>
            ),
          },
          {
            accessor: "audit_processor_last_name",
            title: "Last Name",
            render: ({ audit_processor_last_name }) => (
              <Text>{audit_processor_last_name}</Text>
            ),
          },
          {
            accessor: "status",
            title: "Status",
            textAlignment: "center",
            render: ({ audit_processor_is_available, audit_processor_id }) => (
              <Center>
                <Checkbox
                  checked={audit_processor_is_available}
                  className={classes.checkbox}
                  size="xs"
                  onChange={(e) =>
                    handleUpdateStatus(
                      audit_processor_id,
                      e.currentTarget.checked
                    )
                  }
                />
              </Center>
            ),
          },
        ]}
        totalRecords={auditProcessorCount}
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

export default AuditProcessorList;
