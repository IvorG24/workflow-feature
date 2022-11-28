import { AppShell } from "@mantine/core";
import { ReactNode } from "react";
import MobileHeader from "./MobileHeader";
import Navbar from "./Navbar";
import styles from "./WorkspaceLayout.module.scss";

type Props = {
  children: ReactNode;
};

const WorkspaceLayout = ({ children }: Props) => {
  return (
    <AppShell navbar={<Navbar />} header={<MobileHeader />}>
      <main className={styles.childrenContainer}>{children}</main>
    </AppShell>
  );
};

export default WorkspaceLayout;
