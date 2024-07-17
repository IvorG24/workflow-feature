import { getTicketList } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import {
  DEFAULT_REQUEST_LIST_LIMIT,
  DEFAULT_TICKET_LIST_LIMIT,
  formatDate,
} from "@/utils/constant";
import { Database } from "@/utils/database";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  TeamMemberWithUserType,
  TicketCategoryTableRow,
  TicketListType,
  TicketStatusType,
} from "@/utils/types";
import {
  ActionIcon,
  Alert,
  Anchor,
  Box,
  Button,
  Container,
  CopyButton,
  Flex,
  Loader,
  LoadingOverlay,
  Paper,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import {
  IconAlertCircle,
  IconArrowsMaximize,
  IconCopy,
  IconReportAnalytics,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import ListTable from "../ListTable/ListTable";
import TicketListFilter from "./TicketListFilter";

export type FilterFormValues = {
  search: string;
  requesterList: string[];
  approverList: string[];
  categoryList: string[];
  status?: string[];
  isAscendingSort: boolean;
};

export type TicketListLocalFilter = {
  search: string;
  requesterList: string[];
  approverList: string[];
  categoryList: string[];
  status: string[] | undefined;
  isAscendingSort: boolean;
};

type Props = {
  ticketList: TicketListType;
  ticketListCount: number;
  teamMemberList: TeamMemberWithUserType[];
  ticketCategoryList: TicketCategoryTableRow[];
};

const TicketListPage = ({
  ticketList: inititalTicketList,
  ticketListCount: inititalTicketListCount,
  teamMemberList,
  ticketCategoryList,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const activeTeam = useActiveTeam();
  const teamMember = useUserTeamMember();
  const router = useRouter();
  const [activePage, setActivePage] = useState(1);
  const [isFetchingTicketList, setIsFetchingTicketList] = useState(false);
  const [ticketList, setTicketList] =
    useState<TicketListType>(inititalTicketList);
  const [ticketListCount, setTicketListCount] = useState(
    inititalTicketListCount
  );
  const [localFilter, setLocalFilter] = useLocalStorage<TicketListLocalFilter>({
    key: "formsly-ticket-list-filter",
    defaultValue: {
      search: "",
      categoryList: [],
      requesterList: [],
      status: undefined,
      approverList: [],
      isAscendingSort: false,
    },
  });

  const filterFormMethods = useForm<FilterFormValues>({
    defaultValues: localFilter,
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
  }, [activePage, localFilter]);

  useEffect(() => {
    const localStorageFilter = localStorage.getItem(
      "formsly-ticket-list-filter"
    );
    if (localStorageFilter) {
      handleFilterTicketList(localFilter);
    }
  }, [activeTeam.team_id, teamMember, localFilter]);

  return (
    <Container maw={3840} h="100%">
      <Flex align="center" gap="xl" wrap="wrap" pb="sm">
        <Box>
          <Title order={4}>Ticket List Page</Title>
          <Text> Manage your team requests here.</Text>
        </Box>

        {["ADMIN", "OWNER"].includes(teamMember?.team_member_role ?? "") && (
          <Button
            leftIcon={<IconReportAnalytics size={16} />}
            variant="light"
            onClick={async () =>
              await router.push(
                `/${formatTeamNameToUrlKey(
                  activeTeam.team_name ?? ""
                )}/tickets/admin-analytics`
              )
            }
          >
            Ticket Admin Analytics
          </Button>
        )}
      </Flex>
      <Paper p="md">
        <Box my="sm">
          <FormProvider {...filterFormMethods}>
            <form onSubmit={handleSubmit(handleFilterTicketList)}>
              <TicketListFilter
                ticketCategoryList={ticketCategoryList}
                handleFilterTicketList={handleFilterTicketList}
                teamMemberList={teamMemberList}
                localFilter={localFilter}
                setLocalFilter={setLocalFilter}
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
            <>
              <ListTable
                idAccessor="ticket_id"
                records={ticketList}
                fetching={isFetchingTicketList}
                page={activePage}
                onPageChange={setActivePage}
                totalRecords={ticketListCount}
                recordsPerPage={DEFAULT_REQUEST_LIST_LIMIT}
                columns={[
                  {
                    accessor: "ticket_id",
                    title: "ID",
                    width: 180,
                    render: (ticket) => {
                      return (
                        <Flex gap="md" align="center">
                          <Text size="xs" truncate maw={150}>
                            <Anchor
                              href={`/${formatTeamNameToUrlKey(
                                activeTeam.team_name ?? ""
                              )}/tickets/${ticket.ticket_id}`}
                              target="_blank"
                              color="black"
                            >
                              {String(ticket.ticket_id)}
                            </Anchor>
                          </Text>

                          <CopyButton value={String(ticket.ticket_id)}>
                            {({ copied, copy }) => (
                              <Tooltip
                                label={
                                  copied ? "Copied" : `Copy ${ticket.ticket_id}`
                                }
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
                    accessor: "ticket_category",
                    title: "Ticket Category",
                    width: 180,
                  },
                  {
                    accessor: "ticket_status",
                    title: "Status",
                    width: 180,
                  },
                  {
                    accessor: "ticket_requester_team_member_id",
                    title: "Requester",
                    width: 180,
                    render: (ticket) => {
                      const { ticket_requester } = ticket as {
                        ticket_requester: {
                          user_avatar: string | null;
                          user_last_name: string;
                          user_first_name: string;
                          user_id: string;
                        };
                      };
                      const { user_last_name, user_first_name } =
                        ticket_requester;

                      return (
                        <Text>{`${user_first_name} ${user_last_name}`}</Text>
                      );
                    },
                  },
                  {
                    accessor: "ticket_approver_team_member_id",
                    title: "Approver",
                    width: 180,
                    render: (ticket) => {
                      const { ticket_approver } = ticket as {
                        ticket_approver: {
                          user_avatar: string | null;
                          user_last_name: string;
                          user_first_name: string;
                          user_id: string;
                        };
                      };
                      const { user_first_name, user_last_name } =
                        ticket_approver;

                      return (
                        <Text>{`${user_first_name} ${user_last_name}`}</Text>
                      );
                    },
                  },
                  {
                    accessor: "ticket_date_created",
                    title: "Date Created",
                    width: 180,
                    render: (ticket) => {
                      if (!ticket.ticket_date_created) {
                        return null;
                      }

                      return (
                        <Text>
                          {formatDate(
                            new Date(String(ticket.ticket_date_created))
                          )}
                        </Text>
                      );
                    },
                  },
                  {
                    accessor: "ticket_status_date_updated",
                    title: "Date Updated",
                    width: 180,
                    render: (ticket) => {
                      if (!ticket.ticket_status_date_updated) {
                        return null;
                      }

                      return (
                        <Text>
                          {formatDate(
                            new Date(String(ticket.ticket_status_date_updated))
                          )}
                        </Text>
                      );
                    },
                  },
                  {
                    accessor: "ticket_id" + "ticket_date_created",
                    title: "View",
                    width: 180,
                    render: (ticket) => {
                      const activeTeamNameToUrlKey = formatTeamNameToUrlKey(
                        activeTeam.team_name ?? ""
                      );
                      return (
                        <ActionIcon
                          color="gray"
                          onClick={() =>
                            router.push(
                              `/${activeTeamNameToUrlKey}/tickets/${ticket.ticket_id}`
                            )
                          }
                        >
                          <IconArrowsMaximize size={16} />
                        </ActionIcon>
                      );
                    },
                  },
                ]}
              />
            </>
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
      </Paper>
    </Container>
  );
};

export default TicketListPage;
