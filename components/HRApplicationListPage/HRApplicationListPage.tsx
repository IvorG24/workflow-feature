import {
  getApplicationInformationIndicator,
  getUserApplicationList,
} from "@/backend/api/get";
import { useUserTeamMember } from "@/stores/useUserStore";
import { DEFAULT_APPLICATION_LIST_LIMIT } from "@/utils/constant";
import {
  ApplicationListItemType,
  UserApplicationListFilterValues,
} from "@/utils/types";
import { Box, Container, Flex, Paper, Text, Title } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import HRApplicationListFilter from "./HRApplicationListFilter";
import HRApplicationListTable from "./HRApplicationListTable";

const HRApplicationListPage = () => {
  const supabaseClient = useSupabaseClient();
  const currentUser = useUser();
  const teamMember = useUserTeamMember();

  const [activePage, setActivePage] = useState(1);
  const [isFetchingApplicationList, setIsFetchingApplicationList] =
    useState(false);
  const [applicationList, setApplicationList] = useState<
    ApplicationListItemType[]
  >([]);
  const [applicationListCount, setApplicationListCount] = useState(0);
  const [showTableColumnFilter, setShowTableColumnFilter] = useState(false);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "request_date_created",
    direction: "desc",
  });
  const [listTableColumnFilter, setListTableColumnFilter] = useLocalStorage<
    string[]
  >({
    key: "application-list-table-column-filter",
    defaultValue: [],
  });

  const filterFormMethods = useForm<UserApplicationListFilterValues>({
    mode: "onChange",
  });

  const { handleSubmit, getValues, setValue } = filterFormMethods;

  const tableColumnList = [
    { value: "application_id", label: "Application ID" },
    { value: "position", label: "Position" },
    { value: "application_date_created", label: "Date Created" },
    { value: "progress", label: "Progress" },
  ];

  const handleFetchApplicationList = async (page: number) => {
    try {
      if (!currentUser?.email || !teamMember) return;
      setIsFetchingApplicationList(true);

      const { search, isAscendingSort } = getValues();

      const params = {
        page: page,
        limit: DEFAULT_APPLICATION_LIST_LIMIT,
        isAscendingSort,
        email: currentUser.email,
        search,
        teamMemberId: teamMember.team_member_id,
      };

      const { data, count } = await getUserApplicationList(
        supabaseClient,
        params
      );

      setApplicationList(data);
      setApplicationListCount(count || 0);
      fetchIndicator(data);
    } catch (e) {
      notifications.show({
        message: "Failed to fetch application list.",
        color: "red",
      });
    } finally {
      setIsFetchingApplicationList(false);
    }
  };

  const handlePagination = async (page: number) => {
    setActivePage(page);
    await handleFetchApplicationList(page);
  };

  useEffect(() => {
    if (currentUser?.email && teamMember) {
      handlePagination(activePage);
    }
  }, [currentUser?.email, teamMember]);

  const handleFilterForms = async () => {
    try {
      setActivePage(1);
      await handleFetchApplicationList(1);
    } catch (e) {
    } finally {
      setIsFetchingApplicationList(false);
    }
  };

  const fetchIndicator = async (data: ApplicationListItemType[]) => {
    try {
      if (!data.length) return;
      const newData = await getApplicationInformationIndicator(supabaseClient, {
        requestList: data,
      });
      setApplicationList(newData);
    } catch (e) {
      notifications.show({
        message: "Failed to fetch application list indicator.",
        color: "red",
      });
    }
  };

  return (
    <Container maw={3840} h="100%">
      <Flex align="center" gap="xl" wrap="wrap" pb="sm">
        <Box>
          <Title order={4}>Representing Application List Page</Title>
          <Text>Manage your represented applications here.</Text>
        </Box>
      </Flex>
      <Paper p="md">
        <FormProvider {...filterFormMethods}>
          <form onSubmit={handleSubmit(handleFilterForms)}>
            <HRApplicationListFilter
              handleFilterForms={handleFilterForms}
              isFetchingApplicationList={isFetchingApplicationList}
            />
          </form>
        </FormProvider>
        <Box h="fit-content">
          <HRApplicationListTable
            applicationList={applicationList}
            applicationListCount={applicationListCount}
            activePage={activePage}
            isFetchingApplicationList={isFetchingApplicationList}
            handlePagination={handlePagination}
            setValue={setValue}
            showTableColumnFilter={showTableColumnFilter}
            setShowTableColumnFilter={setShowTableColumnFilter}
            listTableColumnFilter={listTableColumnFilter}
            setListTableColumnFilter={setListTableColumnFilter}
            tableColumnList={tableColumnList}
            sortStatus={sortStatus}
            setSortStatus={setSortStatus}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default HRApplicationListPage;
