import { getRequestList, getTeamMemoSignerList } from "@/backend/api/get";
import { useFormList } from "@/stores/useFormStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import {
  DEFAULT_REQUEST_LIST_LIMIT,
  UNHIDEABLE_FORMLY_FORMS,
} from "@/utils/constant";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  RequestListFilterValues,
  RequestListItemType,
  TeamMemberWithUserType,
  TeamProjectTableRow,
} from "@/utils/types";
import {
  Box,
  Button,
  Container,
  Flex,
  Space,
  Text,
  Title,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconReload } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import RequestListFilter from "./RequestListFilter";
import RequestListTable from "./RequestListTable";
import RequestListTableColumnFilter from "./RequestListTableColumnFilter";

type Props = {
  teamMemberList: TeamMemberWithUserType[];
  isFormslyTeam: boolean;
  projectList: TeamProjectTableRow[];
};

const RequestListPage = ({
  teamMemberList,
  isFormslyTeam,
  projectList,
}: Props) => {
  const router = useRouter();
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const formList = useFormList();
  const teamMember = useUserTeamMember();
  const [activePage, setActivePage] = useState(1);
  const [isFetchingRequestList, setIsFetchingRequestList] = useState(false);
  const [requestList, setRequestList] = useState<RequestListItemType[]>([]);
  const [requestListCount, setRequestListCount] = useState(0);
  const [localFilter, setLocalFilter] =
    useLocalStorage<RequestListFilterValues>({
      key: "formsly-request-list-filter",
      defaultValue: {
        search: "",
        requestor: [],
        approver: [],
        form: [],
        status: undefined,
        isAscendingSort: false,
        isApproversView: false,
        project: [],
        idFilter: [],
      },
    });

  const [showTableColumnFilter, setShowTableColumnFilter] = useState(false);
  const [requestListTableColumnFilter, setRequestListTableColumnFilter] =
    useLocalStorage<string[]>({
      key: "request-list-table-column-filter",
      defaultValue: [],
    });

  const filterFormMethods = useForm<RequestListFilterValues>({
    defaultValues: localFilter,
    mode: "onChange",
  });

  const filteredFormList = formList
    .filter(({ form_name }) => !UNHIDEABLE_FORMLY_FORMS.includes(form_name))
    .map(({ form_name: label, form_id: value }) => ({ label, value }));

  const { handleSubmit, getValues, control } = filterFormMethods;

  const selectedFormFilter = useWatch({ name: "form", control });

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
      const {
        search,
        requestor,
        approver,
        form,
        status,
        isAscendingSort,
        isApproversView,
        project,
        idFilter,
      } = getValues();

      const params = {
        teamId: activeTeam.team_id,
        page: page,
        limit: DEFAULT_REQUEST_LIST_LIMIT,
        requestor: requestor && requestor.length > 0 ? requestor : undefined,
        approver: approver && approver.length > 0 ? approver : undefined,
        form: form && form.length > 0 ? form : undefined,
        status: status && status.length > 0 ? status : undefined,
        project: project && project.length > 0 ? project : undefined,
        idFilter: idFilter && idFilter.length < 0 ? idFilter : undefined,
        search: search,
        isApproversView,
        isAscendingSort,
        teamMemberId: teamMember.team_member_id,
      };

      const { data, count } = await getRequestList(supabaseClient, params);

      setRequestList(data);
      setRequestListCount(count || 0);
    } catch (error) {
      notifications.show({
        message: "Failed to fetch request list.",
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
      console.error(e);
    } finally {
      setIsFetchingRequestList(false);
    }
  };

  const handlePagination = async (page: number) => {
    try {
      setActivePage(page);
      await handleFetchRequestList(page);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingRequestList(false);
    }
  };

  const checkIfColumnIsHidden = (column: string) => {
    const isHidden = requestListTableColumnFilter.includes(column);
    return isHidden;
  };

  useEffect(() => {
    handlePagination(activePage);
  }, [activeTeam.team_id, teamMember]);

  return (
    <Container maw={3840} h="100%">
      <Flex align="center" gap="xl" wrap="wrap">
        <Box>
          <Title order={4}>Request List Page</Title>
          <Text>Manage your team requests here.</Text>
        </Box>
        {isFormslyTeam ? (
          <Button
            onClick={() =>
              router.push(
                `/${formatTeamNameToUrlKey(
                  activeTeam.team_name
                )}/requests/spreadsheet-view`
              )
            }
            sx={{ flex: 1 }}
            maw={300}
          >
            SSOT Spreadsheet View
          </Button>
        ) : null}
        <Button
          onClick={async () => {
            try {
              const teamMemoSignerList = await getTeamMemoSignerList(
                supabaseClient,
                {
                  teamId: activeTeam.team_id,
                }
              );
              console.log(teamMemoSignerList);
            } catch (e) {
              console.log(e);
            }
          }}
        >
          ASD
        </Button>
        <Button
          variant="light"
          leftIcon={<IconReload size={16} />}
          onClick={() => {
            handleFilterForms();
          }}
        >
          Refresh
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowTableColumnFilter(true)}
        >
          {" "}
          Show/Hide Table Columns
        </Button>
      </Flex>
      <Space h="sm" />
      <FormProvider {...filterFormMethods}>
        <form onSubmit={handleSubmit(handleFilterForms)}>
          <RequestListFilter
            teamMemberList={teamMemberList}
            handleFilterForms={handleFilterForms}
            formList={filteredFormList}
            localFilter={localFilter}
            setLocalFilter={setLocalFilter}
            projectList={projectList}
          />
        </form>
      </FormProvider>
      <Space h="sm" />
      <Box h="fit-content">
        <RequestListTable
          requestList={requestList}
          requestListCount={requestListCount}
          teamMemberList={teamMemberList}
          activePage={activePage}
          isFetchingRequestList={isFetchingRequestList}
          handlePagination={handlePagination}
          checkIfColumnIsHidden={checkIfColumnIsHidden}
          selectedFormFilter={selectedFormFilter}
        />
      </Box>
      <RequestListTableColumnFilter
        showTableColumnFilter={showTableColumnFilter}
        setShowTableColumnFilter={setShowTableColumnFilter}
        requestListTableColumnFilter={requestListTableColumnFilter}
        setRequestListTableColumnFilter={setRequestListTableColumnFilter}
        selectedFormFilter={selectedFormFilter}
      />
    </Container>
  );
};

export default RequestListPage;
