import { ReactNode } from "react";
import { AppShell } from "@mantine/core";
import Header from "./Header/Header";

type Props = {
  children: ReactNode;
};

const WorkspaceLayout = ({ children }: Props) => {
  return <AppShell header={<Header />}>{children}</AppShell>;
};

export default WorkspaceLayout;
