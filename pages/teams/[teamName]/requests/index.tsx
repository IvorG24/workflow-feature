import Layout from "@/components/Layout/Layout";
import {
  addComment,
  GetRequestApproverList,
  getRequestApproverList,
  GetTeam,
  getTeam,
  getTeamMember,
  getTeamMemberList,
  getTeamRequestList,
  getTeamRequestListCount,
  GetTeamRequestListFilter,
  isRequestCanceled,
  updateRequestStatus,
} from "@/utils/queries";
import { getRandomMantineColor } from "@/utils/styling";
import { RequestStatus } from "@/utils/types";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Checkbox,
  DefaultMantineColor,
  Divider,
  Group,
  Select,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { hideNotification, showNotification } from "@mantine/notifications";
import {
  createServerSupabaseClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  IconDownload,
  IconMaximize,
  IconSearch,
  IconWritingSign,
  IconWritingSignOff,
} from "@tabler/icons";
import { startCase, toLower } from "lodash";
import { DataTable } from "mantine-datatable";
import moment from "moment";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useState } from "react";

const PAGE_SIZE = 15;

type Requester = {
  username: string;
  userId: string;
};

type Approver = {
  userId: string;
  username: string;
  // teamRole: string;
  actionId: string;
  actionName: string;
  approvalStatus: RequestStatus;
};

export type RequestRow = {
  requestId: number;
  formId: number;
  formName: string;
  title: string;
  description: string;
  attachmentFilepathList: string[];
  requester: Requester;
  approverList: Approver[];
  currentUserIsApprover: GetRequestApproverList[0] | null;
  currentUserIsPrimaryApprover: boolean;
  mainStatus: RequestStatus;
  requestDateCreated: string;
  primaryApprover: Approver;
  color: DefaultMantineColor;
  isCanceled: boolean;
};

export type Member = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

export type RequestListPageProps = {
  requestList: RequestRow[];
  // currentUserTeamInfo: Member;
  user: User;
  team: GetTeam;
  teamMemberList: Member[];
  count: number;
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabaseClient = createServerSupabaseClient(ctx);

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    return {
      redirect: {
        destination: "/authentication",
        permanent: false,
      },
    };
  }

  const user = session?.user;

  const teamName = `${ctx.query?.teamName}`;

  const data = await getTeamRequestList(supabaseClient, teamName, {
    range: [0, PAGE_SIZE],
  });
  const count = await getTeamRequestListCount(supabaseClient, teamName, {
    range: [0, PAGE_SIZE],
  });

  // format to match RequestListPageProps
  const requestList: RequestRow[] = data.map((request) => {
    const date = moment(request.request_date_created);
    // const formattedDate = date.format("MMM D, YYYY");
    const formattedDate = date.fromNow();

    return {
      requestId: request.request_id as number,
      formId: request.form_id as number,
      formName: request.form_name as string,
      title: request.request_title as string,
      description: request.request_description || "",
      attachmentFilepathList: (request.request_attachment_filepath_list ||
        []) as string[],
      requester: {
        username: request.username as string,
        userId: request.user_id as string,
      },
      approverList: [],
      currentUserIsApprover: null,
      currentUserIsPrimaryApprover: false,
      mainStatus: request.form_fact_request_status_id as RequestStatus,
      requestDateCreated: formattedDate,
      primaryApprover: {} as Approver,
      color: getRandomMantineColor(),
      isCanceled: request.request_is_canceled as boolean,
    };
  });

  // get approver per request in requestList
  // use getRequestApproverList from queries.ts
  const requestIdList = requestList.map((request) => request.requestId);
  const requestListApproverList = await getRequestApproverList(
    supabaseClient,
    requestIdList
  );

  // modify approver, currentUserIsApprover, currentUserIsMainApprover per request in requestList
  const modifiedRequestList = requestList.map((request) => {
    const requestApproverList = requestListApproverList.filter(
      (approver) => approver.request_id === request.requestId
    );
    const currentUserIsApprover =
      requestApproverList.find((approver) => approver.user_id === user.id) ||
      null;

    const primaryApprover = requestApproverList.find(
      (approver) => approver.request_approver_action_is_primary_approver
    );

    const currentUserIsPrimaryApprover = user.id === primaryApprover?.user_id;

    return {
      ...request,
      approverList: requestApproverList.map((approver) => ({
        userId: approver.user_id,
        username: approver.username,
        actionId: approver.action_id,
        actionName: approver.action_name,
        approvalStatus: approver.request_approver_action_status_id,
      })),
      currentUserIsApprover,
      currentUserIsPrimaryApprover,
      primaryApprover,
    };
  });

  // get current user's information as a team member
  const teamMember = await getTeamMember(
    supabaseClient,
    teamName,
    session?.user?.id
  );

  if (!teamMember) {
    return {
      notFound: true,
    };
  }

  // format to match RequestListPageProps
  // const currentUserTeamInfo = {
  //   id: teamMember.user_id,
  //   username: teamMember.username,
  //   firstName: teamMember.user_first_name,
  //   lastName: teamMember.user_last_name,
  //   email: teamMember.user_email,
  //   role: teamMember.member_role_id,
  // };

  const [team, teamMemberList] = await Promise.all([
    getTeam(supabaseClient, teamName),
    getTeamMemberList(supabaseClient, teamName),
  ]);

  return {
    props: {
      requestList: modifiedRequestList as unknown as RequestRow[],
      user,
      team,
      teamMemberList,
      count,
    },
  };
};

const RequestListPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ requestList, user, team, teamMemberList, count }) => {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState<RequestRow[]>(requestList);
  const [totalRecords, setTotalRecords] = useState(count);
  const [query, setQuery] = useState("");
  // const [pendingOnly, setPendingOnly] = useState(false);
  const [mainStatusFilter, setMainStatusFilter] = useState<
    RequestStatus | "canceled" | null
  >(null);
  const [requester, setRequester] = useState("");
  const [oldestFirst, setOldestFirst] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const teamName = team?.team_name as string;

  const handleRefetchRequestList = async ({
    page,
    oldestFirst,
    mainStatus,
    requester,
  }: {
    page: number;
    oldestFirst: boolean;
    mainStatus: RequestStatus | "canceled" | null;
    requester?: string;
  }) => {
    try {
      setIsLoading(true);

      const index = page - 1;
      const start = index * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;
      const filter: GetTeamRequestListFilter = {
        range: [start, end],
        keyword: query,
        sort: oldestFirst ? "asc" : "desc",
        mainStatus,
        requesterUserId: requester,
      };

      const data = await getTeamRequestList(supabaseClient, teamName, filter);
      const count = await getTeamRequestListCount(
        supabaseClient,
        teamName,
        filter
      );

      // format to match RequestListPageProps
      const requestList: RequestRow[] = data.map((request) => {
        const date = moment(request.request_date_created);
        const formattedDate = date.format("MMM D, YYYY");

        return {
          requestId: request.request_id as number,
          formId: request.form_id as number,
          formName: request.form_name as string,
          title: request.request_title as string,
          description: request.request_description || "",
          attachmentFilepathList: (request.request_attachment_filepath_list ||
            []) as string[],
          requester: {
            username: request.username as string,
            userId: request.user_id as string,
          },
          approverList: [],
          currentUserIsApprover: null,
          currentUserIsPrimaryApprover: false,
          mainStatus: request.form_fact_request_status_id as RequestStatus,
          requestDateCreated: formattedDate,
          primaryApprover: {} as Approver,
          color: getRandomMantineColor(),
          isCanceled: request.request_is_canceled as boolean,
        };
      });

      // get approver per request in requestList
      const requestIdList = requestList.map((request) => request.requestId);
      const requestListApproverList = await getRequestApproverList(
        supabaseClient,
        requestIdList
      );

      // modify approver, currentUserIsApprover, currentUserIsMainApprover per request in requestList
      const modifiedRequestList = requestList.map((request) => {
        const requestApproverList = requestListApproverList.filter(
          (approver) => approver.request_id === request.requestId
        );
        const currentUserIsApprover =
          requestApproverList.find(
            (approver) => approver.user_id === user.id
          ) || null;

        const primaryApprover = requestApproverList.find(
          (approver) => approver.request_approver_action_is_primary_approver
        );

        const currentUserIsPrimaryApprover =
          user.id === primaryApprover?.user_id;

        return {
          ...request,
          approverList: requestApproverList.map((approver) => ({
            userId: approver.user_id,
            username: approver.username,
            actionId: approver.action_id,
            actionName: approver.action_name,
            approvalStatus: approver.request_approver_action_status_id,
          })),
          currentUserIsApprover,
          currentUserIsPrimaryApprover,
          primaryApprover,
        };
      });

      setRecords(modifiedRequestList as unknown as RequestRow[]);
      setTotalRecords(count);
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    await handleRefetchRequestList({
      page,
      oldestFirst,
      mainStatus: mainStatusFilter,
      requester,
    });
    setPage(page);
  };

  const handleApplyFilters = async ({
    oldestFirst,
    mainStatus,
    requester,
  }: {
    oldestFirst: boolean;
    mainStatus: RequestStatus | "canceled" | null;
    requester?: string;
  }) => {
    const page = 1;
    await handleRefetchRequestList({
      page,
      oldestFirst,
      mainStatus,
      requester,
    });
    setOldestFirst(oldestFirst);
    setMainStatusFilter(mainStatus);
    setRequester(requester as string);
    setPage(page);
  };

  // const handlePendingOnly = async (pendingOnly: boolean) => {
  //   const page = 1;
  //   await handleRefetchRequestList({page, oldestFirst});
  //   setPendingOnly(pendingOnly);
  //   setPage(page);
  // };

  const handleUpdateRequestStatus = async (
    requestId: number,
    newStatus: RequestStatus,
    currentUserActionId: string | null | undefined,
    currentUserIsPrimaryApprover: boolean,
    comment: string | null
  ) => {
    try {
      setIsLoading(true);

      if (!currentUserActionId) {
        showNotification({
          title: "Error",
          message: "You are not an approver for this request.",
          color: "red",
        });
        return;
      }

      // check if request is already canceled before updating status
      if (await isRequestCanceled(supabaseClient, requestId)) {
        showNotification({
          title: "Error",
          message: "Request is already canceled. Kindly refresh the page.",
          color: "red",
        });
        return;
      }

      const { approverActionTableData } = await updateRequestStatus(
        supabaseClient,
        user.id,
        requestId,
        currentUserActionId,
        newStatus,
        currentUserIsPrimaryApprover,
        comment
      );

      await addComment(
        supabaseClient,
        requestId,
        user.id,
        comment,
        newStatus === "pending" ? "undo" : newStatus,
        null
      );
      // await handleRefetchRequestList({page, oldestFirst});

      // instead of refetching, just update the request status in records
      setRecords((prev) => {
        return prev.map((record) => {
          if (record.requestId === requestId) {
            return {
              ...record,
              mainStatus: newStatus as RequestStatus,
              currentUserIsApprover: {
                ...record.currentUserIsApprover,
                request_approver_action_status_id: newStatus as RequestStatus,
                request_approver_action_status_last_updated:
                  approverActionTableData.request_approver_action_status_last_updated as string,
              },
              approverList: record.approverList.map((approver) => {
                if (approver.userId === user.id) {
                  return {
                    ...approver,
                    approvalStatus: newStatus as RequestStatus,
                  } as Approver;
                }
                return approver as Approver;
              }) as Approver[],
            } as RequestRow;
          }
          return record as RequestRow;
        }) as unknown as RequestRow[];
      });

      // show undo button
      if (newStatus && newStatus !== "pending")
        showNotification({
          id: "update-request-status-undo",
          title: `Request ${startCase(newStatus)}`,
          message: (
            <>
              <Text>Undo request status change. Will close in 5 seconds.</Text>
              <Group position="left">
                <Button
                  mt="sm"
                  onClick={() => {
                    hideNotification("update-request-status-undo");
                    handleUpdateRequestStatus(
                      requestId,
                      "pending",
                      currentUserActionId,
                      currentUserIsPrimaryApprover,
                      null
                    );
                  }}
                  variant="outline"
                >
                  Undo
                </Button>
              </Group>
            </>
          ),
          color: newStatus === "approved" ? "green" : "red",
          autoClose: 5000,
          icon:
            newStatus === "approved" ? (
              <IconWritingSign />
            ) : (
              <IconWritingSignOff />
            ),
        });
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
        message: `(${startCase(newStatus)}) request failed.`,
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Group>
        <Group noWrap>
          <TextInput
            sx={{ width: "100%" }}
            placeholder="Search request..."
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
          <ActionIcon
            onClick={() =>
              handleApplyFilters({ mainStatus: mainStatusFilter, oldestFirst })
            }
          >
            <IconSearch size={18} stroke={1.5} />
          </ActionIcon>
        </Group>

        <Group noWrap>
          <Select
            placeholder="Requester"
            searchable
            clearable
            data={teamMemberList.map((member) => {
              return {
                label: member.username as string,
                value: member.user_id as string,
              };
            })}
            value={requester}
            onChange={(requester) => {
              handleApplyFilters({
                mainStatus: mainStatusFilter,
                oldestFirst,
                requester: requester as string,
              });
            }}
          />
          <Select
            placeholder="Status"
            searchable
            clearable
            data={[
              {
                label: "Pending",
                value: "pending",
              },
              {
                label: "Approved",
                value: "approved",
              },
              {
                label: "Rejected",
                value: "rejected",
              },
              {
                label: "Canceled",
                value: "canceled",
              },
            ]}
            value={mainStatusFilter}
            onChange={(mainStatus) => {
              handleApplyFilters({
                mainStatus: mainStatus as RequestStatus,
                oldestFirst,
              });
            }}
          />
        </Group>
      </Group>

      <Group noWrap mt="md">
        {/* <Checkbox
          label="Pending only"
          checked={pendingOnly}
          onChange={(e) => {
            handlePendingOnly(e.currentTarget.checked);
          }}
        /> */}
        <Checkbox
          label="Oldest first"
          checked={oldestFirst}
          onChange={(e) => {
            handleApplyFilters({
              mainStatus: mainStatusFilter,
              oldestFirst: e.currentTarget.checked,
            });
          }}
        />
      </Group>

      <Box h={500} mt="md">
        <DataTable
          withBorder
          withColumnBorders
          striped
          fetching={isLoading}
          records={records}
          columns={[
            {
              accessor: "request",
              title: "Requests",
              render: ({
                requester,
                formId,
                formName,
                title,
                description,
                mainStatus,
                primaryApprover,
                requestDateCreated,
                requestId,
                approverList,
                currentUserIsPrimaryApprover,
                currentUserIsApprover,
                color,
                isCanceled,
              }) => {
                const currentUserActionId = currentUserIsApprover?.action_id;
                const badgeColor =
                  mainStatus === "pending"
                    ? "blue"
                    : mainStatus === "approved"
                    ? "green"
                    : "red";

                return (
                  <Box>
                    <Group position="apart" noWrap>
                      <Group noWrap>
                        <Avatar size="sm" color={color}>
                          {requester.username[0]}
                          {requester.username[1]}
                        </Avatar>
                        <Text size="xs">{requester.username}</Text>
                      </Group>
                      <Text size="xs" fw="lighter">
                        {requestDateCreated}
                      </Text>
                    </Group>

                    <Box mt="xs">
                      <Badge size="xs" variant="outline">
                        {formName}
                      </Badge>
                      <Text size="sm" fw="bold" lineClamp={2}>
                        {title}
                      </Text>
                      <Text size="xs" fw="light" lineClamp={4}>
                        {description || "No description"}
                      </Text>
                    </Box>

                    <Group mt="xl" align="end" position="apart">
                      <Box>
                        <Text size="xs" fw="bold" c="dimmed">
                          Primary approver
                        </Text>
                        <Text size="xs">{primaryApprover?.username}</Text>
                      </Box>
                      {isCanceled && (
                        <Badge size="xs" color="dark">
                          Canceled
                        </Badge>
                      )}
                      {!isCanceled && (
                        <Badge size="xs" color={badgeColor}>
                          {mainStatus}
                        </Badge>
                      )}
                    </Group>

                    <Divider mt="xs" mb="sm" />

                    <Group position="apart" noWrap>
                      <Group spacing="md" position="apart" noWrap>
                        <Tooltip label="Approve request">
                          <ActionIcon
                            onClick={() => {
                              handleUpdateRequestStatus(
                                requestId,
                                "approved",
                                currentUserActionId,
                                currentUserIsPrimaryApprover,
                                null
                              );
                            }}
                            disabled={
                              !currentUserIsApprover ||
                              mainStatus !== "pending" ||
                              isCanceled
                            }
                          >
                            <IconWritingSign
                              size={18}
                              stroke={1.5}
                              color="green"
                            />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Reject request">
                          <ActionIcon
                            onClick={() => {
                              handleUpdateRequestStatus(
                                requestId,
                                "rejected",
                                currentUserActionId,
                                currentUserIsPrimaryApprover,
                                null
                              );
                            }}
                            disabled={
                              !currentUserIsApprover ||
                              mainStatus !== "pending" ||
                              isCanceled
                            }
                          >
                            <IconWritingSignOff
                              size={18}
                              stroke={1.5}
                              color="red"
                            />
                          </ActionIcon>
                        </Tooltip>
                        {currentUserIsApprover?.request_approver_action_status_id ===
                          "approved" ||
                          (currentUserIsApprover?.request_approver_action_status_id ===
                            "rejected" && (
                            <Text size="xs" fw="bold" c="dimmed">
                              You already{" "}
                              {toLower(
                                currentUserIsApprover?.request_approver_action_status_id as string
                              )}{" "}
                              this request
                            </Text>
                          ))}
                      </Group>
                      <Group noWrap>
                        <Tooltip label="Download request receipt">
                          <ActionIcon
                            onClick={() =>
                              showNotification({
                                message: "Downloading request receipt",
                              })
                            }
                            disabled={mainStatus !== "approved" || isCanceled}
                          >
                            <IconDownload size={18} stroke={1.5} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Go to request">
                          <ActionIcon
                            onClick={() =>
                              router.push(
                                `/teams/${teamName}/requests/${requestId}`
                              )
                            }
                          >
                            <IconMaximize size={18} stroke={1.5} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Group>
                  </Box>
                );
              },
            },
          ]}
          totalRecords={totalRecords}
          recordsPerPage={PAGE_SIZE}
          page={page}
          onPageChange={(p) => handlePageChange(p)}
        />
      </Box>
    </>
  );
};

export default RequestListPage;

RequestListPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
