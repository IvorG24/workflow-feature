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
import { getAvatarColor } from "@/utils/styling";
import {
  TeamMemberWithUserType,
  TicketApproverUserType,
  TicketCategoryTableRow,
  TicketListType,
  TicketRequesterUserType,
  TicketStatusType,
} from "@/utils/types";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  CopyButton,
  Flex,
  Paper,
  Text,
  Title,
  Tooltip
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import {
  IconArrowsMaximize,
  IconCopy,
  IconReportAnalytics,
} from "@tabler/icons-react";
import { DataTableSortStatus } from "mantine-datatable";
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
  columnAccessor: string
};

type Props = {
  ticketList: TicketListType;
  ticketListCount: number;
  teamMemberList: TeamMemberWithUserType[];
  ticketCategoryList: TicketCategoryTableRow[];
};

const getTicketStatusColor = (status: string) => {
  switch (status) {
    case "CLOSED":
      return "green";

    case "PENDING":
      return "blue";

    case "INCORRECT":
      return "red";

    case "UNDER REVIEW":
      return "orange";

    default:
      break;
  }
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
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "ticket_date_created",
    direction: "desc",
  });

  const [localFilter, setLocalFilter] = useState<TicketListLocalFilter>({
      search: "",
      categoryList: [],
      requesterList: [],
      status: undefined,
      approverList: [],
      isAscendingSort: false,
      columnAccessor: 'ticket_date_created'
  });

  const filterFormMethods = useForm<FilterFormValues>({
    defaultValues: {
      search: "",
      categoryList: [],
      requesterList: [],
      status: undefined,
      approverList: [],
      isAscendingSort: false,
  },
    mode: "onChange",
  });

  const { handleSubmit, getValues, setValue } = filterFormMethods;

  const defaultAvatarProps = { color: "blue", size: "sm", radius: "xl" };

  // this function will return a valid postgress for sort by
  const columnAccessor = () => {
    // requester
    if (sortStatus.columnAccessor === "ticket_requester_team_member_id") {
      return `(ticket_requester_user->>'user_first_name') || ' ' || (ticket_requester_user->>'user_last_name')`;
    }
    return sortStatus.columnAccessor;
  };

  // this function will handle pagination and filteration
  const handlePagination = async ({ overidePage }: { overidePage?: number  } = {}) => {
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
        page: overidePage !== undefined ? overidePage : activePage || 1,
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
        columnAccessor: columnAccessor()
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

  // soroting
  useEffect(() => {
    setValue("isAscendingSort", sortStatus.direction === "asc" ? true : false)
    setLocalFilter((prev) => {
      return {...prev, isAscendingSort: sortStatus.direction === "asc" ? false : true}
    })

    handlePagination()
  }, [sortStatus]);



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
            <form onSubmit={handleSubmit(() => {
              handlePagination({overidePage: 1})
            })}>
              <TicketListFilter
                ticketCategoryList={ticketCategoryList}
                handleFilterTicketList={handlePagination}
                teamMemberList={teamMemberList}
                localFilter={localFilter}
                setLocalFilter={setLocalFilter}
              />
            </form>
          </FormProvider>
        </Box>
        <Box h="fit-content" pos="relative">
          <ListTable
            idAccessor="ticket_id"
            records={ticketList}
            fetching={isFetchingTicketList}
            page={activePage}
            onPageChange={(page) => {
              setActivePage(page)
              handlePagination({overidePage: page});
            }}
            totalRecords={ticketListCount}
            recordsPerPage={DEFAULT_REQUEST_LIST_LIMIT}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
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
                          color="blue"
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
                sortable: true,
              },
              {
                accessor: "ticket_status",
                title: "Status",
                sortable: true,
                render: (ticket) => {
                  const {ticket_status} = ticket as {ticket_status: string}
                  return (
                    <Flex justify="center">
                      <Badge
                        variant="filled"
                        color={getTicketStatusColor(ticket_status)}
                      >
                        {ticket_status}
                      </Badge>
                    </Flex>
                  )
                }
              },
              {
                accessor: "ticket_requester_team_member_id",
                title: "Requester",
                sortable: true,
                render: (ticket) => {
                  const { ticket_requester_user } = ticket;
                  const { user_first_name, user_last_name, user_avatar, user_id } =
                    ticket_requester_user as TicketApproverUserType;

                    
                  return (
                    <Flex px={0} gap={8} wrap="wrap" align='center'>
                      <Avatar
                            {...defaultAvatarProps}
                            color={getAvatarColor(
                              Number(`${user_id.charCodeAt(0)}`)
                            )}
                            src={user_avatar}
                        >
                        {(
                          user_first_name[0] + user_last_name[0]
                        ).toUpperCase()}
                      </Avatar>
                      <Anchor
                        href={`/member/${ticket.ticket_requester_team_member_id}`}
                        target="_blank"
                      >
                        <Text >{`${user_first_name} ${user_last_name}`} dd</Text>
                      </Anchor>
                    </Flex>
                  )
                },
              },
              {
                accessor: "ticket_approver_team_member_id",
                title: "Approver",
                render: (ticket) => {
                  const { ticket_approver_user, ticket_status } = ticket as {ticket_status: string, ticket_approver_user: TicketRequesterUserType};
                  const { user_first_name, user_last_name, user_id, user_avatar } = ticket_approver_user ;

                  if (user_first_name === null || user_last_name === null || ticket_status === null) {
                    return null;
                  }
                  
                  return (
                    <Flex px={0} gap={8} wrap="wrap">
                      <Avatar
                            {...defaultAvatarProps}
                            color={getAvatarColor(
                              Number(`${user_id.charCodeAt(0)}`)
                            )}
                            src={user_avatar}
                        >
                        {(
                          user_first_name[0] + user_last_name[0]
                        ).toUpperCase()}
                      </Avatar>
                      <Anchor
                        href={`/member/${ticket.ticket_approver_team_member_id}`}
                        target="_blank"
                      >
                        <Text >{`${user_first_name} ${user_last_name}`} dd</Text>
                      </Anchor>
                  </Flex>
                  )
                },
              },
              {
                accessor: "ticket_date_created",
                title: "Date Created",
                sortable: true,
                render: (ticket) => {
                  if (!ticket.ticket_date_created) {
                    return null;
                  }

                  return (
                    <Flex justify="center">
                      <Text>
                        {formatDate(new Date(String(ticket.ticket_date_created)))}
                      </Text>
                    </Flex>
                  );
                },
              },
              {
                accessor: "ticket_status_date_updated",
                title: "Date Updated",
                sortable: true,
                render: (ticket) => {
                  if (!ticket.ticket_status_date_updated) {
                    return null;
                  }

                  return (
                    <Flex justify="center">
                      <Text>
                        {formatDate(
                          new Date(String(ticket.ticket_status_date_updated))
                        )}
                      </Text>
                    </Flex>
                  );
                },
              },
              {
                accessor: "ticket_id" + "ticket_status_date_updated",
                title: "View",
                render: (ticket) => {
                  const activeTeamNameToUrlKey = formatTeamNameToUrlKey(
                    activeTeam.team_name ?? ""
                  );
                  return (
                    <Flex justify="center">
                      <ActionIcon
                        color="blue"
                        onClick={() =>
                          router.push(
                            `/${activeTeamNameToUrlKey}/tickets/${ticket.ticket_id}`
                          )
                        }
                      >
                        <IconArrowsMaximize size={16} />
                      </ActionIcon>
                    </Flex >
                  );
                },
              },
            ]}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default TicketListPage;
