// todo: create integration tests for this component
import { Database } from "@/utils/database.types";
import {
  createOrRetrieveUser,
  createOrRetrieveUserTeamList,
  CreateOrRetrieveUserTeamList,
} from "@/utils/queries";
import { AppShell, LoadingOverlay } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import MobileHeader from "./MobileHeader";
import Navbar from "./Navbar";
import styles from "./TeamLayout.module.scss";

type Props = {
  children: ReactNode;
};

const TeamLayout = ({ children }: Props) => {
  const router = useRouter();
  const user = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const supabaseClient = useSupabaseClient<Database>();
  const [createdOrRetrievedUserTeamList, setCreatedOrRetrievedUserTeamList] =
    useState<CreateOrRetrieveUserTeamList>([]);

  // ? Do I need to convert this to hook?
  useEffect(() => {
    (async () => {
      try {
        if (!router.isReady) return;
        if (!user) return;

        const [createdOrRetrievedUser, createdOrRetrievedUserTeamList] =
          await Promise.all([
            createOrRetrieveUser(supabaseClient, user),
            createOrRetrieveUserTeamList(supabaseClient, user),
          ]);

        console.log(createdOrRetrievedUser);

        setCreatedOrRetrievedUserTeamList(createdOrRetrievedUserTeamList);

        // * If user visits home page, redirect to to first team dashboard page for now.
        if (router.pathname === "/") {
          await router.push(
            `/t/${createdOrRetrievedUserTeamList[0].team_id}/dashboard`
          );
        }
        // If team id is provided in url and it doesn't exist in the user's team list, redirect to first team dashboard page.
        if (router.query.tid) {
          const tid = router.query.tid as string;
          const teamExists = createdOrRetrievedUserTeamList.some(
            (team) => team.team_id === tid
          );
          if (!teamExists) {
            await router.push(
              `/t/${createdOrRetrievedUserTeamList[0].team_id}/dashboard`
            );
          }
        }

        setIsLoading(false);
      } catch {
        showNotification({
          title: "Error",
          message: "Failed to create or retrieve user or team information",
          color: "red",
        });
      }
    })();
  }, [router, user, supabaseClient]);

  return (
    <>
      {isLoading ? (
        <LoadingOverlay visible={isLoading} overlayBlur={2} />
      ) : null}
      {!isLoading ? (
        <AppShell
          navbar={<Navbar teamList={createdOrRetrievedUserTeamList} />} // don't use typecasting for tid
          header={<MobileHeader teamList={createdOrRetrievedUserTeamList}/>}
        >
          <main className={styles.childrenContainer}>{children}</main>
        </AppShell>
      ) : null}
    </>
  );
};

export default TeamLayout;
