import { useFormList } from "@/stores/useFormStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { DEFAULT_REQUEST_LIST_LIMIT, formatDate } from "@/utils/constant";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  getAvatarColor,
  getJiraTicketStatusColor,
  getStatusToColor,
} from "@/utils/styling";
import {
  RequestListItemSignerType,
  RequestListItemType,
  TeamMemberWithUserType,
} from "@/utils/types";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Box,
  CopyButton,
  Flex,
  Loader,
  Text,
  Tooltip,
  createStyles,
} from "@mantine/core";
import { IconArrowsMaximize, IconCopy } from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import router from "next/router";
import { useEffect, useState } from "react";
import RequestSignerList from "./RequestSignerList";

type Props = {
  requestList: RequestListItemType[];
  requestListCount: number;
  teamMemberList: TeamMemberWithUserType[];
  activePage: number;
  isFetchingRequestList: boolean;
  handlePagination: (p: number) => void;
  checkIfColumnIsHidden: (column: string) => boolean;
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

const RequestListTable = ({
  requestList,
  requestListCount,
  teamMemberList,
  activePage,
  isFetchingRequestList,
  handlePagination,
  checkIfColumnIsHidden,
}: Props) => {
  const { classes } = useStyles();
  const activeTeam = useActiveTeam();
  const formList = useFormList();

  const [jiraTicketStatusList, setJiraTicketStatusList] = useState<
    { jira_id: string; status: string }[]
  >([]);
  const [isFetchingJiraTicketStatus, setIsFetchingJiraTicketStatus] =
    useState(false);

  useEffect(() => {
    const fetchJiraTicketStatus = async (
      requestList: RequestListItemType[]
    ) => {
      try {
        const currentJiraTicketStatusList = jiraTicketStatusList;
        const jiraStatusColumnIsHidden = checkIfColumnIsHidden(
          "request_jira_status"
        );
        const requestListIsAlreadyFetched = currentJiraTicketStatusList.find(
          (status) => status.jira_id === requestList[0].request_jira_id
        );

        // does not fetch if jira status column is hidden by user
        // does not fetch if request list has been fetched
        if (jiraStatusColumnIsHidden || requestListIsAlreadyFetched) return;

        setIsFetchingJiraTicketStatus(true);
        const newJiraTicketStatusList = await Promise.all(
          requestList.map(async (request) => {
            let jiraStatus = { jira_id: "", status: "" };
            if (request.request_jira_id) {
              const requestJiraTicketData = await fetch(
                `/api/get-jira-ticket?jiraTicketKey=${request.request_jira_id}`
              );
              if (!requestJiraTicketData.ok) {
                jiraStatus = {
                  jira_id: request.request_jira_id,
                  status: "Ticket Not Found",
                };
              } else {
                const jiraTicket = await requestJiraTicketData.json();
                const jiraTicketStatus =
                  jiraTicket.fields["customfield_10010"].currentStatus.status;
                jiraStatus = {
                  jira_id: request.request_jira_id,
                  status: jiraTicketStatus,
                };
              }
            }

            return jiraStatus;
          })
        );

        const updatedJiraTicketStatusList = [
          ...currentJiraTicketStatusList,
          ...newJiraTicketStatusList,
        ];
        setJiraTicketStatusList(updatedJiraTicketStatusList);
      } catch (error) {
        console.error(error);
      } finally {
        setIsFetchingJiraTicketStatus(false);
      }
    };

    fetchJiraTicketStatus(requestList);
  }, [requestList]);

  return (
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
          width: 180,
          hidden: checkIfColumnIsHidden("request_id"),
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
          width: 180,
          hidden: checkIfColumnIsHidden("request_jira_id"),
          render: ({ request_jira_id, request_jira_link }) => {
            return (
              <Flex justify="space-between" key={request_jira_id}>
                <Text>
                  <Anchor href={request_jira_link} target="_blank">
                    {request_jira_id}
                  </Anchor>
                </Text>
                {request_jira_id && (
                  <CopyButton value={request_jira_id}>
                    {({ copied, copy }) => (
                      <Tooltip
                        label={copied ? "Copied" : `Copy ${request_jira_id}`}
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
          accessor: "request_id_status",
          title: "JIRA Status",
          hidden: checkIfColumnIsHidden("request_jira_status"),
          render: ({ request_jira_id }) => {
            const jiraStatusMatch = jiraTicketStatusList.find(
              (status) => status.jira_id === request_jira_id
            );

            return (
              <Box>
                {isFetchingJiraTicketStatus && <Loader size={16} />}
                {!isFetchingJiraTicketStatus && jiraStatusMatch ? (
                  <Badge
                    key={request_jira_id}
                    color={getJiraTicketStatusColor(
                      jiraStatusMatch.status.toLowerCase()
                    )}
                  >
                    {jiraStatusMatch.status}
                  </Badge>
                ) : (
                  <></>
                )}
              </Box>
            );
          },
        },
        {
          accessor: "request_otp_id",
          title: "OTP ID",
          hidden: checkIfColumnIsHidden("request_otp_id"),
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
        {
          accessor: "request_form_id",
          title: "Form Name",
          hidden: checkIfColumnIsHidden("request_form_name"),
          render: ({ request_form_id }) => {
            const formMatch = formList.find(
              (form) => form.form_id === request_form_id
            );
            return (
              <Text truncate maw={150}>
                {formMatch?.form_name}
              </Text>
            );
          },
        },
        {
          accessor: "request_status",
          title: "Formsly Status",
          hidden: checkIfColumnIsHidden("request_status"),
          render: ({ request_status }) => (
            <Badge variant="filled" color={getStatusToColor(request_status)}>
              {request_status}
            </Badge>
          ),
        },
        {
          accessor: "request_team_member_id",
          title: "Requested By",
          hidden: checkIfColumnIsHidden("request_team_member_id"),
          render: ({ request_team_member_id }) => {
            const requestor = teamMemberList.find(
              (member) => member.team_member_id === request_team_member_id
            );

            const requestorUserData = requestor
              ? requestor.team_member_user
              : null;

            return requestorUserData ? (
              <Flex px={0} gap={8} wrap="wrap">
                <Avatar
                  // src={requestor.user_avatar}
                  {...defaultAvatarProps}
                  color={getAvatarColor(
                    Number(`${requestorUserData.user_id.charCodeAt(0)}`)
                  )}
                  className={classes.requestor}
                  onClick={() =>
                    window.open(`/member/${request_team_member_id}`)
                  }
                >
                  {requestorUserData.user_first_name[0] +
                    requestorUserData.user_last_name[0]}
                </Avatar>
                <Anchor
                  href={`/member/${request_team_member_id}`}
                  target="_blank"
                >
                  <Text>{`${requestorUserData?.user_first_name} ${requestorUserData?.user_last_name}`}</Text>
                </Anchor>
              </Flex>
            ) : (
              <></>
            );
          },
        },
        {
          accessor: "request_signer",
          title: "Approver",
          hidden: checkIfColumnIsHidden("request_signer"),
          render: ({ request_signer }) => {
            const signerList = request_signer.map((signer) => {
              const signerTeamMemberData = teamMemberList.find(
                (member) =>
                  member.team_member_id ===
                  signer.request_signer.signer_team_member_id
              );

              return {
                ...signer,
                signer_team_member_user: signerTeamMemberData?.team_member_user,
              };
            });

            return (
              <RequestSignerList
                signerList={signerList as RequestListItemSignerType[]}
              />
            );
          },
        },

        {
          accessor: "request_date_created",
          title: "Date Created",
          width: 120,
          hidden: checkIfColumnIsHidden("request_date_created"),
          render: ({ request_date_created }) => (
            <Text>{formatDate(new Date(request_date_created))}</Text>
          ),
        },
        {
          accessor: "view",
          title: "View",
          textAlignment: "center",
          hidden: checkIfColumnIsHidden("view"),
          render: ({ request_id, request_formsly_id }) => {
            const requestId =
              request_formsly_id === "-" ? request_id : request_formsly_id;
            return (
              <ActionIcon
                maw={120}
                mx="auto"
                color="blue"
                onClick={() =>
                  router.push(
                    `/${formatTeamNameToUrlKey(
                      activeTeam.team_name ?? ""
                    )}/requests/${requestId}`
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
  );
};

export default RequestListTable;
