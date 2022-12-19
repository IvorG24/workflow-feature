// todo: create integration tests for this component
import {
  UserProfileActionEnum,
  useUserProfileContext,
} from "@/contexts/UserProfileContext";
import { Database } from "@/utils/database.types";
import {
  CreatedOrRetrievedUser,
  createOrRetrieveUser,
  createOrRetrieveUserTeamList,
  CreateOrRetrieveUserTeamList,
} from "@/utils/queries";
import {
  AppShell,
  Container,
  Footer,
  LoadingOverlay,
  MediaQuery,
} from "@mantine/core";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import BottomNavigation, { ILink } from "./BottomNavigation";
import Header from "./Header";
import Navbar from "./Navbar";

type Props = {
  children: ReactNode;
};

const TeamLayout = ({ children }: Props) => {
  const router = useRouter();
  const user = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const supabaseClient = useSupabaseClient<Database>();
  const [createdOrRetrievedUserTeamList, setCreatedOrRetrievedUserTeamList] =
    useState<CreateOrRetrieveUserTeamList>([]);

  const [openNavbar, setOpenNavbar] = useState(false);

  const {
    // state: { userProfile }, // * This is how to fetch state of context.
    dispatchUserProfile,
  } = useUserProfileContext();

  // Provide data for the bottom navigation links on the array
  // { label: "Dashboard", href: "/dashboard", icon: <Dashboard /> } // * What the link object should have
  const bottomNavLinks: ILink[] = [];

  // TODO: Will refactor this to a cleaner version.
  // ? Do I need to convert this to hook?
  useEffect(() => {
    (async () => {
      const handleSet = (createdOrRetrievedUser: CreatedOrRetrievedUser) => {
        dispatchUserProfile({
          type: UserProfileActionEnum.SET,
          payload: {
            userProfile: createdOrRetrievedUser,
          },
        });
      };

      try {
        if (!router.isReady) return;
        if (!user) return;

        // const [createdOrRetrievedUser, createdOrRetrievedUserTeamList] =
        //   await Promise.all([
        //     createOrRetrieveUser(supabaseClient, user),
        //     createOrRetrieveUserTeamList(supabaseClient, user),
        //   ]);

        const createdOrRetrievedUser = await createOrRetrieveUser(
          supabaseClient,
          user
        );
        const createdOrRetrievedUserTeamList =
          await createOrRetrieveUserTeamList(supabaseClient, user);

        // * Set created or fetched user info to context.
        handleSet(createdOrRetrievedUser);

        // * Set created or fetched team list to state to be passed to our navbar.
        setCreatedOrRetrievedUserTeamList(createdOrRetrievedUserTeamList);

        // * If user visits home page, redirect to to first team dashboard page for now.
        if (router.pathname === "/") {
          await router.push(
            `/t/${createdOrRetrievedUserTeamList[0].team_id}/dashboard`
          );
        }
        // If team id is provided in url and it doesn't exist in the user's team list, redirect to first team dashboard page.
        if (router.query.tid) {
          const tid = router.query.tid as string;
          const teamExists = createdOrRetrievedUserTeamList.some(
            (team) => team.team_id === tid
          );
          if (!teamExists) {
            await router.push(
              `/t/${createdOrRetrievedUserTeamList[0].team_id}/requests`
            );
          }
        }

        setIsLoading(false);
      } catch (e) {
        console.error(e);
        // showNotification({
        //   title: "Error",
        //   message: "Failed to create or retrieve user or team information",
        //   color: "red",
        // });
      }
    })();
  }, [router, user, supabaseClient, dispatchUserProfile]);

  return (
    <>
      {isLoading ? (
        <LoadingOverlay visible={isLoading} overlayBlur={2} />
      ) : null}
      {!isLoading ? (
        <AppShell
          navbarOffsetBreakpoint="sm"
          navbar={
            <Navbar
              openNavbar={openNavbar}
              teamList={createdOrRetrievedUserTeamList}
            />
          }
          footer={
            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
              <Footer height={60} p="md">
                {bottomNavLinks.length > 0 && (
                  <BottomNavigation links={bottomNavLinks} />
                )}
              </Footer>
            </MediaQuery>
          }
          header={
            <Header openNavbar={openNavbar} setOpenNavbar={setOpenNavbar} />
            // <MantineHeader height={{ base: 60 }} p="sm">
            //   <Flex justify="space-between" align="center" h="100%" py="md">
            //     <Group>
            //       <Image
            //         src={`/image/logo-${colorScheme}.png`}
            //         alt="logo"
            //         width={147}
            //         height={52}
            //       />
            //       <ActionIcon
            //         variant="default"
            //         onClick={() => toggleColorScheme()}
            //         aria-label="toggle dark mode"
            //       >
            //         {colorScheme === "dark" ? <SvgSun /> : <SvgMoon />}
            //       </ActionIcon>
            //     </Group>
            //     <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            //       <Burger
            //         opened={openNavbar}
            //         onClick={() => setOpenNavbar((prev) => !prev)}
            //         size="sm"
            //       />
            //     </MediaQuery>
            //   </Flex>
            // </MantineHeader>
          }
        >
          <Container p={0} fluid>
            {children}
          </Container>
        </AppShell>
      ) : null}
    </>
  );
};

export default TeamLayout;
