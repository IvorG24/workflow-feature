import { getFormList } from "@/backend/api/get";
import { Database } from "@/utils/database";
import { useStore } from "@/utils/store";
import {
  ActionIcon,
  Avatar,
  Box,
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

const HeaderMenu = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const store = useStore();
  const router = useRouter();
  const supabaseClient = createBrowserSupabaseClient<Database>();

  const handleSwitchApp = async () => {
    const activeApp = store.activeApp;
    store.setActiveApp(activeApp === "REQUEST" ? "REVIEW" : "REQUEST");
    router.push(
      activeApp === "REQUEST"
        ? "/team-reviews/reviews"
        : "/team-requests/requests"
    );

    const formList = await getFormList(supabaseClient, {
      teamId: store.activeTeam.team_id,
      app: activeApp === "REQUEST" ? "REVIEW" : "REQUEST",
    });
    store.setFormList(formList);
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
          <Indicator disabled={false} size="xs" color="red" label={1}>
            <ActionIcon p={4}>
              <IconBell />
            </ActionIcon>
          </Indicator>
        </Menu.Target>
        <Menu.Dropdown>
          <Box sx={{ height: 100 }}></Box>
        </Menu.Dropdown>
      </Menu>

      <Menu shadow="md" width={200} position="bottom-end" withArrow>
        <Menu.Target data-cy="header-account-button">
          <ActionIcon>
            <Avatar size={28}></Avatar>
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
