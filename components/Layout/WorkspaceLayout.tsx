// todo: create integration tests for this component
import { Database } from "@/utils/database.types";
import {
  createOrRetrieveUser,
  createOrRetrieveUserTeamList,
  CreateOrRetrieveUserTeamList,
} from "@/utils/queries";
import { AppShell, LoadingOverlay } from "@mantine/core";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import MobileHeader from "./MobileHeader";
import Navbar from "./Navbar";
import styles from "./WorkspaceLayout.module.scss";

type Props = {
  children: ReactNode;
};

const WorkspaceLayout = ({ children }: Props) => {
  const router = useRouter();
  const user = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const supabaseClient = useSupabaseClient<Database>();
  const [createdOrRetrievedUserTeamList, setCreatedOrRetrievedUserTeamList] =
    useState<CreateOrRetrieveUserTeamList>([]);

  useEffect(() => {
    (async () => {
      try {
        if (!router.isReady) return;
        if (!user) {
          await router.push("/sign-in");
          return;
        }

        const [createdOrRetrievedUser, createdOrRetrievedUserTeamList] =
          await Promise.all([
            createOrRetrieveUser(supabaseClient, user),
            createOrRetrieveUserTeamList(supabaseClient, user),
          ]);

        console.log(createdOrRetrievedUser);

        setCreatedOrRetrievedUserTeamList(createdOrRetrievedUserTeamList);
        setIsLoading(false);

        if (router.pathname === "/")
          await router.push(
            `/t/${createdOrRetrievedUserTeamList[0].team_id}/dashboard`
          );
      } catch (error) {
        console.error(error);
      }
    })();
  }, [router, user]);

  return (
    <>
      <LoadingOverlay visible={isLoading} overlayBlur={2} />
      {!isLoading && (
        <AppShell
          navbar={
            <Navbar
              teamList={createdOrRetrievedUserTeamList}
              activeTeamIndex={0}
            />
          } // don't use typecasting for tid
          header={<MobileHeader />}
        >
          <main className={styles.childrenContainer}>{children}</main>
        </AppShell>
      )}
    </>
  );
};

export default WorkspaceLayout;
