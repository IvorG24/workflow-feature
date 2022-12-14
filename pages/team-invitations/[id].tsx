import Meta from "@/components/Meta/Meta";
import SuccessInvitation from "@/components/TeamInvitationPage/SuccessInvitation";
// import { Database } from "@/utils/database.types";
// import { acceptTeamInvitation } from "@/utils/queries";
// import { LoadingOverlay } from "@mantine/core";
// import { showNotification } from "@mantine/notifications";
// import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
// import { useRouter } from "next/router";
// import { useEffect, useState } from "react";

const tempData = {
  team_name: "Team 1",
  team_logo: "",
  invite_source: "user@example.com",
};

export default function TeamInvitationsPage() {
  // const router = useRouter();
  // const [isFetching, setIsFetching] = useState(true);
  // const user = useUser();
  // const supabaseClient = useSupabaseClient<Database>();

  // * When invite target visits this page, he/she accepts the invitation and will be included in the team if the invitation is valid. Example, the visitor is indeed the target of this invitation.
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       if (!router.isReady) return;
  //       if (!user) {
  //         await router.push("/sign-in");
  //         return;
  //       }
  //       await acceptTeamInvitation(
  //         supabaseClient,
  //         router.query.id as unknown as number,
  //         user
  //       );
  //       showNotification({
  //         title: "Success!",
  //         message: "Invitation accepted",
  //         color: "green",
  //       });
  //       await router.push("/");
  //     } catch {
  //       showNotification({
  //         title: "Error",
  //         message: "Failed to accept invite",
  //         color: "red",
  //       });
  //     }
  //   })();

  //   setIsFetching(false);
  // }, [router, supabaseClient, user]);

  // TODO: If error, change the display to an error page like how GitHub does it.

  return (
    <>
      <Meta
        description="Team Invitations Page"
        url="localhost:3000/team-invtations"
      />
      {/* <LoadingOverlay visible={isFetching} overlayBlur={2} /> */}
      {/* {!isFetching && <h1>Team Invitations Page. Run logic here.</h1>} */}
      <SuccessInvitation
        teamName={tempData.team_name}
        teamLogo={tempData.team_logo}
      />
    </>
  );
}
