import { ReactNode } from "react";
import { AppShell } from "@mantine/core";
import Navbar from "./Navbar/Navbar";

type Props = {
  children: ReactNode;
};

const WorkspaceLayout = ({ children }: Props) => {
  return <AppShell navbar={<Navbar />}>{children}</AppShell>;
};

export default WorkspaceLayout;
