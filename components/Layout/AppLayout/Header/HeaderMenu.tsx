import { getAllNotification, getFormList } from "@/backend/api/get";
import { useFormActions } from "@/stores/useFormStore";
import {
  useNotificationActions,
  useUnreadNotificationCount,
} from "@/stores/useNotificationStore";
import {
  useActiveApp,
  useActiveTeam,
  useTeamActions,
} from "@/stores/useTeamStore";
import {
  useUserAvatar,
  useUserIntials,
  useUserProfile,
} from "@/stores/useUserStore";
import { NOTIFICATION_LIST_LIMIT, SIGN_IN_PAGE_PATH } from "@/utils/constant";
import { Database } from "@/utils/database";
import { getAvatarColor } from "@/utils/styling";
import { AppType } from "@/utils/types";
import {
  ActionIcon,
  Avatar,
  Divider,
  Group,
  Indicator,
  Menu,
  useMantineColorScheme,
} from "@mantine/core";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import {
  IconBell,
  IconLogout,
  IconMoonStars,
  IconSun,
  IconSwitch2,
  IconUserCircle,
} from "@tabler/icons-react";
import { startCase } from "lodash";
import { useRouter } from "next/router";
import Notification from "./Notification";

const HeaderMenu = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const router = useRouter();
  const supabaseClient = createPagesBrowserClient<Database>();

  const activeApp = useActiveApp();
  const activeTeam = useActiveTeam();
  const userAvatar = useUserAvatar();
  const userInitials = useUserIntials();
  const unreadNotificationCount = useUnreadNotificationCount();
  const user = useUserProfile();
  const { setActiveApp } = useTeamActions();
  const { setFormList } = useFormActions();
  const { setNotificationList, setUnreadNotification } =
    useNotificationActions();

  const handleSwitchApp = async () => {
    const newActiveApp = activeApp === "REQUEST" ? "REVIEW" : "REQUEST";

    setActiveApp(newActiveApp);
    router.push(
      activeApp === "REQUEST"
        ? "/team-reviews/reviews"
        : "/team-requests/dashboard"
    );

    // fetch form list
    const formList = await getFormList(supabaseClient, {
      teamId: activeTeam.team_id,
      app: newActiveApp,
    });

    // set form list
    setFormList(formList);

    if (user) {
      // fetch notification list
      const { data: notificationList, count: unreadNotificationCount } =
        await getAllNotification(supabaseClient, {
          userId: user.user_id,
          app: newActiveApp as AppType,
          page: 1,
          limit: NOTIFICATION_LIST_LIMIT,
          teamId: activeTeam.team_id,
        });

      // set notification
      setNotificationList(notificationList);
      setUnreadNotification(unreadNotificationCount || 0);
    }
  };

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    await router.push(SIGN_IN_PAGE_PATH);
  };

  return (
    <Group spacing={16}>
      <Menu
        shadow="xs"
        width={300}
        radius={0}
        closeOnItemClick={false}
        position="bottom-end"
      >
        <Menu.Target>
          <Indicator
            disabled={false}
            size="xs"
            color="red"
            label={unreadNotificationCount || ""}
          >
            <ActionIcon p={4}>
              <IconBell />
            </ActionIcon>
          </Indicator>
        </Menu.Target>
        <Menu.Dropdown>
          <Notification />
        </Menu.Dropdown>
      </Menu>

      <Menu shadow="md" width={200} position="bottom-end" withArrow>
        <Menu.Target data-cy="header-account-button">
          <ActionIcon>
            <Avatar
              size={28}
              src={userAvatar}
              color={getAvatarColor(Number(`${user?.user_id.charCodeAt(0)}`))}
            >
              {userInitials}
            </Avatar>
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Account</Menu.Label>
          <Menu.Item
            icon={<IconUserCircle size={14} />}
            data-cy="header-profile-page-button"
            onClick={() => router.push("/user/settings")}
          >
            Profile
          </Menu.Item>

          <Menu.Label>Appearance</Menu.Label>
          <Menu.Item
            onClick={() => toggleColorScheme()}
            icon={
              colorScheme === "dark" ? (
                <IconSun size={16} />
              ) : (
                <IconMoonStars size={16} />
              )
            }
          >
            {`${startCase(colorScheme === "dark" ? "light" : "dark")} Mode`}
          </Menu.Item>
          <Menu.Label>App</Menu.Label>
          <Menu.Item onClick={handleSwitchApp} icon={<IconSwitch2 size={16} />}>
            Switch App
          </Menu.Item>
          <Divider mt="sm" />
          <Menu.Item
            icon={<IconLogout size={14} />}
            data-cy="header-authentication-button-logout"
            onClick={handleLogout}
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
};

export default HeaderMenu;
