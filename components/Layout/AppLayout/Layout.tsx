import { AppShell, useMantineTheme } from "@mantine/core";
import { useState } from "react";
import Header from "./Header";
import Navbar from "./Navbar";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const theme = useMantineTheme();
  const [openNavbar, setOpenNavbar] = useState(false);

  return (
    <AppShell
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={<Navbar openNavbar={openNavbar} />}
      header={
        <Header
          openNavbar={openNavbar}
          setOpenNavbar={() => setOpenNavbar((o) => !o)}
        />
      }
    >
      {children}
    </AppShell>
  );
};

export default Layout;
