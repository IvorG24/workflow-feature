import Meta from "@/components/Meta/Meta";
import AcceptInvitation from "@/components/TeamInvitationPage/AcceptInvitation";
import AlreadyMember from "@/components/TeamInvitationPage/AlreadyMember";
import InvalidInvitation from "@/components/TeamInvitationPage/InvalidInvitation";
import SuccessInvitation from "@/components/TeamInvitationPage/SuccessInvitation";
import useAuth from "@/hooks/useAuth";
import { Database } from "@/utils/database.types";
import {
  acceptTeamInvitation,
  FetchTeamInvitation,
  fetchTeamInvitation,
  isUserAlreadyAMemberOfTeam,
} from "@/utils/queries";
import { LoadingOverlay } from "@mantine/core";
import { User, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function TeamInvitationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabaseClient = useSupabaseClient<Database>();
  const [isChecking, setIsChecking] = useState(true);
  const [isInvalid, setIsInvalid] = useState(false);
  const [isAlreadyMember, setIsAlreadyMember] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [teamInvitation, setTeamInvitation] = useState<FetchTeamInvitation>();

  // * When invite target visits this page, he/she accepts the invitation and will be included in the team if the invitation is valid. Example, the visitor is indeed the target of this invitation.
  useEffect(() => {
    (async () => {
      try {
        if (!router.isReady) return;
        if (!user) return;

        const teamInvitation = await fetchTeamInvitation(
          supabaseClient,
          router.query.id as unknown as string
        );
        setTeamInvitation(teamInvitation);

        const isAlreadyMember = await isUserAlreadyAMemberOfTeam(
          supabaseClient,
          teamInvitation?.team_id as string,
          user?.id as string
        );

        if (isAlreadyMember) {
          setIsAlreadyMember(true);
          return;
        }
      } catch (e) {
        console.error(e);
        setIsInvalid(true);
      } finally {
        setIsChecking(false);
      }
    })();
  }, [router, supabaseClient, user]);

  const handleAcceptInvitation = async () => {
    try {
      setIsChecking(true);

      await acceptTeamInvitation(
        supabaseClient,
        router.query.id as unknown as number,
        user as User
      );
      setIsSuccessful(true);
    } catch (e) {
      console.error(e);
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
          teamName={teamInvitation?.team_table.team_name as string}
          teamLogo={teamInvitation?.team_table.team_logo as string}
          inviteSource={teamInvitation?.source.email as string}
          handleAcceptInvitation={handleAcceptInvitation}
        />
      )}
      {!isChecking && isInvalid && <InvalidInvitation />}
      {!isChecking && isAlreadyMember && (
        <AlreadyMember
          teamName={teamInvitation?.team_table.team_name as string}
          teamLogo={teamInvitation?.team_table.team_logo as string}
          teamId={teamInvitation?.team_id as string}
        />
      )}
      {!isChecking && isSuccessful && (
        <SuccessInvitation
          teamName={teamInvitation?.team_table.team_name as string}
          teamLogo={teamInvitation?.team_table.team_logo as string}
          teamId={teamInvitation?.team_id as string}
        />
      )}
    </>
  );
}
