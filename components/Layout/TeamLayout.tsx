// todo: create integration tests for this component
import { AppShell, Container, Footer, MediaQuery } from "@mantine/core";
import { ReactNode, useState } from "react";
import BottomNavigation, { ILink } from "./BottomNavigation";
import Header from "./Header";
import Navbar from "./Navbar";

type Props = {
  children: ReactNode;
};

const TeamLayout = ({ children }: Props) => {
  const [openNavbar, setOpenNavbar] = useState(false);

  // Provide data for the bottom navigation links on the array
  // { label: "Dashboard", href: "/dashboard", icon: <Dashboard /> } // * What the link object should have
  const bottomNavLinks: ILink[] = [];

  return (
    <>
      <AppShell
        navbarOffsetBreakpoint="sm"
        navbar={<Navbar openNavbar={openNavbar} />}
        footer={
          <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            <Footer height="auto" p="md" withBorder={false}>
              {bottomNavLinks.length > 0 && (
                <BottomNavigation links={bottomNavLinks} />
              )}
            </Footer>
          </MediaQuery>
        }
        header={
          <Header openNavbar={openNavbar} setOpenNavbar={setOpenNavbar} />
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
