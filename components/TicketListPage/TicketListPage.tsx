import { getTicketList } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { DEFAULT_TICKET_LIST_LIMIT } from "@/utils/constant";
import { Database } from "@/utils/database";
import {
  TeamMemberWithUserType,
  TicketListType,
  TicketStatusType,
} from "@/utils/types";
import {
  Alert,
  Box,
  Container,
  Divider,
  Flex,
  Grid,
  Loader,
  LoadingOverlay,
  Pagination,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconAlertCircle } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import TicketListFilter from "./TicketListFilter";
import TicketListItem from "./TicketListItem";

export type FilterFormValues = {
  search: string;
  requesterList: string[];
  approverList: string[];
  categoryList: string[];
  status: string[];
  isAscendingSort: boolean;
};

type Props = {
  ticketList: TicketListType;
  ticketListCount: number;
  teamMemberList: TeamMemberWithUserType[];
};

const TEMP_DEFAULT_TICKET_LIST_LIMIT = 13;
export const TEMP_DEFAULT_TICKET_CATEGORY_LIST = [
  "Item Request",
  "General",
  "Feature Request",
];

const TicketListPage = ({
  ticketList: inititalTicketList,
  ticketListCount: inititalTicketListCount,
  teamMemberList,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const activeTeam = useActiveTeam();
  const [activePage, setActivePage] = useState(1);
  const [isFetchingTicketList, setIsFetchingTicketList] = useState(false);
  const [ticketList, setTicketList] =
    useState<TicketListType>(inititalTicketList);
  const [ticketListCount, setTicketListCount] = useState(
    inititalTicketListCount
  );
  const filterFormMethods = useForm<FilterFormValues>({
    defaultValues: {
      search: "",
      requesterList: [],
      approverList: [],
      categoryList: [],
      status: [],
      isAscendingSort: false,
    },
    mode: "onChange",
  });

  const { handleSubmit, getValues } = filterFormMethods;

  const handleFilterTicketList = async (
    {
      search,
      requesterList,
      approverList,
      categoryList,
      status,
      isAscendingSort,
    }: FilterFormValues = getValues()
  ) => {
    try {
      setIsFetchingTicketList(true);
      if (!activeTeam.team_id) {
        console.warn(
          "RequestListPage handleFilterFormsError: active team_id not found"
        );
        return;
      }
      setActivePage(1);
      const params = {
        teamId: activeTeam.team_id,
        page: 1,
        limit: DEFAULT_TICKET_LIST_LIMIT,
        requester:
          requesterList && requesterList.length > 0 ? requesterList : undefined,
        approver:
          approverList && approverList.length > 0 ? approverList : undefined,
        category:
          categoryList && categoryList.length > 0 ? categoryList : undefined,
        status:
          status && status.length > 0
            ? (status as TicketStatusType[])
            : undefined,
        search: search,
        sort: isAscendingSort
          ? "ascending"
          : ("descending" as "ascending" | "descending"),
      };

      const { data, count } = await getTicketList(supabaseClient, params);

      setTicketList(data);
      setTicketListCount(count || 0);
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingTicketList(false);
    }
  };

  const handlePagination = async () => {
    try {
      setIsFetchingTicketList(true);
      if (!activeTeam.team_id) return;

      const {
        search,
        requesterList,
        categoryList,
        approverList,
        status,
        isAscendingSort,
      } = getValues();

      const params = {
        teamId: activeTeam.team_id,
        page: activePage,
        limit: DEFAULT_TICKET_LIST_LIMIT,
        requester:
          requesterList && requesterList.length > 0 ? requesterList : undefined,
        approver:
          approverList && approverList.length > 0 ? approverList : undefined,
        category:
          categoryList && categoryList.length > 0 ? categoryList : undefined,
        status:
          status && status.length > 0
            ? (status as TicketStatusType[])
            : undefined,
        search: search,
        sort: isAscendingSort
          ? "ascending"
          : ("descending" as "ascending" | "descending"),
      };

      const { data, count } = await getTicketList(supabaseClient, params);
      setTicketList(data);
      setTicketListCount(count || 0);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingTicketList(false);
    }
  };

  useEffect(() => {
    handlePagination();
  }, [activePage]);

  return (
    <Container maw={1300} h="100%">
      <Flex align="center" gap="xl" wrap="wrap">
        <Box>
          <Title order={4}>Ticket List Page</Title>
          <Text> Manage your team requests here.</Text>
        </Box>
      </Flex>
      <Box my="sm">
        <FormProvider {...filterFormMethods}>
          <form onSubmit={handleSubmit(handleFilterTicketList)}>
            <TicketListFilter
              categoryList={TEMP_DEFAULT_TICKET_CATEGORY_LIST}
              handleFilterTicketList={handleFilterTicketList}
              teamMemberList={teamMemberList}
            />
          </form>
        </FormProvider>
      </Box>
      <Box h="fit-content" pos="relative">
        <LoadingOverlay
          visible={isFetchingTicketList}
          overlayBlur={0}
          overlayOpacity={0.2}
          loader={<Loader variant="dots" />}
        />
        {ticketList.length > 0 ? (
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
                      <Text weight={600}>Ticket ID</Text>
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <Text weight={600}>Title</Text>
                    </Grid.Col>
                    <Grid.Col span="auto">
                      <Text weight={600}>Category</Text>
                    </Grid.Col>
                    <Grid.Col span={1}>
                      <Text weight={600}>Status</Text>
                    </Grid.Col>

                    <Grid.Col span="auto" offset={0.5}>
                      <Text weight={600} pl={8}>
                        Requester
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
                {ticketList.map((ticket, idx) => (
                  <Box key={ticket.ticket_id}>
                    <TicketListItem ticket={ticket} />
                    {idx + 1 < TEMP_DEFAULT_TICKET_LIST_LIMIT ? (
                      <Divider />
                    ) : null}
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
              No tickets found.
            </Alert>
          </Text>
        )}
      </Box>

      <Flex justify="flex-end">
        <Pagination
          value={activePage}
          onChange={setActivePage}
          total={Math.ceil(ticketListCount / TEMP_DEFAULT_TICKET_LIST_LIMIT)}
          mt="xl"
        />
      </Flex>
    </Container>
  );
};

export default TicketListPage;
