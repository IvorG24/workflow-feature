// todo: create integration tests for this component
import LoadingPage from "@/components/LoadingPage/LoadingPage";
import useTeams from "@/hooks/useFetchTeams";
import { AppShell, Container } from "@mantine/core";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { ReactNode, useEffect } from "react";
import MobileHeader from "./MobileHeader";
import Navbar from "./Navbar";
import styles from "./WorkspaceLayout.module.scss";

type Props = {
  children: ReactNode;
};

const WorkspaceLayout = ({ children }: Props) => {
  const { isLoading } = useSessionContext();
  const { data: teams, error: teamsError, loading: teamsLoading } = useTeams();
  const router = useRouter();
  const { tid } = router.query;

  // redirect to first team in array if teamid is not present in url
  useEffect(() => {
    if (teamsLoading || teamsError || tid || !teams.length) return;

    router.push(`/t/${teams[0].team_id}/dashboard`);
  }, [router, teams, teamsError, teamsLoading, tid]);

  if (isLoading || teamsLoading) return <LoadingPage />;
  if (teamsError) return <Container fluid>Error...</Container>; // todo: create a custom error page

  return (
    <AppShell navbar={<Navbar teams={teams} />} header={<MobileHeader />}>
      <main className={styles.childrenContainer}>{children}</main>
    </AppShell>
  );
};

export default WorkspaceLayout;
