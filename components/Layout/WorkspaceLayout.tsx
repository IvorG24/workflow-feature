import { AppShell } from "@mantine/core";
import { ReactNode } from "react";
import Navbar from "../Navbar/Navbar";

type Props = {
  children: ReactNode;
};

const WorkspaceLayout = ({ children }: Props) => {
  return (
    <AppShell navbar={<Navbar />}>
      <main>{children}</main>
    </AppShell>
  );
};

export default WorkspaceLayout;
