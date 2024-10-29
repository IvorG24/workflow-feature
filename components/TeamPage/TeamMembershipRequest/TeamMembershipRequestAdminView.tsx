import { deleteTeamMembershipRequest } from "@/backend/api/delete";
import { getTeamTeamMembershipRequest } from "@/backend/api/get";
import { createTeamMember, insertError } from "@/backend/api/post";
import { ROW_PER_PAGE } from "@/utils/constant";
import { Database } from "@/utils/database";
import { isError } from "@/utils/functions";
import {
  TeamMemberTableInsert,
  TeamTeamMembershipRequest,
} from "@/utils/types";
import {
  ActionIcon,
  Button,
  Checkbox,
  Container,
  Flex,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import {
  IconCircleCheckFilled,
  IconReload,
  IconTrashFilled,
} from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Props = {
  teamId: string;
};

const TeamMembershipRequestAdminView = ({ teamId }: Props) => {
  const user = useUser();
  const router = useRouter();
  const supabaseClient = createPagesBrowserClient<Database>();
  const [isLoading, setIsLoading] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [teamMembershipRequestList, setTeamMembershipRequestList] = useState<
    TeamTeamMembershipRequest[]
  >([]);
  const [teamMembershipRequestCount, setTeamMembershipRequestCount] =
    useState(0);

  const handleFetchTeamMembershipRequest = async (page: number) => {
    try {
      setIsLoading(true);
      setActivePage(page);
      const responseData = await getTeamTeamMembershipRequest(supabaseClient, {
        page,
        teamId,
      });

      setTeamMembershipRequestList(responseData.data);
      setTeamMembershipRequestCount(responseData.count);
    } catch (error) {
      console.log(error);
      notifications.show({
        message: "Failed to fetch team membership requests",
        color: "red",
      });
      if (isError(error)) {
        await insertError(supabaseClient, {
          errorTableRow: {
            error_message: error.message,
            error_url: router.asPath,
            error_function: "handleFetchTeamMembershipRequest",
            error_user_email: user?.email,
            error_user_id: user?.id,
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptMembershipRequest = async (userId: string) => {
    try {
      setIsLoading(true);
      const newMember: TeamMemberTableInsert = {
        team_member_user_id: userId,
        team_member_team_id: teamId,
        team_member_role: "MEMBER",
      };

      await createTeamMember(supabaseClient, newMember);
      await deleteTeamMembershipRequest(supabaseClient, {
        teamId,
        userId,
      });

      setTeamMembershipRequestList((prev) =>
        prev.filter((request) => request.user_id === userId)
      );

      notifications.show({
        message: "Member accepted.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        message: "Failed to accept team membership request",
        color: "red",
      });
      if (isError(error)) {
        await insertError(supabaseClient, {
          errorTableRow: {
            error_message: error.message,
            error_url: router.asPath,
            error_function: "handleAcceptMembershipRequest",
            error_user_email: user?.email,
            error_user_id: user?.id,
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelTeamMembershipRequest = async (userId: string) => {
    try {
      setIsLoading(true);
      await deleteTeamMembershipRequest(supabaseClient, {
        teamId,
        userId: `${user?.id}`,
      });
      setTeamMembershipRequestList((prev) =>
        prev.filter((request) => request.user_id === userId)
      );
    } catch (error) {
      notifications.show({
        message: "Failed to cancel team membership request",
        color: "red",
      });
      if (isError(error)) {
        await insertError(supabaseClient, {
          errorTableRow: {
            error_message: error.message,
            error_url: router.asPath,
            error_function: "handleCancelRequestToJoin",
            error_user_email: user?.email,
            error_user_id: user?.id,
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleFetchTeamMembershipRequest(1);
  }, []);

  return (
    <Container p={0} mt="xl" pos="relative" fluid>
      <Paper p="lg" shadow="xs">
        <Stack>
          <Flex gap="sm" align="center" wrap="wrap">
            <Title order={4}>Team Membership Request</Title>
            <TextInput w={250} placeholder="Search user by name or email" />
            <Button
              variant="light"
              leftIcon={<IconReload size={16} />}
              onClick={() => handleFetchTeamMembershipRequest(1)}
            >
              Refresh
            </Button>
          </Flex>
          <DataTable
            idAccessor="team_membership_request_id"
            withBorder
            fw="bolder"
            c="dimmed"
            minHeight={390}
            fetching={isLoading}
            recordsPerPage={ROW_PER_PAGE}
            totalRecords={teamMembershipRequestCount}
            page={activePage}
            onPageChange={(page: number) =>
              handleFetchTeamMembershipRequest(page)
            }
            records={teamMembershipRequestList}
            columns={[
              {
                accessor: "team_membership_request_id",
                title: "Select",
                width: 80,
                render: ({ team_membership_request_id }) => (
                  <Checkbox
                    key={team_membership_request_id}
                    ml="sm"
                    size="xs"
                  />
                ),
              },
              {
                accessor: "user_id",
                title: "Name",
                render: ({ user_first_name, user_last_name }) => (
                  <Text>
                    {`${user_first_name} ${user_last_name}`.toUpperCase()}
                  </Text>
                ),
              },
              {
                accessor: "user_email",
                title: "Email",
                render: ({ user_email }) => <Text>{user_email}</Text>,
              },
              {
                accessor: "action",
                title: "Action",
                width: 120,
                textAlignment: "center",
                render: ({ user_id }) => (
                  <Flex gap="xs" justify="center">
                    <Tooltip label="Accept">
                      <ActionIcon
                        color="green"
                        onClick={() => handleAcceptMembershipRequest(user_id)}
                      >
                        <IconCircleCheckFilled />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Decline">
                      <ActionIcon
                        color="red"
                        onClick={() =>
                          handleCancelTeamMembershipRequest(user_id)
                        }
                      >
                        <IconTrashFilled />
                      </ActionIcon>
                    </Tooltip>
                  </Flex>
                ),
              },
            ]}
          />
        </Stack>
      </Paper>
    </Container>
  );
};

export default TeamMembershipRequestAdminView;
