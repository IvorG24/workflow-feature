// todo: create integration tests for this component
import { AppShell, Container, Footer, MediaQuery } from "@mantine/core";
import { IconFileDescription, IconFilePencil, IconHome } from "@tabler/icons";
import { useRouter } from "next/router";
import { ReactNode, useState } from "react";
import BottomNavigation, { ILink } from "./BottomNavigation";
import Header from "./Header";
import Navbar from "./Navbar";

type Props = {
  children: ReactNode;
};

const TeamLayout = ({ children }: Props) => {
  const [openNavbar, setOpenNavbar] = useState(false);
  const router = useRouter();

  // Provide data for the bottom navigation links on the array
  // { label: "Dashboard", href: "/dashboard", icon: <Dashboard /> } // * What the link object should have
  const bottomNavLinks: ILink[] = [
    {
      // change href to team dashboard
      label: "Home",
      href: `/t/${router.query.tid}/requests?active_tab=all&page=1`,
      icon: <IconHome />,
    },
    {
      label: "Forms",
      href: `/t/${router.query.tid}/forms`,
      icon: <IconFileDescription />,
    },
    {
      label: "Requests",
      href: `/t/${router.query.tid}/requests?active_tab=all&page=1`,
      icon: <IconFilePencil />,
    },
  ];

  return (
    <>
      <AppShell
        navbarOffsetBreakpoint="sm"
        header={
          <Header openNavbar={openNavbar} setOpenNavbar={setOpenNavbar} />
        }
        navbar={<Navbar openNavbar={openNavbar} />}
        footer={
          <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            <Footer height={80} p="sm" withBorder>
              {bottomNavLinks.length > 0 && (
                <BottomNavigation links={bottomNavLinks} />
              )}
            </Footer>
          </MediaQuery>
        }
      >
        <Container p={0} fluid>
          {children}
        </Container>
      </AppShell>
    </>
  );
};

export default TeamLayout;
