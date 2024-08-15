import { useActiveTeam } from "@/stores/useTeamStore";
import {
  BASE_URL,
  DEFAULT_REQUEST_LIST_LIMIT,
  formatDate,
} from "@/utils/constant";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { getStatusToColor } from "@/utils/styling";
import {
  RequestListFilterValues,
  RequestListItemSignerType,
  RequestListItemType,
} from "@/utils/types";
import {
  ActionIcon,
  Anchor,
  Badge,
  CopyButton,
  Flex,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconArrowsMaximize, IconCopy } from "@tabler/icons-react";
import { DataTableSortStatus } from "mantine-datatable";
import router from "next/router";
import { Dispatch, SetStateAction, useEffect } from "react";
import { UseFormSetValue } from "react-hook-form";
import ListTable from "../ListTable/ListTable";
import RequestSignerList from "../RequestListPage/RequestSignerList";

type Props = {
  requestList: RequestListItemType[];
  requestListCount: number;
  activePage: number;
  isFetchingRequestList: boolean;
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

const UserRequestListTable = ({
  requestList,
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
  const activeTeam = useActiveTeam();

  useEffect(() => {
    setValue("isAscendingSort", sortStatus.direction === "asc" ? true : false);
    handlePagination(activePage);
  }, [sortStatus]);

  return (
    <ListTable
      idAccessor="request_id"
      records={requestList}
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
          title: "Request ID",
          width: 180,
          hidden: checkIfColumnIsHidden("request_id"),
          render: ({ request_id, request_formsly_id }) => {
            const requestId =
              request_formsly_id === "-" ? request_id : request_formsly_id;

            return (
              <Flex key={String(requestId)} justify="space-between">
                <Text truncate maw={150}>
                  <Anchor
                    href={`/${formatTeamNameToUrlKey(
                      activeTeam.team_name ?? ""
                    )}/requests/${requestId}`}
                    target="_blank"
                  >
                    {String(requestId)}
                  </Anchor>
                </Text>
                <CopyButton
                  value={`${BASE_URL}/${formatTeamNameToUrlKey(
                    activeTeam.team_name ?? ""
                  )}/requests/${requestId}`}
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
          accessor: "form_name",
          title: "Form Name",
          sortable: true,
          hidden: checkIfColumnIsHidden("request_form_name"),
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
          title: "Formsly Status",
          sortable: true,
          hidden: checkIfColumnIsHidden("request_status"),
          render: ({ request_status }) => (
            <Flex justify="center">
              <Badge
                variant="filled"
                color={getStatusToColor(String(request_status))}
              >
                {String(request_status)}
              </Badge>
            </Flex>
          ),
        },
        {
          accessor: "request_signer",
          title: "Approver",
          hidden: checkIfColumnIsHidden("request_signer"),
          render: (request) => {
            const { request_signer } = request as {
              request_signer: RequestListItemSignerType[];
            };

            return <RequestSignerList signerList={request_signer} />;
          },
        },

        {
          accessor: "request_date_created",
          title: "Date Created",
          hidden: checkIfColumnIsHidden("request_date_created"),
          sortable: true,
          render: ({ request_date_created }) => (
            <Text>{formatDate(new Date(String(request_date_created)))}</Text>
          ),
        },
        {
          accessor: "view",
          title: "View",
          hidden: checkIfColumnIsHidden("view"),
          textAlignment: "center",
          render: ({ request_id, request_formsly_id }) => {
            const requestId =
              request_formsly_id === "-" ? request_id : request_formsly_id;
            return (
              <ActionIcon
                maw={120}
                mx="auto"
                color="blue"
                onClick={async () =>
                  await router.push(`/user/requests/${requestId}`)
                }
              >
                <IconArrowsMaximize size={16} />
              </ActionIcon>
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

export default UserRequestListTable;
