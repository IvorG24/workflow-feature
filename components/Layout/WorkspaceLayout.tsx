// todo: create integration tests for this component
import LoadingPage from "@/components/LoadingPage/LoadingPage";
import useTeams from "@/hooks/useFetchTeams";
import { AppShell, Container } from "@mantine/core";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { ReactNode } from "react";
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

  if (isLoading || teamsLoading) return <LoadingPage />;
  if (teamsError) return <Container fluid>Error...</Container>; // todo: create a custom error page

  return (
    <AppShell
      navbar={<Navbar teams={teams} teamId={tid as string} />} // don't use typecasting for tid
      header={<MobileHeader />}
    >
      <main className={styles.childrenContainer}>{children}</main>
    </AppShell>
  );
};

export default WorkspaceLayout;
