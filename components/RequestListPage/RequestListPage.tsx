import { getRequestList } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { DEFAULT_REQUEST_LIST_LIMIT } from "@/utils/constant";
import {
  FormStatusType,
  RequestListItemType,
  TeamMemberWithUserType,
} from "@/utils/types";
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  Loader,
  LoadingOverlay,
  Pagination,
  Paper,
  ScrollArea,
  Space,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconAlertCircle, IconReload } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useBeforeunload } from "react-beforeunload";
import { FormProvider, useForm } from "react-hook-form";
import RequestItemRow from "./RequestItemRow";
import RequestListFilter from "./RequestListFilter";

export type FilterFormValues = {
  search: string;
  requestorList: string[];
  approverList: string[];
  formList: string[];
  status?: FormStatusType[];
  isAscendingSort: boolean;
  isApproversView: boolean;
};

export type RequestListLocalFilter = {
  search: string;
  requestorList: string[];
  approverList: string[];
  formList: string[];
  status: FormStatusType[] | undefined;
  isAscendingSort: boolean;
  isApproversView: boolean;
};

type Props = {
  requestList: RequestListItemType[];
  requestListCount: number;
  teamMemberList: TeamMemberWithUserType[];
  formList: { label: string; value: string }[];
  isFormslyTeam: boolean;
};

const RequestListPage = ({
  requestList: initialRequestList,
  requestListCount: initialRequestListCount,
  teamMemberList,
  formList,
  isFormslyTeam,
}: Props) => {
  const router = useRouter();
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const teamMember = useUserTeamMember();
  const [activePage, setActivePage] = useState(1);
  const [isFetchingRequestList, setIsFetchingRequestList] = useState(false);
  const [requestList, setRequestList] =
    useState<RequestListItemType[]>(initialRequestList);
  const [localFilter, setLocalFilter] = useLocalStorage<RequestListLocalFilter>(
    {
      key: "formsly-request-list-filter",
      defaultValue: {
        search: "",
        requestorList: [],
        approverList: [],
        formList: [],
        status: undefined,
        isAscendingSort: false,
        isApproversView: false,
      },
    }
  );

  const [requestListCount, setRequestListCount] = useState(
    initialRequestListCount
  );

  const filterFormMethods = useForm<FilterFormValues>({
    defaultValues: localFilter,
    mode: "onChange",
  });

  const { handleSubmit, getValues } = filterFormMethods;

  const handleFilterForms = async (
    {
      search,
      requestorList,
      approverList,
      formList,
      status,
      isAscendingSort,
      isApproversView,
    }: FilterFormValues = getValues()
  ) => {
    try {
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

      setActivePage(1);
      setIsFetchingRequestList(true);

      const params = {
        teamId: activeTeam.team_id,
        page: 1,
        limit: DEFAULT_REQUEST_LIST_LIMIT,
        requestor:
          requestorList && requestorList.length > 0 ? requestorList : undefined,
        approver:
          approverList && approverList.length > 0 ? approverList : undefined,
        form: formList && formList.length > 0 ? formList : undefined,
        status: status && status.length > 0 ? status : undefined,
        search: search,
        isApproversView,
        teamMemberId: teamMember.team_member_id,
      };

      const { data, count } = await getRequestList(supabaseClient, {
        ...params,
        sort: isAscendingSort ? "ascending" : "descending",
      });

      setRequestList(data);
      setRequestListCount(count || 0);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingRequestList(false);
    }
  };

  const handlePagination = async () => {
    try {
      setIsFetchingRequestList(true);
      if (!activeTeam.team_id) return;
      if (!teamMember) return;
      const {
        search,
        requestorList,
        formList,
        status,
        isAscendingSort,
        isApproversView,
      } = getValues();

      const params = {
        teamId: activeTeam.team_id,
        page: activePage,
        limit: DEFAULT_REQUEST_LIST_LIMIT,
        requestor:
          requestorList && requestorList.length > 0 ? requestorList : undefined,
        form: formList && formList.length > 0 ? formList : undefined,
        status: status && status.length > 0 ? status : undefined,
        search: search,
        isApproversView,
        teamMemberId: teamMember.team_member_id,
      };

      const { data, count } = await getRequestList(supabaseClient, {
        ...params,
        sort: isAscendingSort ? "ascending" : "descending",
      });

      setRequestList(data);
      setRequestListCount(count || 0);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingRequestList(false);
    }
  };

  useEffect(() => {
    handlePagination();
  }, [activePage]);

  useEffect(() => {
    const localStorageFilter = localStorage.getItem(
      "formsly-request-list-filter"
    );

    if (localStorageFilter) {
      handleFilterForms();
    }
  }, [activeTeam.team_id, teamMember]);

  useBeforeunload(() => {
    const filterValues = getValues();
    setLocalFilter(filterValues as RequestListLocalFilter);
  });

  return (
    <Container maw={1300} h="100%">
      <Flex align="center" gap="xl" wrap="wrap">
        <Box>
          <Title order={4}>Request List Page</Title>
          <Text>Manage your team requests here.</Text>
        </Box>
        {isFormslyTeam ? (
          <Button
            onClick={() => router.push("/team-requests/spreadsheet-view")}
            sx={{ flex: 1 }}
            maw={300}
          >
            SSOT Spreadsheet View
          </Button>
        ) : null}
        <Button
          variant="light"
          leftIcon={<IconReload size={16} />}
          onClick={() => handleFilterForms()}
        >
          Refresh
        </Button>
      </Flex>
      <Space h="sm" />
      <FormProvider {...filterFormMethods}>
        <form onSubmit={handleSubmit(handleFilterForms)}>
          <RequestListFilter
            teamMemberList={teamMemberList}
            handleFilterForms={handleFilterForms}
            formList={formList}
            localFilter={localFilter}
          />
        </form>
      </FormProvider>
      <Space h="sm" />

      <Box h="fit-content" pos="relative">
        <LoadingOverlay
          visible={isFetchingRequestList}
          overlayBlur={0}
          overlayOpacity={0.2}
          loader={<Loader variant="dots" />}
        />
        {requestList.length > 0 ? (
          <Paper withBorder>
            <ScrollArea h="fit-content" type="auto">
              <Stack spacing={0} miw={1074}>
                <Box
                  sx={(theme) => ({
                    backgroundColor:
                      theme.colorScheme === "dark"
                        ? theme.colors.dark[5]
                        : theme.colors.gray[1],
                  })}
                >
                  <Grid m={0} px="sm" justify="space-between">
                    <Grid.Col span={1}>
                      <Text weight={600}>Request ID</Text>
                    </Grid.Col>
                    <Grid.Col span={1}>
                      <Text weight={600}>Jira ID</Text>
                    </Grid.Col>
                    <Grid.Col span={1}>
                      <Text weight={600}>OTP ID</Text>
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <Text weight={600}>Form Name</Text>
                    </Grid.Col>
                    <Grid.Col span={1}>
                      <Text weight={600}>Status</Text>
                    </Grid.Col>

                    <Grid.Col span="auto" offset={0.5}>
                      <Text weight={600} pl={8}>
                        Requested By
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={1}>
                      <Text weight={600}>Approver</Text>
                    </Grid.Col>
                    <Grid.Col span="content">
                      <Text weight={600}>Date Created</Text>
                    </Grid.Col>
                    <Grid.Col span="content">
                      <Text weight={600}>View</Text>
                    </Grid.Col>
                  </Grid>
                  <Divider />
                </Box>
                {requestList.map((request, idx) => (
                  <Box key={request.request_id}>
                    <RequestItemRow request={request} />
                    {idx + 1 < DEFAULT_REQUEST_LIST_LIMIT ? <Divider /> : null}
                  </Box>
                ))}
              </Stack>
            </ScrollArea>
          </Paper>
        ) : (
          <Text align="center" size={24} weight="bolder" color="dimmed">
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              color="orange"
              mt="xs"
            >
              No request/s found.
            </Alert>
          </Text>
        )}
      </Box>

      <Flex justify="flex-end">
        <Pagination
          value={activePage}
          onChange={setActivePage}
          total={Math.ceil(requestListCount / DEFAULT_REQUEST_LIST_LIMIT)}
          mt="xl"
        />
      </Flex>
    </Container>
  );
};

export default RequestListPage;
