import { useActiveTeam } from "@/stores/useTeamStore";
import {
  BASE_URL,
  COLOR_SET_OPTIONS,
  DEFAULT_REQUEST_LIST_LIMIT,
  formatDate,
} from "@/utils/constant";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { getAvatarColor } from "@/utils/styling";
import { ModuleRequestList, TeamMemberWithUserType } from "@/utils/types";
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
import { FilterSelectedValuesType } from "./ModuleRequestListPage";

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
  setValue: UseFormSetValue<FilterSelectedValuesType>;
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
          render: ({
            request_id,
            module_request_formsly_id_prefix,
            module_request_formsly_id_serial,
          }) => {
            return (
              <Flex key={String(request_id)} justify="space-between">
                <Text truncate maw={150}>
                  <Anchor
                    href={`/${formatTeamNameToUrlKey(
                      activeTeam.team_name ?? ""
                    )}/module-request/${module_request_formsly_id_prefix}-${module_request_formsly_id_serial}/view`}
                    target="_blank"
                  >
                    {String(
                      `${module_request_formsly_id_prefix}-${module_request_formsly_id_serial}`
                    )}
                  </Anchor>
                </Text>
                <CopyButton
                  value={`${BASE_URL}/${formatTeamNameToUrlKey(
                    activeTeam.team_name ?? ""
                  )}/module-request/${module_request_formsly_id_prefix}-${module_request_formsly_id_serial}/view`}
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
          render: ({ module_request_date_created }) => (
            <Text>
              {formatDate(new Date(String(module_request_date_created)))}
            </Text>
          ),
        },
        {
          accessor: "form_name",
          title: "Form Name",
          sortable: true,
          hidden: checkIfColumnIsHidden("form_name"),
          render: (record) => {
            const { module_request_latest_form_name } = record;

            return (
              <Text truncate maw={150}>
                {String(module_request_latest_form_name)}
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
            const {
              module_request_latest_status,
              node_type_font_color,
              node_type_background_color,
            } = record;

            return (
              <Flex>
                <Badge
                  variant="filled"
                  color={
                    COLOR_SET_OPTIONS[
                      node_type_background_color as keyof typeof COLOR_SET_OPTIONS
                    ]
                  }
                  sx={{
                    root: {
                      color: node_type_font_color as string,
                    },
                  }}
                >
                  {String(module_request_latest_status)}
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
            } = request as {
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
            const { module_request_latest_approver } = record;
            return (
              <Flex px={0} gap={8} align="center">
                <Text>{String(module_request_latest_approver)}</Text>
              </Flex>
            );
          },
        },
        {
          accessor: "view",
          title: "View",
          hidden: checkIfColumnIsHidden("view"),
          textAlignment: "center",
          render: ({
            module_request_formsly_id_prefix,
            module_request_formsly_id_serial,
          }) => {
            return (
              <Flex justify="center">
                <ActionIcon
                  color="blue"
                  onClick={() => {
                    router.push(
                      `/${formatTeamNameToUrlKey(
                        activeTeam.team_name ?? ""
                      )}/module-request/${module_request_formsly_id_prefix}-${module_request_formsly_id_serial}/view`
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
