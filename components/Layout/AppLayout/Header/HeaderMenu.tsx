import { getFormList, getNotification } from "@/backend/api/get";
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
  useUserTeamMemberId,
} from "@/stores/useUserStore";
import { NOTIFICATION_LIST_LIMIT } from "@/utils/contant";
import { Database } from "@/utils/database";
import { TEMP_USER_ID } from "@/utils/dummyData";
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
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
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
  const supabaseClient = createBrowserSupabaseClient<Database>();

  const activeApp = useActiveApp();
  const activeTeam = useActiveTeam();
  const userAvatar = useUserAvatar();
  const userInitials = useUserIntials();
  const unreadNotificationCount = useUnreadNotificationCount();
  const teamMemberId = useUserTeamMemberId();
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
        : "/team-requests/requests"
    );

    // fetch form list
    const formList = await getFormList(supabaseClient, {
      teamId: activeTeam.team_id,
      app: newActiveApp,
    });

    // set form list
    setFormList(formList);

    // fetch notification list
    const { data: notificationList, count: unreadNotificationCount } =
      await getNotification(supabaseClient, {
        memberId: teamMemberId,
        app: newActiveApp as AppType,
        page: 1,
        limit: NOTIFICATION_LIST_LIMIT,
      });

    // set notification
    setNotificationList(notificationList);
    setUnreadNotification(unreadNotificationCount || 0);
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
              color={getAvatarColor(Number(`${TEMP_USER_ID.charCodeAt(1)}`))}
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
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
};

export default HeaderMenu;
