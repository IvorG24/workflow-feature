import { useActiveTeam } from "@/stores/useTeamStore";
import {
  BASE_URL,
  DEFAULT_REQUEST_LIST_LIMIT,
  formatDate,
} from "@/utils/constant";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { getAvatarColor } from "@/utils/styling";
import {
  ModuleRequestList,
  RequestListFilterValues,
  TeamMemberWithUserType,
} from "@/utils/types";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  CopyButton,
  createStyles,
  Flex,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconArrowsMaximize, IconCopy } from "@tabler/icons-react";
import { DataTableSortStatus } from "mantine-datatable";

import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect } from "react";
import { UseFormSetValue } from "react-hook-form";
import ListTable from "../ListTable/ListTable";

type Props = {
  moduleRequestList: ModuleRequestList[];
  requestListCount: number;
  teamMemberList: TeamMemberWithUserType[];
  activePage: number;
  isFetchingRequestList: boolean;
  selectedFormFilter: string[] | undefined;
  handlePagination: (p: number) => void;
  sortStatus: DataTableSortStatus;
  setSortStatus: Dispatch<SetStateAction<DataTableSortStatus>>;
  setValue: UseFormSetValue<RequestListFilterValues>;
  checkIfColumnIsHidden: (column: string) => boolean;
  showTableColumnFilter: boolean;
  setShowTableColumnFilter: Dispatch<SetStateAction<boolean>>;
  listTableColumnFilter: string[];
  setListTableColumnFilter: (
    val: string[] | ((prevState: string[]) => string[])
  ) => void;
  tableColumnList: { value: string; label: string }[];
};

const useStyles = createStyles(() => ({
  requestor: {
    border: "solid 2px white",
    cursor: "pointer",
  },
  clickable: {
    cursor: "pointer",
  },
}));

const defaultAvatarProps = { color: "blue", size: "sm", radius: "xl" };

const ModuleRequestListTable = ({
  moduleRequestList,
  requestListCount,
  activePage,
  isFetchingRequestList,
  handlePagination,
  sortStatus,
  setSortStatus,
  setValue,
  checkIfColumnIsHidden,
  showTableColumnFilter,
  setShowTableColumnFilter,
  listTableColumnFilter,
  setListTableColumnFilter,
  tableColumnList,
}: Props) => {
  const { classes } = useStyles();
  const router = useRouter();
  const activeTeam = useActiveTeam();
  //   const router = useRouter();
  useEffect(() => {
    setValue("isAscendingSort", sortStatus.direction === "asc" ? true : false);
    handlePagination(activePage);
  }, [sortStatus]);

  return (
    <ListTable
      idAccessor="request_id"
      records={moduleRequestList}
      fetching={isFetchingRequestList}
      page={activePage}
      onPageChange={(page) => {
        handlePagination(page);
      }}
      totalRecords={requestListCount}
      recordsPerPage={DEFAULT_REQUEST_LIST_LIMIT}
      sortStatus={sortStatus}
      onSortStatusChange={setSortStatus}
      columns={[
        {
          accessor: "request_id",
          title: "Module Request ID",
          width: 180,
          hidden: checkIfColumnIsHidden("request_id"),
          render: ({ request_id, module_request_id }) => {
            return (
              <Flex key={String(request_id)} justify="space-between">
                <Text truncate maw={150}>
                  <Anchor
                    href={`/${formatTeamNameToUrlKey(
                      activeTeam.team_name ?? ""
                    )}/module-request/${module_request_id}?requestId=${request_id}`}
                    target="_blank"
                  >
                    {String(module_request_id)}
                  </Anchor>
                </Text>
                <CopyButton
                  value={`${BASE_URL}/${formatTeamNameToUrlKey(
                    activeTeam.team_name ?? ""
                  )}/module-request/${request_id}`}
                >
                  {({ copied, copy }) => (
                    <Tooltip
                      label={copied ? "Copied" : `Copy ${request_id}`}
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
          accessor: "module_name",
          title: "Module Name",
          sortable: true,
          hidden: checkIfColumnIsHidden("module_name"),
          render: ({ module_name }) => {
            return (
              <Text truncate maw={150}>
                {String(module_name)}
              </Text>
            );
          },
        },
        {
          accessor: "date_created",
          title: "Date Created",
          hidden: checkIfColumnIsHidden("date_created"),
          sortable: true,
          render: ({ date_created }) => (
            <Text>{formatDate(new Date(String(date_created)))}</Text>
          ),
        },
        {
          accessor: "form_name",
          title: "Form Name",
          sortable: true,
          hidden: checkIfColumnIsHidden("form_name"),
          render: ({ form_name }) => {
            return (
              <Text truncate maw={150}>
                {String(form_name)}
              </Text>
            );
          },
        },
        {
          accessor: "request_status",
          title: "Request Status",
          sortable: true,
          hidden: checkIfColumnIsHidden("request_status"),
          render: (record) => {
            const { request_status, status_color, status_font_color } = record;

            return (
              <Flex>
                <Badge
                  variant="filled"
                  styles={{
                    root: {
                      background: status_color as string,
                      color: status_font_color as string,
                    },
                  }}
                >
                  {String(request_status)}
                </Badge>
              </Flex>
            );
          },
        },
        {
          accessor: "user_id",
          title: "Requested By",
          sortable: true,
          hidden: checkIfColumnIsHidden("request_team_member_id"),
          render: (request) => {
            const {
              user_id,
              user_first_name,
              user_last_name,
              request_team_member_id,
            } = request.created_by as {
              user_id: string;
              user_first_name: string;
              user_last_name: string;
              request_team_member_id: string;
            };

            return (
              <Flex px={0} gap={8} align="center">
                <Avatar
                  // src={requestor.user_avatar}
                  {...defaultAvatarProps}
                  color={getAvatarColor(Number(`${user_id.charCodeAt(0)}`))}
                  className={classes.requestor}
                  onClick={() =>
                    window.open(`/member/${request_team_member_id}`)
                  }
                >
                  {user_first_name[0] + user_last_name[0]}
                </Avatar>
                <Anchor
                  href={`/member/${request_team_member_id}`}
                  target="_blank"
                >
                  <Text>{`${user_first_name} ${user_last_name}`}</Text>
                </Anchor>
              </Flex>
            );
          },
        },
        {
          accessor: "approved_by",
          title: "Approver",
          sortable: true,
          hidden: checkIfColumnIsHidden("approved_by"),
          render: (record) => {
            return (
              <Flex px={0} gap={8} align="center">
                <Text>{String(record.approver)}</Text>
              </Flex>
            );
          },
        },
        {
          accessor: "view",
          title: "View",
          hidden: checkIfColumnIsHidden("view"),
          textAlignment: "center",
          render: ({ module_request_id }) => {
            return (
              <Flex justify="center">
                <ActionIcon
                  color="blue"
                  onClick={() => {
                    router.push(
                      `/${formatTeamNameToUrlKey(
                        activeTeam.team_name ?? ""
                      )}/module-request/${module_request_id}/view`
                    );
                  }}
                >
                  <IconArrowsMaximize size={16} />
                </ActionIcon>
              </Flex>
            );
          },
        },
      ]}
      showTableColumnFilter={showTableColumnFilter}
      setShowTableColumnFilter={setShowTableColumnFilter}
      listTableColumnFilter={listTableColumnFilter}
      setListTableColumnFilter={setListTableColumnFilter}
      tableColumnList={tableColumnList}
    />
  );
};

export default ModuleRequestListTable;
