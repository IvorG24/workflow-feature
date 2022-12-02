// todo: create integration tests for this component
import showNotification from "@/hooks/showNotifications";
import useTeams from "@/hooks/useTeams";
import { AppShell, Container } from "@mantine/core";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { ReactNode, useEffect } from "react";
import MobileHeader from "./MobileHeader";
import Navbar from "./Navbar";
import styles from "./WorkspaceLayout.module.scss";

type Props = {
  children: ReactNode;
};

const WorkspaceLayout = ({ children }: Props) => {
  const { session, isLoading, supabaseClient } = useSessionContext();
  const { data: teams, error: teamsError, loading: teamsLoading } = useTeams();

  // create default team for new user
  useEffect(() => {
    if (teamsLoading || teamsError || teams.length > 0) return;
    (async () => {
      try {
        const { data, error } = await supabaseClient
          .from("team_table")
          .insert([{ team_name: `Team 1`, user_id: session?.user?.id }]);

        if (error) throw error;

        console.log(data);
      } catch (error) {
        console.error(error);
        showNotification({
          message: "Failed to create workspace",
          state: "Danger",
        });
      }
    })();
  }, [
    session?.user?.id,
    supabaseClient,
    teams.length,
    teamsLoading,
    teamsError,
  ]);

  if (isLoading || teamsLoading || teams.length === 0)
    return <Container fluid>Loading...</Container>; // todo: use mantine loading page
  if (teamsError) return <Container fluid>Error...</Container>; // todo: create a custom error page

  return (
    <AppShell navbar={<Navbar teams={teams} />} header={<MobileHeader />}>
      <main className={styles.childrenContainer}>{children}</main>
    </AppShell>
  );
};

export default WorkspaceLayout;
