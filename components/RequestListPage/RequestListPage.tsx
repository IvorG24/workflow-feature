import { getRequestList } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { DEFAULT_REQUEST_LIST_LIMIT } from "@/utils/constant";
import {
  FormStatusType,
  RequestListItemType,
  TeamMemberWithUserType,
} from "@/utils/types";
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  Group,
  Loader,
  LoadingOverlay,
  Notification,
  Pagination,
  Paper,
  ScrollArea,
  Space,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import RequestItemRow from "./RequestItemRow";
import RequestListFilter from "./RequestListFilter";

export type FilterFormValues = {
  search: string;
  requestorList: string[];
  formList: string[];
  status?: FormStatusType[];
  isAscendingSort: boolean;
  isFormslyTeam: boolean;
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
  const [activePage, setActivePage] = useState(1);
  const [isFetchingRequestList, setIsFetchingRequestList] = useState(false);
  const [requestList, setRequestList] =
    useState<RequestListItemType[]>(initialRequestList);

  const [requestListCount, setRequestListCount] = useState(
    initialRequestListCount
  );

  const [newRequestDetected, setNewRequestDetected] = useState(false);

  const filterFormMethods = useForm<FilterFormValues>({
    defaultValues: { isAscendingSort: false },
    mode: "onChange",
  });

  const { handleSubmit, getValues } = filterFormMethods;

  const handleFilterForms = async (
    {
      search,
      requestorList,
      formList,
      status,
      isAscendingSort,
    }: FilterFormValues = getValues()
  ) => {
    try {
      if (!activeTeam.team_id) return;
      setActivePage(1);
      setIsFetchingRequestList(true);
      const params = {
        teamId: activeTeam.team_id,
        page: 1,
        limit: DEFAULT_REQUEST_LIST_LIMIT,
        requestor:
          requestorList && requestorList.length > 0 ? requestorList : undefined,
        form: formList && formList.length > 0 ? formList : undefined,
        status: status && status.length > 0 ? status : undefined,
        search: search,
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

      const { search, requestorList, formList, status, isAscendingSort } =
        getValues();

      const params = {
        teamId: activeTeam.team_id,
        page: activePage,
        limit: DEFAULT_REQUEST_LIST_LIMIT,
        requestor:
          requestorList && requestorList.length > 0 ? requestorList : undefined,
        form: formList && formList.length > 0 ? formList : undefined,
        status: status && status.length > 0 ? status : undefined,
        search: search,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const handleRequestListInsert = async (data: { [key: string]: any }) => {
  //   const formId = data.request_form_id;
  //   const requestorId = data.request_team_member_id;
  //   const requestId = data.request_id;

  //   const { data: request_team_member, error: getTeamMemberError } =
  //     await supabaseClient
  //       .from("team_member_table")
  //       .select(
  //         "team_member_team_id, team_member_user: team_member_user_id!inner(user_id, user_first_name, user_last_name, user_avatar)"
  //       )
  //       .eq("team_member_id", requestorId)
  //       .single();

  //   const { data: request_form, error: getFormError } = await supabaseClient
  //     .from("form_table")
  //     .select("form_id, form_name, form_description")
  //     .eq("form_id", formId)
  //     .single();

  //   const { data: request_signer, error: getSignerError } = await supabaseClient
  //     .from("request_signer_table")
  //     .select(
  //       "request_signer_id, request_signer_status, request_signer: request_signer_signer_id!inner(signer_is_primary_signer, signer_team_member: signer_team_member_id!inner(team_member_user: team_member_user_id!inner(user_id, user_first_name, user_last_name, user_avatar)))"
  //     )
  //     .eq("request_signer_request_id", requestId);

  //   const newRequest = {
  //     request_id: requestId,
  //     request_formsly_id: data.request_formsly_id,
  //     request_date_created: data.request_date_created,
  //     request_status: data.request_status,
  //     request_team_member,
  //     request_form,
  //     request_signer,
  //   };
  //   if (
  //     [getTeamMemberError, getFormError, getSignerError].every(
  //       (error) => !error
  //     )
  //   ) {
  //     setRequestList((prev) => [newRequest as RequestListItemType, ...prev]);
  //   }
  // };

  supabaseClient
    .channel("schema-db-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "request_table" },
      async (payload) => {
        if (payload.eventType === "INSERT") {
          setNewRequestDetected(true);
        }
        if (payload.eventType === "UPDATE") {
          setRequestList((prev) =>
            prev.map((request) => {
              if (request.request_id === payload.old.request_id) {
                return {
                  ...request,
                  request_status: payload.new.request_status,
                };
              }
              return request;
            })
          );
        }
      }
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "request_signer_table" },
      async (payload) => {
        if (payload) {
          setRequestList((prev) =>
            prev.map((request) => {
              if (
                request.request_id === payload.new.request_signer_request_id
              ) {
                const updatedSigner = request.request_signer.map((signer) => {
                  if (
                    signer.request_signer_id === payload.new.request_signer_id
                  ) {
                    return {
                      ...signer,
                      request_signer_status: payload.new.request_signer_status,
                    };
                  }

                  return signer;
                });

                return {
                  ...request,
                  request_signer: updatedSigner,
                };
              }
              return request;
            })
          );
        }
      }
    )
    .subscribe();

  useEffect(() => {
    handlePagination();
  }, [activePage]);

  return (
    <Container maw={1300} h="100%">
      {newRequestDetected && (
        <Notification
          pos="absolute"
          sx={{ zIndex: 2077, bottom: 30, right: 80 }}
          onClose={() => setNewRequestDetected(false)}
        >
          <Group mr={64}>
            <Text>New requests detected.</Text>
            <Button
              variant="light"
              size="xs"
              onClick={() => {
                handleFilterForms();
                setNewRequestDetected(false);
              }}
            >
              Refresh List
            </Button>
          </Group>
        </Notification>
      )}
      <Flex align="center" gap="xl" wrap="wrap">
        <Box>
          <Title order={4}>Request List Page</Title>
          <Text>Manage your team requests here.</Text>
        </Box>
        {isFormslyTeam ? (
          <Button
            variant="light"
            onClick={() => router.push("/team-requests/spreadsheet-view")}
            sx={{ flex: 1 }}
            maw={300}
          >
            SSOT Spreadsheet View
          </Button>
        ) : null}
      </Flex>
      <Space h="sm" />
      <FormProvider {...filterFormMethods}>
        <form onSubmit={handleSubmit(handleFilterForms)}>
          <RequestListFilter
            teamMemberList={teamMemberList}
            handleFilterForms={handleFilterForms}
            formList={formList}
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
                    <Grid.Col span={2}>
                      <Text weight={600}>Request ID</Text>
                    </Grid.Col>
                    <Grid.Col span={3}>
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
          <Text align="center" size={24} weight="bolder" color="dark.1">
            No request/s found
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
