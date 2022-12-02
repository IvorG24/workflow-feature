// todo: create integration tests for this component
import useTeams from "@/hooks/useTeams";
import { AppShell, Container } from "@mantine/core";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { ReactNode } from "react";
import MobileHeader from "./MobileHeader";
import Navbar from "./Navbar";
import styles from "./WorkspaceLayout.module.scss";

type Props = {
  children: ReactNode;
};

const WorkspaceLayout = ({ children }: Props) => {
  const { session, isLoading } = useSessionContext();

  const { data: teams, error: teamsError, loading: teamsLoading } = useTeams();

  if (isLoading || teamsLoading) return <Container fluid>Loading...</Container>; // todo: use mantine loading page
  if (teamsError) return <Container fluid>Error...</Container>; // todo: create a custom error page

  console.log(session?.user);
  console.log(teams);

  return (
    <AppShell navbar={<Navbar />} header={<MobileHeader />}>
      <main className={styles.childrenContainer}>{children}</main>
    </AppShell>
  );
};

export default WorkspaceLayout;
