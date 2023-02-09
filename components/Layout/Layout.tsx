import useAuth from "@/hooks/useAuth";
import {
  getTeamFormList,
  GetTeamFormList,
  GetUserTeamList,
  getUserTeamList,
  isUserOnboarded,
} from "@/utils/queries";
import { AppShell, LoadingOverlay, useMantineTheme } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FormslyFooter from "./Footer/FormslyFooter";
import FormslyHeader from "./Header/FormslyHeader";
import FormslyNavbar from "./Navbar/FormslyNavbar";

export type LayoutProps = {
  children: React.ReactNode;
};

function Layout({ children }: LayoutProps) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const [formList, setFormList] = useState<GetTeamFormList>([]);
  const [filteredFormList, setFilteredFormList] = useState<GetTeamFormList>([]);
  const [teamList, setTeamList] = useState<GetUserTeamList>([]);
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  // const user = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingTeamList, setIsFetchingTeamList] = useState(true);
  const [isFetchingFormList, setIsFetchingFormList] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        if (!router.isReady) return;
        if (!session?.user?.id) return;

        // If not onboarded, make user create user profile and team first.
        const isOnboarded = await isUserOnboarded(
          supabaseClient,
          session?.user?.id
        );
        if (!isOnboarded) router.push("/onboarding");
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        showNotification({
          title: "Error",
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
      }
    })();
  }, [router.query.teamName, session?.user?.id]);

  useEffect(() => {
    (async () => {
      try {
        setIsFetchingTeamList(true);
        if (!session?.user?.id) return;
        // Fetch current user's team list.
        const data = await getUserTeamList(
          supabaseClient,
          session?.user?.id as string
        );

        if (!data) {
          setIsFetchingTeamList(false);
          return;
        }
        if (data.length === 0) {
          setIsFetchingTeamList(false);
          return;
        }

        setTeamList(data);

        if (!router.query.teamName)
          router.push(`/teams/${data[0].team_name as string}`);

        // if (
        //   !data
        //     .map((team) => team.team_name)
        //     .includes(router.query.teamName as string)
        // ) {
        //   router.push("/404");
        //   return;
        // }
        setIsFetchingTeamList(false);
      } catch (error) {
        console.error(error);
        showNotification({
          title: "Error",
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
      } finally {
        setIsFetchingTeamList(false);
      }
    })();
  }, [router.query.teamName, session?.user?.id]);

  useEffect(() => {
    (async () => {
      try {
        setIsFetchingFormList(true);
        if (!router.isReady) return;
        if (!router.query.teamName) return;
        if (!session?.user?.id) return;

        // Fetch current active team's form list.
        const data = await getTeamFormList(
          supabaseClient,
          router.query.teamName as string
        );

        setFormList(data);
        setFilteredFormList(data);
        setIsFetchingFormList(false);
      } catch (error) {
        console.error(error);
        showNotification({
          title: "Error",
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
      } finally {
        setIsFetchingFormList(false);
      }
    })();
  }, [router.query.teamName, session?.user?.id]);

  const handleSearchForm = (value: string) => {
    if (!value) {
      setFilteredFormList(formList);
      return;
    }
    // Filter form list on key change using keyword.
    const data = formList.filter((form) =>
      form?.form_name?.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredFormList(data);
  };

  return (
    <>
      <LoadingOverlay
        visible={isLoading || isFetchingFormList || isFetchingTeamList}
        overlayBlur={2}
      />
      <AppShell
        styles={{
          main: {
            background:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        }}
        navbarOffsetBreakpoint="md"
        // asideOffsetBreakpoint="md"
        navbar={
          <FormslyNavbar
            opened={opened}
            setOpened={setOpened}
            teamList={teamList}
            formList={filteredFormList}
            handleSearchForm={handleSearchForm}
          />
        }
        // aside={
        //   <MediaQuery smallerThan="md" styles={{ display: "none" }}>
        //     <Aside
        //       p="md"
        //       hiddenBreakpoint="md"
        //       width={{ sm: 200, lg: 300 }}
        //       style={{ height: "100%" }}
        //     >
        //       <Text>Application sidebar</Text>
        //     </Aside>
        //   </MediaQuery>
        // }
        footer={<FormslyFooter />}
        header={
          // <Header height={{ base: 50, md: 70 }} p="md">
          //   <div
          //     style={{ display: "flex", alignItems: "center", height: "100%" }}
          //   >
          //     <MediaQuery largerThan="sm" styles={{ display: "none" }}>
          //       <Burger
          //         opened={opened}
          //         onClick={() => setOpened((o) => !o)}
          //         size="sm"
          //         color={theme.colors.gray[6]}
          //         mr="xl"
          //       />
          //     </MediaQuery>

          //     <Text>Application header</Text>
          //   </div>
          // </Header>
          <FormslyHeader opened={opened} setOpened={setOpened} />
        }
      >
        {children}
      </AppShell>
    </>
  );
}

export default Layout;
