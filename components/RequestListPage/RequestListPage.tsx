import { getRequestList } from "@/backend/api/get";
import { useFormList } from "@/stores/useFormStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import {
  DEFAULT_REQUEST_LIST_LIMIT,
  UNHIDEABLE_FORMLY_FORMS,
} from "@/utils/constant";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { getJiraTicketStatusColor } from "@/utils/styling";
import {
  JiraStatus,
  RequestListFilterValues,
  RequestListItemType,
  TeamMemberWithUserType,
  TeamProjectTableRow,
} from "@/utils/types";
import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Box,
  Button,
  Container,
  CopyButton,
  Divider,
  Flex,
  Grid,
  Group,
  Loader,
  LoadingOverlay,
  Pagination,
  Paper,
  ScrollArea,
  Space,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconAlertCircle, IconCopy, IconReload } from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import RequestItemRow from "./RequestItemRow";
import RequestListFilter from "./RequestListFilter";

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
  const [jiraStatusList, setJiraStatusList] = useState<JiraStatus[]>([]);
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

  const [requestListCount, setRequestListCount] = useState(0);

  const filterFormMethods = useForm<RequestListFilterValues>({
    defaultValues: localFilter,
    mode: "onChange",
  });

  const filteredFormList = formList
    .filter(({ form_name }) => !UNHIDEABLE_FORMLY_FORMS.includes(form_name))
    .map(({ form_name: label, form_id: value }) => ({ label, value }));

  const { handleSubmit, getValues } = filterFormMethods;

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
      console.log(error);
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
      await handleFetchRequestList(1);
    } catch (e) {
      console.log(e);
    } finally {
      setIsFetchingRequestList(false);
    }
  };

  const handlePagination = async (page: number) => {
    try {
      setActivePage(page);

      await handleFetchRequestList(page);
    } catch (e) {
      console.log(e);
    } finally {
      setIsFetchingRequestList(false);
    }
  };

  useEffect(() => {
    const localStorageFilter = localStorage.getItem(
      "formsly-request-list-filter"
    );

    if (localStorageFilter) {
      handleFilterForms();
    }
  }, [activeTeam.team_id, teamMember, localFilter]);

  // fetch jira id status
  useEffect(() => {
    const fetchJiraStatusList = async () => {
      let index = 0;
      const currentJiraStatusList = jiraStatusList;
      while (true) {
        const currentRequest = requestList[index];
        if (
          currentRequest &&
          currentRequest.request_jira_id &&
          currentRequest.request_jira_id !== null
        ) {
          const requestJiraTicketData = await fetch(
            `/api/get-jira-ticket?jiraTicketKey=${currentRequest.request_jira_id}`
          );

          if (!requestJiraTicketData.ok) {
            currentJiraStatusList.push({
              request_jira_id: currentRequest.request_jira_id,
              request_jira_status: "Ticket Not Found",
            });
          } else {
            const jiraTicket = await requestJiraTicketData.json();
            const jiraTicketStatus =
              jiraTicket.fields["customfield_10010"].currentStatus.status;

            currentJiraStatusList.push({
              request_jira_id: currentRequest.request_jira_id,
              request_jira_status: jiraTicketStatus,
            });
          }
        }

        index += 1;

        if (index > requestList.length) break;
      }
      setJiraStatusList(currentJiraStatusList);
      index = 0;
    };
    fetchJiraStatusList();
  }, [jiraStatusList, requestList, activePage]);

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
            formList={filteredFormList}
            localFilter={localFilter}
            setLocalFilter={setLocalFilter}
            projectList={projectList}
          />
        </form>
      </FormProvider>
      <Space h="sm" />
      <Box h="fit-content">
        <DataTable
          fontSize={16}
          idAccessor="request_id"
          sx={{
            thead: {
              tr: {
                backgroundColor: "transparent",
              },
            },
          }}
          styles={(theme) => ({
            header: {
              background:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[5]
                  : theme.colors.gray[1],
            },
          })}
          withBorder
          minHeight={390}
          fetching={isFetchingRequestList}
          totalRecords={requestListCount}
          recordsPerPage={DEFAULT_REQUEST_LIST_LIMIT}
          page={activePage}
          onPageChange={(p) => {
            handlePagination(p);
          }}
          records={requestList}
          columns={[
            {
              accessor: "request_id",
              title: "Request ID",
              render: ({ request_id, request_formsly_id }) => {
                const requestId =
                  request_formsly_id === "-" ? request_id : request_formsly_id;

                return (
                  <Flex key={request_id} justify="space-between">
                    <Text truncate maw={150}>
                      <Anchor
                        href={`/${formatTeamNameToUrlKey(
                          activeTeam.team_name ?? ""
                        )}/requests/${requestId}`}
                        target="_blank"
                      >
                        {requestId}
                      </Anchor>
                    </Text>
                    <CopyButton
                      value={`${
                        process.env.NEXT_PUBLIC_SITE_URL
                      }/${formatTeamNameToUrlKey(
                        activeTeam.team_name ?? ""
                      )}/requests/${request_formsly_id}`}
                    >
                      {({ copied, copy }) => (
                        <Tooltip
                          label={copied ? "Copied" : `Copy ${requestId}`}
                          onClick={copy}
                        >
                          <ActionIcon>
                            <IconCopy size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  </Flex>
                );
              },
            },
            {
              accessor: "request_jira_id",
              title: "JIRA ID",
              render: ({ request_jira_id, request_jira_link }) => {
                const jiraTicketStatus = jiraStatusList.find(
                  (status) => status.request_jira_id === request_jira_id
                )?.request_jira_status;

                return (
                  <Flex justify="space-between" key={request_jira_id}>
                    <Group>
                      <Text>
                        <Anchor href={request_jira_link} target="_blank">
                          {request_jira_id}
                        </Anchor>
                      </Text>
                      {jiraTicketStatus && (
                        <Badge
                          color={getJiraTicketStatusColor(
                            jiraTicketStatus.toLowerCase()
                          )}
                        >
                          {jiraTicketStatus}
                        </Badge>
                      )}
                    </Group>
                    {request_jira_id && (
                      <CopyButton value={request_jira_id}>
                        {({ copied, copy }) => (
                          <Tooltip
                            label={
                              copied ? "Copied" : `Copy ${request_jira_id}`
                            }
                            onClick={copy}
                          >
                            <ActionIcon>
                              <IconCopy size={16} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                    )}
                  </Flex>
                );
              },
            },
            {
              accessor: "request_otp_id",
              title: "OTP ID",
              render: ({ request_otp_id }) => (
                <Flex key={request_otp_id} justify="space-between">
                  <Text truncate maw={150}>
                    {request_otp_id}
                  </Text>
                  {request_otp_id && (
                    <CopyButton value={request_otp_id}>
                      {({ copied, copy }) => (
                        <Tooltip
                          label={copied ? "Copied" : `Copy ${request_otp_id}`}
                          onClick={copy}
                        >
                          <ActionIcon>
                            <IconCopy size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  )}
                </Flex>
              ),
            },
          ]}
        />
      </Box>

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
                    <RequestItemRow
                      request={request}
                      teamMemberList={teamMemberList}
                    />
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
