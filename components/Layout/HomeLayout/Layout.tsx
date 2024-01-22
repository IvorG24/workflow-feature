import { AppShell, useMantineTheme } from "@mantine/core";
import { useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Footer from "./Footer";
import Header from "./Header/Header";
import Navbar from "./Navbar/Navbar";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const theme = useMantineTheme();
  const [openNavbar, setOpenNavbar] = useState(false);
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/userActiveTeam");
    }
  }, [user]);

  return (
    <AppShell
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
          position: "relative",
        },
      }}
      navbarOffsetBreakpoint={999999}
      asideOffsetBreakpoint="sm"
      header={
        <Header
          openNavbar={openNavbar}
          setOpenNavbar={() => setOpenNavbar((o) => !o)}
        />
      }
      navbar={
        <Navbar
          openNavbar={openNavbar}
          setOpenNavbar={() => setOpenNavbar((o) => !o)}
        />
      }
      padding={0}
      footer={<Footer />}
    >
      {children}
    </AppShell>
  );
};

export default Layout;
