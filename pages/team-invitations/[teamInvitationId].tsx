import {
  addTeamMember,
  getTeamInvitation,
  getTeamMember,
} from "@/utils/queries";
import { Button, Center, Flex, LoadingOverlay, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toUpper } from "lodash";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { useState } from "react";

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

  const user = session.user;

  const teamInvitationId = `${ctx.query.teamInvitationId}`;

  const teamInvitation = await getTeamInvitation(
    supabaseClient,
    teamInvitationId
  );

  if (!teamInvitation) {
    return {
      notFound: true,
    };
  }

  if (teamInvitation.invitation_target_email !== user.email) {
    return {
      redirect: {
        destination: "/403",
        permanent: false,
      },
    };
  }

  const teamName = teamInvitation.team_name as string;
  const teamId = teamInvitation.team_id as string;

  const isAlreadyMember = await getTeamMember(
    supabaseClient,
    teamName,
    user.id
  );

  const fromUsername = teamInvitation.username;

  return {
    props: {
      isAlreadyMember,
      teamId,
      teamName,
      fromUsername,
      user,
    },
  };
};

const TeamInvitationListPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ isAlreadyMember, teamName, fromUsername, teamId, user }) => {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const [isJoiningTeam, setIsJoiningTeam] = useState(false);
  const [acceptedInvitation, setAcceptedInvitation] = useState(false);

  // craeate functin handleJoinTeam
  const handleJoinTeam = async () => {
    try {
      setIsJoiningTeam(true);

      // add user to team using addTeamMember function from utils/queries.ts
      await addTeamMember(supabaseClient, {
        team_member_member_role_id: "member",
        team_member_team_id: teamId,
        team_member_user_id: user.id,
      });

      setAcceptedInvitation(true);
    } catch (error) {
      console.error(error);
      showNotification({
        message: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsJoiningTeam(false);
    }
  };

  return (
    <>
      <Center h="90vh">
        <LoadingOverlay visible={isJoiningTeam} overlayBlur={2} />
        <Flex direction="column" gap="sm" w={400}>
          {!isAlreadyMember && !acceptedInvitation && (
            <>
              <Text fz="xl" fw={700}>
                {`You have been invited to join team ${toUpper(
                  teamName
                )} by ${fromUsername}`}
              </Text>

              <Button onClick={() => handleJoinTeam()}>Join team</Button>
            </>
          )}
          {!isAlreadyMember && acceptedInvitation && (
            <>
              <Text fz="xl" fw={700}>
                {`You have joined team ${toUpper(teamName)}`}
              </Text>

              <Button onClick={() => router.push(`/teams/${teamName}`)}>
                Continue to team page
              </Button>
            </>
          )}
          {isAlreadyMember && (
            <>
              <Text fz="xl" fw={700}>
                {`You are already a member of team ${toUpper(teamName)}`}
              </Text>
              <Button onClick={() => router.push(`/teams/${teamName}`)}>
                Continue to team page
              </Button>
            </>
          )}
        </Flex>
      </Center>
    </>
  );
};

export default TeamInvitationListPage;
