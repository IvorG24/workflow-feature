import { deploymentRecordOnLoad } from "@/backend/api/get";
import { useTeamMemberList } from "@/stores/useTeamMemberStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { DEFAULT_REQUEST_LIST_LIMIT } from "@/utils/constant";
import {
  DeploymentRecordType,
  TechnicalAssessmentFilterValues,
} from "@/utils/types";
import { Alert, Box, Container, Flex, Paper, Text, Title } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconAlertCircle } from "@tabler/icons-react";
import { DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import DeploymentAndRecordsCards from "./DeploymentAndRecordsCards";
import DeploymentAndRecordsFilter from "./DeploymentAndRecordsFilter";

const DeploymentAndRecordsPage = () => {
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const teamMember = useUserTeamMember();
  const teamMemberList = useTeamMemberList();

  const [activePage, setActivePage] = useState(1);
  const [isFetchingRequestList, setIsFetchingRequestList] = useState(false);
  const [deploymentRecordList, setDeploymentRecordList] = useState<
    DeploymentRecordType[]
  >([]);
  const [deploymentRecordCount, setDeploymentRecordCount] = useState(0);
  const [localFilter, setLocalFilter] =
    useLocalStorage<TechnicalAssessmentFilterValues>({
      key: "technical-assessment-filter",
      defaultValue: {
        search: "",
        creator: "",
        isAscendingSort: false,
      },
    });
  const [showTableColumnFilter, setShowTableColumnFilter] = useState(false);

  const filterFormMethods = useForm<TechnicalAssessmentFilterValues>({
    defaultValues: localFilter,
    mode: "onChange",
  });

  const { handleSubmit, getValues, setValue } = filterFormMethods;

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "request_date_created",
    direction: "desc",
  });

  const hanldeFetchDeploymentRecords = async (page: number) => {
    try {
      setIsFetchingRequestList(true);
      if (!activeTeam.team_id) {
        console.warn(
          "PracticalTestFormPage handleFetchPracticalTestList: active team_id not found"
        );
        return;
      } else if (!teamMember) {
        console.warn(
          "PracticalTestFormPage handleFetchPracticalTestList: team member id not found"
        );
        return;
      }
      const { search, isAscendingSort } = getValues();

      const params = {
        teamId: activeTeam.team_id,
        formId: "5ff4a1ad-bee6-4bb8-a94b-cb65cdff8355",
        search: search,
        isAscendingSort: isAscendingSort,
        columnAccessor: sortStatus.columnAccessor,
        limit: DEFAULT_REQUEST_LIST_LIMIT,
        page: page,
      };

      const { data, count } = await deploymentRecordOnLoad(
        supabaseClient,
        params
      );

      setDeploymentRecordList(data);
      setDeploymentRecordCount(count);
    } catch (e) {
      notifications.show({
        message: "Failed to fetch practical test list.",
        color: "red",
      });
    } finally {
      setIsFetchingRequestList(false);
    }
  };

  const handleFilterForms = async () => {
    setActivePage(1);
    await hanldeFetchDeploymentRecords(1);
  };

  const handlePagination = async (page: number) => {
    setActivePage(page);
    await hanldeFetchDeploymentRecords(page);
  };

  useEffect(() => {
    handlePagination(activePage);
  }, [activeTeam.team_id, teamMember]);

  return (
    <Container maw={3840} h="100%">
      <Flex align="center" gap="xl" wrap="wrap" pb="sm">
        <Box>
          <Title order={4}>Deployment Record List Page</Title>
          <Text>Manage your deployment records here.</Text>
        </Box>
      </Flex>
      <Paper p="md">
        <FormProvider {...filterFormMethods}>
          <form onSubmit={handleSubmit(handleFilterForms)}>
            <DeploymentAndRecordsFilter
              teamMemberList={teamMemberList}
              handleFilterForms={handleFilterForms}
              localFilter={localFilter}
              setLocalFilter={setLocalFilter}
              showTableColumnFilter={showTableColumnFilter}
              setShowTableColumnFilter={setShowTableColumnFilter}
              isFetchingRequestList={isFetchingRequestList}
              handlePagination={handlePagination}
              activePage={activePage}
              setSortStatus={setSortStatus}
              setValue={setValue}
              sortStatus={sortStatus}
            />
          </form>
        </FormProvider>
        <Box h="fit-content">
          {!deploymentRecordList.length ? (
            <Alert
              variant="light"
              color="blue"
              title="No Records"
              icon={<IconAlertCircle size={16} />}
            >
              All HRIS numbers in the automated laptop request are updated.
            </Alert>
          ) : null}
          {deploymentRecordList.length ? (
            <DeploymentAndRecordsCards
              deploymentRecordList={deploymentRecordList}
              deploymentRecordCount={deploymentRecordCount}
              activePage={activePage}
              setActivePage={setActivePage}
              isFetchingRequestList={isFetchingRequestList}
              handlePagination={handlePagination}
              setValue={setValue}
            />
          ) : null}
        </Box>
      </Paper>
    </Container>
  );
};

export default DeploymentAndRecordsPage;
