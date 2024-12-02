import { getAllGroups, getModuleRequestList } from "@/backend/api/get";
import { useFormList } from "@/stores/useFormStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import {
  useUserTeamMember,
  useUserTeamMemberGroupList,
} from "@/stores/useUserStore";
import {
  DEFAULT_REQUEST_LIST_LIMIT,
  REQUEST_LIST_HIDDEN_FORMS,
} from "@/utils/constant";
import {
  ModuleRequestList,
  OptionType,
  TeamMemberWithUserType,
  TeamProjectTableRow,
} from "@/utils/types";
import {
  Box,
  Container,
  Flex,
  LoadingOverlay,
  Paper,
  Text,
  Title,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import ModuleRequestListFilter from "./ModuleRequestListFilter";
import ModuleRequestListTable from "./ModuleRequestListTable";

type Props = {
  teamMemberList: TeamMemberWithUserType[];
  isFormslyTeam: boolean;
  projectList: TeamProjectTableRow[];
};
export type FilterSelectedValuesType = {
  form: string[];
  requestor: string[];
  approver: string[];
  search: string;
  isAscendingSort: boolean;
  isApprover: boolean;
};
const ModuleRequestListPage = ({ teamMemberList, projectList }: Props) => {
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const formList = useFormList();
  const teamMember = useUserTeamMember();
  const userTeamGroup = useUserTeamMemberGroupList();

  const [activePage, setActivePage] = useState(1);
  const [isFetchingRequestList, setIsFetchingRequestList] = useState(false);
  const [groupOptions, setGroupOptions] = useState<OptionType[]>([]);
  const [requestList, setRequestList] = useState<ModuleRequestList[]>([]);
  const [requestListCount, setRequestListCount] = useState(0);
  const [localFilter, setLocalFilter] = useState<FilterSelectedValuesType>({
    search: "",
    requestor: [],
    approver: [],
    form: [],
    isAscendingSort: false,
    isApprover: false,
  });
  const [showTableColumnFilter, setShowTableColumnFilter] = useState(false);

  const filterFormMethods = useForm<FilterSelectedValuesType>({
    defaultValues: localFilter,
    mode: "onChange",
  });

  const filteredFormList = formList
    .filter(({ form_name }) => !REQUEST_LIST_HIDDEN_FORMS.includes(form_name))
    .map(({ form_name: label, form_name: value }) => ({ label, value }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const { handleSubmit, getValues, control, setValue } = filterFormMethods;

  const selectedFormFilter = useWatch({ name: "form", control });

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "module_request_date_created",
    direction: "desc",
  });
  const [listTableColumnFilter, setListTableColumnFilter] = useLocalStorage<
    string[]
  >({
    key: "request-list-table-column-filter",
    defaultValue: [],
  });

  const tableColumnList = [
    { value: "request_id", label: "Request ID" },
    { value: "module_name", label: "Module Name" },
    { value: "date_created", label: "Date Created" },
    { value: "form_name", label: "Form name" },
    { value: "request_status", label: "Request Status" },
    { value: "requested_by", label: "Requested By" },
    { value: "approver", label: "Approver" },
    { value: "view", label: "View" },
  ];

  const checkIfColumnIsHidden = (column: string) => {
    const isHidden = listTableColumnFilter.includes(column);
    return isHidden;
  };

  const handleFetchRequestList = async (page: number) => {
    try {
      setIsFetchingRequestList(true);
      if (!activeTeam.team_id) {
        console.warn(
          "RequestListPage handleFilterFormsError: active team_id not found"
        );
        return;
      } else if (!teamMember) {
        console.warn(
          "RequestListPage handleFilterFormsError: team member id not found"
        );
        return;
      }
      const { search, requestor, approver, form, isAscendingSort, isApprover } =
        getValues();

      const params = {
        page: page,
        limit: DEFAULT_REQUEST_LIST_LIMIT,
        search: search,
        requestor: requestor,
        approver: approver,
        columnAccessor: sortStatus.columnAccessor,
        form: form,
        isAscendingSort: isAscendingSort,
        teamId: activeTeam.team_id,
        teamGroup: userTeamGroup,
        teamMemberId: teamMember.team_member_id,
        isApprover,
      };

      const { ModuleRequestList, count } = await getModuleRequestList(
        supabaseClient,
        params
      );

      setRequestList(ModuleRequestList);
      setRequestListCount(count);
    } catch (e) {
      notifications.show({
        message: "Failed to fetch module request list.",
        color: "red",
      });
    } finally {
      setIsFetchingRequestList(false);
    }
  };

  const handleFilterForms = async () => {
    try {
      setActivePage(1);
      await handleFetchRequestList(1);
    } catch (e) {
    } finally {
      setIsFetchingRequestList(false);
    }
  };

  const handlePagination = async (page: number) => {
    try {
      setActivePage(page);
      await handleFetchRequestList(page);
    } catch (e) {
    } finally {
      setIsFetchingRequestList(false);
    }
  };

  useEffect(() => {
    if (!activeTeam.team_id) return;
    const fetchOptions = async () => {
      try {
        setIsFetchingRequestList(true);

        const groups = await getAllGroups(supabaseClient, {
          teamId: activeTeam.team_id,
        });

        const groupOptions = groups.map((group) => ({
          label: group.team_group_name,
          value: group.team_group_name,
        }));

        setGroupOptions(groupOptions);
      } catch {
        notifications.show({
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
      } finally {
        setIsFetchingRequestList(false);
      }
    };
    fetchOptions();
  }, [supabaseClient, activeTeam.team_id]);
  useEffect(() => {
    handlePagination(activePage);
  }, [activeTeam.team_id, teamMember]);

  return (
    <Container maw={3840} h="100%">
      <LoadingOverlay
        visible={isFetchingRequestList}
        overlayBlur={2}
        sx={{ position: "fixed" }}
      />
      <Flex align="center" gap="xl" wrap="wrap" pb="sm">
        <Box>
          <Title order={4}>Module Request List Page</Title>
          <Text>Manage your module requests here.</Text>
        </Box>
      </Flex>
      <Paper p="md">
        <FormProvider {...filterFormMethods}>
          <form onSubmit={handleSubmit(handleFilterForms)}>
            <ModuleRequestListFilter
              groupOptions={groupOptions}
              teamMemberList={teamMemberList}
              handleFilterForms={handleFilterForms}
              formList={filteredFormList}
              localFilter={localFilter}
              setLocalFilter={setLocalFilter}
              projectList={projectList}
              showTableColumnFilter={showTableColumnFilter}
              setShowTableColumnFilter={setShowTableColumnFilter}
            />
          </form>
        </FormProvider>
        <Box h="fit-content">
          <ModuleRequestListTable
            moduleRequestList={requestList}
            requestListCount={requestListCount}
            teamMemberList={teamMemberList}
            activePage={activePage}
            isFetchingRequestList={isFetchingRequestList}
            handlePagination={handlePagination}
            selectedFormFilter={selectedFormFilter}
            sortStatus={sortStatus}
            setValue={setValue}
            setSortStatus={setSortStatus}
            checkIfColumnIsHidden={checkIfColumnIsHidden}
            showTableColumnFilter={showTableColumnFilter}
            setShowTableColumnFilter={setShowTableColumnFilter}
            listTableColumnFilter={listTableColumnFilter}
            setListTableColumnFilter={setListTableColumnFilter}
            tableColumnList={tableColumnList}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default ModuleRequestListPage;
