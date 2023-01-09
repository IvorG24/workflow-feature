import Meta from "@/components/Meta/Meta";
import AcceptInvitation from "@/components/TeamInvitationPage/AcceptInvitation";
import AlreadyMember from "@/components/TeamInvitationPage/AlreadyMember";
import InvalidInvitation from "@/components/TeamInvitationPage/InvalidInvitation";
import SuccessInvitation from "@/components/TeamInvitationPage/SuccessInvitation";
import useAuth from "@/hooks/useAuth";
import { Database } from "@/utils/database.types";
import {
  acceptTeamInvitation,
  GetTeamInvitation,
  getTeamInvitation,
  isUserMemberOfTeam,
} from "@/utils/queries-new";
import { LoadingOverlay } from "@mantine/core";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { User, useSupabaseClient } from "@supabase/auth-helpers-react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabaseClient = createServerSupabaseClient(ctx);
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session)
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };

  try {
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session) throw new Error("Not authorized");

    const teamInvitation = await getTeamInvitation(
      supabaseClient,
      ctx.params?.id as unknown as string
    );

    const isAlreadyMember = await isUserMemberOfTeam(
      supabaseClient,
      session.user.id as string,
      teamInvitation?.team_id as string
    );

    return {
      props: {
        isInvalidInitial: false,
        teamInvitation,
        isAlreadyMember,
      },
    };
  } catch (error) {
    return {
      props: {
        isInvalidInitial: true,
        teamInvitation: null,
        isAlreadyMember: false,
      },
    };
  }
};

type Props = {
  isInvalidInitial: boolean;
  teamInvitation: GetTeamInvitation | null;
  isAlreadyMember: boolean;
};

export default function TeamInvitationsPage({
  teamInvitation,
  isAlreadyMember,
  isInvalidInitial,
}: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const supabaseClient = useSupabaseClient<Database>();
  const [isChecking, setIsChecking] = useState(false);
  const [isInvalid, setIsInvalid] = useState(isInvalidInitial);

  const [isSuccessful, setIsSuccessful] = useState(false);

  const handleAcceptInvitation = async () => {
    try {
      setIsChecking(true);

      await acceptTeamInvitation(
        supabaseClient,
        router.query.id as unknown as number,
        user as User
      );
      setIsSuccessful(true);
    } catch {
      setIsInvalid(true);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <>
      <Meta
        description="Team Invitations Page"
        url="localhost:3000/team-invtations"
      />
      <LoadingOverlay visible={isChecking} overlayBlur={2} />
      {!isChecking && !isInvalid && !isAlreadyMember && !isSuccessful && (
        <AcceptInvitation
          teamName={teamInvitation?.team_name as string}
          teamLogo={teamInvitation?.team_logo_filepath as string}
          inviteSource={teamInvitation?.user_email as string}
          handleAcceptInvitation={handleAcceptInvitation}
        />
      )}
      {!isChecking && isInvalid && <InvalidInvitation />}
      {!isChecking && isAlreadyMember && (
        <AlreadyMember
          teamName={teamInvitation?.team_name as string}
          teamLogo={teamInvitation?.team_logo_filepath as string}
          teamId={teamInvitation?.team_id as string}
        />
      )}
      {!isChecking && isSuccessful && (
        <SuccessInvitation
          teamName={teamInvitation?.team_name as string}
          teamLogo={teamInvitation?.team_logo_filepath as string}
          teamId={teamInvitation?.team_id as string}
        />
      )}
    </>
  );
}
