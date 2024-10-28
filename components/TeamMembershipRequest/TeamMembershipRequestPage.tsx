import { getUserTeamMembershipRequest } from "@/backend/api/get";
import { insertError, sendRequestToJoinTeam } from "@/backend/api/post";
import { ROW_PER_PAGE } from "@/utils/constant";
import { Database } from "@/utils/database";
import { isError } from "@/utils/functions";
import { getAvatarColor } from "@/utils/styling";
import { TeamMembershipRequestTableRow, TeamTableRow } from "@/utils/types";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { IconSearch } from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Props = {
  teams: Pick<TeamTableRow, "team_id" | "team_name" | "team_logo">[];
  teamsCount: number;
};
const TeamMembershipRequestPage = ({ teams, teamsCount }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const user = useUser();
  const router = useRouter();
  const [activePage, setActivePage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [teamMembershipRequest, setTeamMembershipRequest] = useState<
    TeamMembershipRequestTableRow[]
  >([]);

  const teamMembershipRequestId = teamMembershipRequest.map(
    (request) => request.team_membership_request_to_team_id
  );

  const handleFetchTeams = async (page: number) => {
    try {
      setIsLoading(true);
      setActivePage(page);
      console.log(page);
    } catch (error) {
      notifications.show({
        message: "Failed to fetch teams",
        color: "red",
      });
      if (isError(error)) {
        await insertError(supabaseClient, {
          errorTableRow: {
            error_message: error.message,
            error_url: router.asPath,
            error_function: "handleFetchTeams",
            error_user_email: user?.email,
            error_user_id: user?.id,
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequestToJoin = async (teamId: string) => {
    try {
      if (!user) {
        notifications.show({
          message: "User not authenticated.",
          color: "red",
        });
        return;
      }

      setIsLoading(true);
      const newJoinRequest = await sendRequestToJoinTeam(supabaseClient, {
        teamId,
        userId: user.id,
      });
      setTeamMembershipRequest((prev) => [...prev, newJoinRequest]);
      notifications.show({
        message: "Request sent!",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        message: "Failed to join team. Please contact IT",
        color: "red",
      });
      if (isError(error)) {
        await insertError(supabaseClient, {
          errorTableRow: {
            error_message: error.message,
            error_url: router.asPath,
            error_function: "handleSendRequestToJoin",
            error_user_email: user?.email,
            error_user_id: user?.id,
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchTeamMembershipRequest = async () => {
    try {
      setIsLoading(true);
      const data = await getUserTeamMembershipRequest(
        supabaseClient,
        `${user?.id}`
      );
      setTeamMembershipRequest(data);
    } catch (error) {
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

  useEffect(() => {
    if (user && user.id) {
      handleFetchTeamMembershipRequest();
    }
  }, [user]);

  return (
    <Container maw={3840} h="100%">
      <Stack>
        <Box>
          <Title order={4}>Join Team Page</Title>
          <Text>Select a team and send a membership request.</Text>
        </Box>
        <TextInput
          w={300}
          placeholder="Search team name..."
          rightSection={
            <ActionIcon>
              <IconSearch size={16} />
            </ActionIcon>
          }
        />
        <DataTable
          idAccessor="team_id"
          withBorder
          fw="bolder"
          c="dimmed"
          minHeight={390}
          fetching={isLoading}
          recordsPerPage={ROW_PER_PAGE}
          totalRecords={teamsCount}
          page={activePage}
          onPageChange={(page: number) => handleFetchTeams(page)}
          records={teams}
          columns={[
            {
              accessor: "team_name",
              title: "Team Name",
              render: ({ team_name, team_logo }) => {
                return (
                  <Flex gap="xs" align="center" wrap="wrap">
                    <Avatar
                      size="sm"
                      src={team_logo}
                      color={getAvatarColor(Number(team_name.charCodeAt(0)))}
                    >
                      {(team_name[0] + team_name[1]).toUpperCase()}
                    </Avatar>
                    <Text>{team_name}</Text>
                  </Flex>
                );
              },
            },
            {
              accessor: "team_id",
              title: "Join",
              render: ({ team_id }) => {
                const hasUserSentRequest =
                  teamMembershipRequestId.includes(team_id);
                return (
                  <Button
                    size="sm"
                    onClick={() => handleSendRequestToJoin(team_id)}
                    disabled={hasUserSentRequest || isLoading}
                  >
                    {hasUserSentRequest ? "Request sent" : "Join"}
                  </Button>
                );
              },
            },
          ]}
        />
      </Stack>
    </Container>
  );
};

export default TeamMembershipRequestPage;
