import { deleteRow } from "@/backend/api/delete";
import { getServiceList } from "@/backend/api/get";
import { toggleStatus } from "@/backend/api/update";
import { useActiveTeam } from "@/stores/useTeamStore";
import { ROW_PER_PAGE } from "@/utils/constant";
import { generateRandomId } from "@/utils/functions";
import { ServiceScopeTableRow, ServiceWithScopeType } from "@/utils/types";
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
  serviceList: ServiceWithScopeType[];
  setServiceList: Dispatch<SetStateAction<ServiceWithScopeType[]>>;
  serviceCount: number;
  setServiceCount: Dispatch<SetStateAction<number>>;
  setIsCreatingService: Dispatch<SetStateAction<boolean>>;
  setSelectedService: Dispatch<SetStateAction<ServiceWithScopeType | null>>;
};

const ServiceList = ({
  serviceList,
  setServiceList,
  serviceCount,
  setServiceCount,
  setIsCreatingService,
  setSelectedService,
}: Props) => {
  const { classes } = useStyles();

  const supabaseClient = useSupabaseClient();
  const activeTeam = useActiveTeam();

  const [isLoading, setIsLoading] = useState(false);

  const [activePage, setActivePage] = useState(1);
  const [checkList, setCheckList] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const headerCheckboxKey = generateRandomId();

  const handleCheckRow = (serviceId: string) => {
    if (checkList.includes(serviceId)) {
      setCheckList(checkList.filter((id) => id !== serviceId));
    } else {
      setCheckList([...checkList, serviceId]);
    }
  };

  const handleCheckAllRows = (checkAll: boolean) => {
    if (checkAll) {
      const serviceIdList = serviceList.map((service) => service.service_id);
      setCheckList(serviceIdList);
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
      const { data, count } = await getServiceList(supabaseClient, {
        teamId: activeTeam.team_id,
        search,
        limit: ROW_PER_PAGE,
        page: page,
      });
      setServiceList(data as ServiceWithScopeType[]);
      setServiceCount(Number(count));
    } catch {
      notifications.show({
        message: "Error on fetching service list",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const saveCheckList = checkList;
    const savedRecord = serviceList;

    try {
      const updatedServiceList = serviceList.filter((service) => {
        if (!checkList.includes(service.service_id)) {
          return service;
        }
      });
      setServiceList(updatedServiceList);
      setCheckList([]);

      await deleteRow(supabaseClient, {
        rowId: checkList,
        table: "service",
      });

      setSelectedService(null);

      notifications.show({
        message: "Service/s deleted.",
        color: "green",
      });
    } catch {
      setServiceList(savedRecord);
      setCheckList(saveCheckList);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleUpdateStatus = async (serviceId: string, value: boolean) => {
    const savedRecord = serviceList;
    try {
      setServiceList((prev) =>
        prev.map((service) => {
          if (service.service_id !== serviceId) return service;
          return {
            ...service,
            service_is_available: value,
          };
        })
      );
      await toggleStatus(supabaseClient, {
        table: "service",
        id: serviceId,
        status: value,
      });
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
      setServiceList(savedRecord);
    }
  };

  const formatServiceField = (serviceFieldLabel: ServiceScopeTableRow[]) => {
    let scope = "";
    serviceFieldLabel.forEach((fieldLabel) => {
      scope += `${fieldLabel.service_scope_name}, `;
    });
    return scope.slice(0, -2);
  };

  const handleColumnClick = (service_id: string) => {
    const selectedService = serviceList.find(
      (service) => service.service_id === service_id
    );
    setSelectedService(selectedService || null);
  };

  return (
    <Box>
      <Flex align="center" justify="space-between" wrap="wrap" gap="xs">
        <Group className={classes.flexGrow}>
          <Title m={0} p={0} order={3}>
            List of Services
          </Title>
          <TextInput
            miw={250}
            placeholder="Service Name"
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
                      {checkList.length === 1
                        ? "this service?"
                        : "these services?"}
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
            onClick={() => setIsCreatingService(true)}
          >
            Add
          </Button>
        </Group>
      </Flex>
      <DataTable
        idAccessor="service_id"
        mt="xs"
        withBorder
        fw="bolder"
        c="dimmed"
        minHeight={390}
        fetching={isLoading}
        records={serviceList}
        columns={[
          {
            accessor: "checkbox",
            title: (
              <Checkbox
                key={headerCheckboxKey}
                className={classes.checkbox}
                checked={
                  checkList.length > 0 &&
                  checkList.length === serviceList.length
                }
                size="xs"
                onChange={(e) => handleCheckAllRows(e.currentTarget.checked)}
              />
            ),
            render: ({ service_id }) => (
              <Checkbox
                className={classes.checkbox}
                size="xs"
                checked={checkList.includes(service_id)}
                onChange={() => {
                  handleCheckRow(service_id);
                }}
              />
            ),
            width: 40,
          },
          {
            accessor: "service_name",
            title: "Service Name",
            render: ({ service_name, service_id }) => (
              <Text
                className={classes.clickableColumn}
                onClick={() => {
                  handleColumnClick(service_id);
                }}
              >
                {service_name}
              </Text>
            ),
          },
          {
            accessor: "scope",
            title: "Scope",
            render: ({ service_id, service_scope }) => (
              <Text
                className={classes.clickableColumn}
                onClick={() => {
                  handleColumnClick(service_id);
                }}
              >
                {formatServiceField(service_scope)}
              </Text>
            ),
          },
          {
            accessor: "status",
            title: "Status",
            textAlignment: "center",
            render: ({ service_is_available, service_id }) => (
              <Center>
                <Checkbox
                  checked={service_is_available}
                  className={classes.checkbox}
                  size="xs"
                  onChange={(e) =>
                    handleUpdateStatus(service_id, e.currentTarget.checked)
                  }
                />
              </Center>
            ),
          },
        ]}
        totalRecords={serviceCount}
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

export default ServiceList;
