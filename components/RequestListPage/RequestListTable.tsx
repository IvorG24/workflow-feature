import {
  getFieldResponseByRequestId,
  getRequestTypeFieldResponse,
} from "@/backend/api/get";
import { useFormList } from "@/stores/useFormStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import {
  BASE_URL,
  DEFAULT_REQUEST_LIST_LIMIT,
  formatDate,
} from "@/utils/constant";
import { safeParse } from "@/utils/functions";
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
  Group,
  Loader,
  Menu,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
  createStyles,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
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
  selectedFormFilter: string[] | undefined;
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
  selectedFormFilter,
}: Props) => {
  const { classes } = useStyles();
  const activeTeam = useActiveTeam();
  const formList = useFormList();
  const supabaseClient = createPagesBrowserClient();

  const [jiraTicketStatusList, setJiraTicketStatusList] = useState<
    { jira_id: string; status: string }[]
  >([]);
  const [pedEquipmentNumberList, setPedEquipmentNumberList] = useLocalStorage<
    { request_id: string; equipment_number: string[] }[]
  >({
    key: "formsly-ped-equipment-number-list",
    defaultValue: [],
  });
  const [isFetchingJiraTicketStatus, setIsFetchingJiraTicketStatus] =
    useState(false);
  const [
    isFetchingPedEquipmentNumberList,
    setIsFetchingPedEquipmentNumberList,
  ] = useState(false);

  const selectedFormList = selectedFormFilter
    ? formList.filter((form) => selectedFormFilter.includes(form.form_id))
    : undefined;
  const isPEDForm = selectedFormList
    ? selectedFormList.some((form) => form.form_name.includes("PED"))
    : undefined;

  const getPedRequestTypeId = (formName: string) => {
    switch (formName) {
      case "PED Item":
        return "20d9159a-c410-4e4b-8c21-c02e44d8f1e9";
      case "PED Part":
        return "fec1de43-c4bc-4c0d-9f6d-41f8146b14a5";
      default:
        return "";
    }
  };

  const getPedEquipmentNumberFieldId = (formName: string) => {
    switch (formName) {
      case "PED Item":
        return "53df2b33-9d35-4a15-b13d-431940738c68";
      case "PED Part":
        return "e35835b4-c107-4710-86d5-11b6059e221c";

      default:
        return "";
    }
  };

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
                `/api/jira/get-ticket?jiraTicketKey=${request.request_jira_id}`
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

  useEffect(() => {
    const fetchPedEquipmentNumberList = async (
      requestList: RequestListItemType[]
    ) => {
      try {
        if (!selectedFormFilter || requestList.length <= 0) return;
        const requestListIsAlreadyFetched = pedEquipmentNumberList.find(
          (ped) => ped.request_id === requestList[0].request_id
        );
        // does not fetch if filter is not ped
        // does not fetch if request list has been fetched
        if (!selectedFormList || !isPEDForm || requestListIsAlreadyFetched)
          return;

        const requestTypeIdList = selectedFormList.map((form) => ({
          formId: form.form_id,
          requestTypeId: getPedRequestTypeId(form.form_name),
        }));

        const pedEquipmentFieldIdList = selectedFormList.map((form) => ({
          formId: form.form_id,
          requestTypeId: getPedEquipmentNumberFieldId(form.form_name),
        }));

        const currentPedEquipmentNumberList = pedEquipmentNumberList;
        setIsFetchingPedEquipmentNumberList(true);
        const newPedEquipmentNumberList = await Promise.all(
          requestList.map(async (request) => {
            const requestType = requestTypeIdList.find(
              (id) => request.request_form_id === id.formId
            );
            const pedEquipmentField = pedEquipmentFieldIdList.find(
              (id) => request.request_form_id === id.formId
            );

            let pedEquipmentNumber = {
              request_id: request.request_id,
              equipment_number: ["N/A"],
            };

            if (
              !requestType?.requestTypeId ||
              !pedEquipmentField?.requestTypeId
            ) {
              return pedEquipmentNumber;
            }

            const requestTypeResponse = await getRequestTypeFieldResponse(
              supabaseClient,
              {
                requestId: request.request_id,
                fieldId: requestType.requestTypeId,
              }
            );

            const isRequestTypeBulk =
              requestTypeResponse &&
              safeParse(requestTypeResponse.request_response).toLowerCase() ===
                "bulk";

            if (isRequestTypeBulk) {
              pedEquipmentNumber = {
                request_id: request.request_id,
                equipment_number: ["Bulk"],
              };
            } else {
              const equipmentNumberList = await getFieldResponseByRequestId(
                supabaseClient,
                {
                  requestId: request.request_id,
                  fieldId: pedEquipmentField.requestTypeId,
                }
              );

              const equipmentNumberListResponse: string[] =
                equipmentNumberList.map((equipment) =>
                  safeParse(equipment.request_response)
                );

              pedEquipmentNumber = {
                request_id: request.request_id,
                equipment_number: equipmentNumberList
                  ? equipmentNumberListResponse
                  : ["N/A"],
              };
            }

            return pedEquipmentNumber;
          })
        );

        const updatedPedEquipmentNumberList = [
          ...currentPedEquipmentNumberList,
          ...newPedEquipmentNumberList,
        ];
        setPedEquipmentNumberList(updatedPedEquipmentNumberList);
      } catch (error) {
        console.error(error);
      } finally {
        setIsFetchingPedEquipmentNumberList(false);
      }
    };

    fetchPedEquipmentNumberList(requestList);
  }, [
    isPEDForm,
    pedEquipmentNumberList,
    requestList,
    selectedFormList,
    selectedFormFilter,
  ]);

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
                  value={`${BASE_URL}/${formatTeamNameToUrlKey(
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
          accessor: "request_ped_equipment_number",
          title: "PED Equipment Number",
          width: 220,
          hidden:
            !isPEDForm || checkIfColumnIsHidden("request_ped_equipment_number"),
          render: ({ request_id }) => {
            const pedEquipmentNumberMatch = pedEquipmentNumberList.find(
              (ped) => ped.request_id === request_id
            );
            const shouldTruncate =
              pedEquipmentNumberMatch &&
              pedEquipmentNumberMatch.equipment_number.length >= 3;

            const renderEquipmentNumbers = () => {
              if (!pedEquipmentNumberMatch) return null;

              if (shouldTruncate) {
                return (
                  <Group>
                    <Text maw={80} truncate>
                      {pedEquipmentNumberMatch.equipment_number.join(", ")}
                    </Text>
                    <Menu shadow="md" withArrow withinPortal={true}>
                      <Menu.Target>
                        <UnstyledButton>
                          <Text color="blue">Show All</Text>
                        </UnstyledButton>
                      </Menu.Target>
                      <Menu.Dropdown p="md">
                        <Stack spacing={8}>
                          {pedEquipmentNumberMatch.equipment_number.map(
                            (equipment, idx) => (
                              <Text key={equipment + idx}>{equipment}</Text>
                            )
                          )}
                        </Stack>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                );
              }

              return (
                <Text>
                  {pedEquipmentNumberMatch.equipment_number.join(", ")}
                </Text>
              );
            };

            return (
              <Box>
                {isFetchingPedEquipmentNumberList ? (
                  <Loader size={16} />
                ) : (
                  renderEquipmentNumbers()
                )}
              </Box>
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
