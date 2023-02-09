import Layout from "@/components/Layout/Layout";
import {
  getRequestApproverList,
  GetTeam,
  getTeam,
  getTeamMember,
  getTeamRequestList,
  getTeamRequestListCount,
  GetTeamRequestListFilter,
  isRequestCancelled,
  updateRequestStatus,
} from "@/utils/queries";
import { getRandomColor } from "@/utils/styling";
import { RequestStatus } from "@/utils/types";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Grid,
  Group,
  Text,
  TextInput,
  Tooltip,
  useMantineTheme,
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
  currentUserIsApprover: Approver | null;
  currentUserIsPrimaryApprover: boolean;
  mainStatus: RequestStatus;
  requestDateCreated: string;
  primaryApprover: Approver;
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

  const team = await getTeam(supabaseClient, teamName);

  return {
    props: {
      requestList: modifiedRequestList,
      user,
      team,
      count,
    },
  };
};

const RequestListPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ requestList, user, team, count }) => {
  const router = useRouter();
  const theme = useMantineTheme();
  const supabaseClient = useSupabaseClient();
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState(requestList);
  const [totalRecords, setTotalRecords] = useState(count);
  const [query, setQuery] = useState("");
  const [pendingOnly, setPendingOnly] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const teamName = team?.team_name as string;

  const handleRefetchRequestList = async (
    page: number,
    pendingOnly: boolean
  ) => {
    try {
      setIsLoading(true);

      const index = page - 1;
      const start = index * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;
      const filter: GetTeamRequestListFilter = {
        range: [start, end],
        keyword: query,
        pendingOnly,
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

      setRecords(modifiedRequestList);
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
    await handleRefetchRequestList(page, pendingOnly);
    setPage(page);
  };

  const handleApplyFilters = async () => {
    const page = 1;
    await handleRefetchRequestList(page, pendingOnly);
    setPendingOnly(pendingOnly);
    setPage(page);
  };

  const handlePendingOnly = async (pendingOnly: boolean) => {
    const page = 1;
    await handleRefetchRequestList(page, pendingOnly);
    setPendingOnly(pendingOnly);
    setPage(page);
  };

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

      // check if request is already cancelled before updating status
      if (await isRequestCancelled(supabaseClient, requestId)) {
        showNotification({
          title: "Error",
          message: "Request is already cancelled. Kindly refresh the page.",
          color: "red",
        });
        return;
      }

      await updateRequestStatus(
        supabaseClient,
        user.id,
        requestId,
        currentUserActionId,
        newStatus,
        currentUserIsPrimaryApprover,
        comment
      );
      await handleRefetchRequestList(page, pendingOnly);

      // show undo button
      if (newStatus !== "pending")
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
                      "Undo request status change."
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
      <Grid align="center" mb="md">
        <Grid.Col xs={8} sm={9}>
          <Group noWrap>
            <TextInput
              sx={{ width: "100%" }}
              placeholder="Search request..."
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
            />
            <ActionIcon onClick={() => handleApplyFilters()}>
              <IconSearch size={18} stroke={1.5} />
            </ActionIcon>
          </Group>
        </Grid.Col>
        <Grid.Col xs={4} sm={3}>
          <Checkbox
            label="Pending only"
            checked={pendingOnly}
            onChange={(e) => {
              handlePendingOnly(e.currentTarget.checked);
            }}
          />
        </Grid.Col>
      </Grid>
      <Box h={500}>
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
                        <Avatar size="sm" color={getRandomColor(theme)}>
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
                      <Text size="sm" fw="bold">
                        {title}
                      </Text>
                      <Text size="xs" fw="light">
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

                      <Badge size="xs" color={badgeColor}>
                        {mainStatus}
                      </Badge>
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
                              !currentUserIsApprover || mainStatus !== "pending"
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
                              !currentUserIsApprover || mainStatus !== "pending"
                            }
                          >
                            <IconWritingSignOff
                              size={18}
                              stroke={1.5}
                              color="red"
                            />
                          </ActionIcon>
                        </Tooltip>
                        {currentUserIsApprover?.request_approver_action_status_id !==
                          "pending" && (
                          <Text size="xs" fw="bold" c="dimmed">
                            You already{" "}
                            {toLower(
                              currentUserIsApprover?.request_approver_action_status_id as string
                            )}{" "}
                            this request
                          </Text>
                        )}
                      </Group>
                      <Group noWrap>
                        <Tooltip label="Download request receipt">
                          <ActionIcon
                            onClick={() =>
                              showNotification({
                                message: "Downloading request receipt",
                              })
                            }
                            disabled={mainStatus !== "approved"}
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
