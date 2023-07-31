import {
  getAllNotification,
  getAllTeamOfUser,
  getFormList,
  getUser,
  getUserTeamMemberData,
} from "@/backend/api/get";
import { updateUserActiveApp } from "@/backend/api/update";
import { useFormActions } from "@/stores/useFormStore";
import { useNotificationActions } from "@/stores/useNotificationStore";
import { useActiveApp, useTeamActions } from "@/stores/useTeamStore";
import { useUserActions } from "@/stores/useUserStore";
import { NOTIFICATION_LIST_LIMIT } from "@/utils/constant";
import { Database } from "@/utils/database";
import { AppType, TeamTableRow } from "@/utils/types";
import { AppShell, useMantineTheme } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { capitalize } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useBeforeunload } from "react-beforeunload";
import Header from "./Header/Header";
import Navbar from "./Navbar/Navbar";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const currentUser = useUser();
  const userId = currentUser?.id;

  const theme = useMantineTheme();
  const router = useRouter();
  const supabaseClient = createPagesBrowserClient<Database>();

  const activeApp = useActiveApp();
  const { setTeamList, setActiveTeam, setActiveApp } = useTeamActions();
  const { setFormList } = useFormActions();
  const { setUserAvatar, setUserInitials, setUserTeamMember, setUserProfile } =
    useUserActions();
  const { setNotificationList, setUnreadNotification } =
    useNotificationActions();

  const [openNavbar, setOpenNavbar] = useState(false);

  useEffect(() => {
    setOpenNavbar(false);
  }, [router]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!userId) return;
      try {
        // fetch all the team where the user is a part of
        const data = await getAllTeamOfUser(supabaseClient, {
          userId: userId,
        });
        const teamList = data as TeamTableRow[];

        // fetch the current active team of the user
        const user = await getUser(supabaseClient, {
          userId: userId,
        });

        //set user profile
        setUserProfile(user);

        // set the user's active app
        let activeApp = "";
        if (router.pathname.includes("team-requests")) {
          activeApp = "REQUEST";
        } else if (router.pathname.includes("team-reviews")) {
          activeApp = "REVIEW";
        } else {
          activeApp = user.user_active_app;
        }

        setActiveApp(activeApp);

        let activeTeamId = "";
        if (teamList.length !== 0) {
          setTeamList(teamList);

          const userActiveTeam = teamList.find(
            (team) => team.team_id === user.user_active_team_id
          );

          // set the user's active team
          if (userActiveTeam) {
            activeTeamId = userActiveTeam.team_id;
            setActiveTeam(userActiveTeam);
          } else {
            activeTeamId = teamList[0].team_id;
            setActiveTeam(teamList[0]);
          }

          // fetch form list of active team
          const formList = await getFormList(supabaseClient, {
            teamId: activeTeamId,
            app: user.user_active_app,
          });

          // set form list
          setFormList(formList);

          // fetch user team member id
          const teamMember = await getUserTeamMemberData(supabaseClient, {
            teamId: activeTeamId,
            userId: user.user_id,
          });
          // set user team member id
          if (teamMember) {
            setUserTeamMember(teamMember);
          }
        }

        // set user avatar and initials
        setUserAvatar(user.user_avatar);
        setUserInitials(
          `${capitalize(user.user_first_name[0])}${capitalize(
            user.user_last_name[0]
          )}`
        );

        // fetch notification list
        const { data: notificationList, count: unreadNotificationCount } =
          await getAllNotification(supabaseClient, {
            userId: user.user_id,
            app: activeApp as AppType,
            page: 1,
            limit: NOTIFICATION_LIST_LIMIT,
            teamId: activeTeamId,
          });

        // set notification
        setNotificationList(notificationList);
        setUnreadNotification(unreadNotificationCount || 0);
      } catch (e) {
        console.error(e);
        notifications.show({
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
        router.push("/500");
      }
    };

    fetchInitialData();
  }, [userId]);

  useBeforeunload(async () => {
    if (activeApp && userId) {
      await updateUserActiveApp(supabaseClient, {
        app: activeApp,
        userId: userId,
      });
    }
  });

  return (
    <AppShell
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
          position: "relative",
          width: "0",
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
