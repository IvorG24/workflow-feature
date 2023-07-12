import { getRequestList } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { DEFAULT_REQUEST_LIST_LIMIT } from "@/utils/constant";
import {
  FormStatusType,
  RequestType,
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
  LoadingOverlay,
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
  requestList: RequestType[];
  requestListCount: number;
  teamMemberList: TeamMemberWithUserType[];
  formList: { label: string; value: string }[];
  isFormslyTeam: boolean;
};

const RequestListPage = ({
  requestList,
  requestListCount: initialRequestListCount,
  teamMemberList,
  formList,
  isFormslyTeam,
}: Props) => {
  const router = useRouter();
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const [visibleRequestList, setVisibleRequestList] =
    useState<RequestType[]>(requestList);
  const [activePage, setActivePage] = useState(1);
  const [isFetchingRequestList, setIsFetchingRequestList] = useState(false);
  const [requestListCount, setRequestListCount] = useState(
    initialRequestListCount
  );

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
      setVisibleRequestList(data as RequestType[]);
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
    setVisibleRequestList(requestList || []);
  }, [requestList]);

  return (
    <Container fluid>
      <Flex align="center" gap="xl">
        <Box>
          <Title order={4}>Request List Page</Title>
          <Text>Manage your team requests here.</Text>
        </Box>
        {isFormslyTeam ? (
          <Button
            variant="light"
            onClick={() => router.push("/team-requests/spreadsheet-view")}
          >
            SSOT Spreadsheet View
          </Button>
        ) : null}
      </Flex>
      <Group spacing={4} mt="sm">
        <FormProvider {...filterFormMethods}>
          <form onSubmit={handleSubmit(handleFilterForms)}>
            <RequestListFilter
              teamMemberList={teamMemberList}
              handleFilterForms={handleFilterForms}
              formList={formList}
            />
          </form>
        </FormProvider>
      </Group>
      <Space h="sm" />
      {visibleRequestList.length > 0 ? (
        <Paper w="100%" maw={1300}>
          <ScrollArea w="auto">
            <LoadingOverlay visible={isFetchingRequestList} overlayBlur={2} />
            <Stack miw={1076} w="100%" p="md">
              <Grid justify="space-between">
                <Grid.Col span={2}>
                  <Text weight={600}>Request ID</Text>
                </Grid.Col>
                <Grid.Col span={3}>
                  <Text weight={600}>Form Name</Text>
                </Grid.Col>
                <Grid.Col span={2}>
                  <Text weight={600}>Date Created</Text>
                </Grid.Col>
                <Grid.Col span={2}>
                  <Text weight={600}>Requested By</Text>
                </Grid.Col>
                <Grid.Col span={1}>
                  <Text weight={600}>Approver</Text>
                </Grid.Col>
                <Grid.Col span={1}>
                  <Text weight={600} align="center">
                    View
                  </Text>
                </Grid.Col>
              </Grid>
              <Divider />
              {visibleRequestList.map((request, idx) => (
                <Box key={request.request_id}>
                  <RequestItemRow request={request} />
                  {idx + 1 < DEFAULT_REQUEST_LIST_LIMIT ? (
                    <Divider mt="sm" />
                  ) : null}
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
      <Pagination
        value={activePage}
        onChange={async (value) => {
          setActivePage(value);
          await handleFilterForms();
        }}
        total={Math.ceil(requestListCount / DEFAULT_REQUEST_LIST_LIMIT)}
        mt="xl"
      />
    </Container>
  );
};

export default RequestListPage;
