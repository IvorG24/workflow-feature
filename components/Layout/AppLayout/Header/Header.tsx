import {
  useNotificationActions,
  useNotificationList,
} from "@/stores/useNotificationStore";
import { useActiveApp } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { NotificationTableRow } from "@/utils/types";
import {
  Box,
  Burger,
  Header as MantineHeader,
  MediaQuery,
  Skeleton,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { lowerCase } from "lodash";
import Image from "next/image";
import { useRouter } from "next/router";
import { MouseEventHandler, useEffect } from "react";
import HeaderMenu from "./HeaderMenu";

type HeaderProps = {
  openNavbar: boolean;
  setOpenNavbar: MouseEventHandler<HTMLButtonElement>;
};

const Header = ({ openNavbar, setOpenNavbar }: HeaderProps) => {
  const theme = useMantineTheme();
  const activeApp = useActiveApp();
  const router = useRouter();
  const user = useUserTeamMember();
  const supabaseClient = createPagesBrowserClient<Database>();
  const { setNotificationList, setUnreadNotification } =
    useNotificationActions();
  const notificationList = useNotificationList();

  useEffect(() => {
    if (!user) return;
    const channel = supabaseClient
      .channel("realtime-notification")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notification_table",
          filter: `notification_user_id=eq.${user.team_member_user_id}`,
        },
        (payload) => {
          console.log("new notification detected");
          const updatedNotificationList = [
            payload.new as NotificationTableRow,
            ...notificationList,
          ];
          const unreadNotificationCount = updatedNotificationList.filter(
            (notification) => !notification.notification_is_read
          ).length;

          setNotificationList(updatedNotificationList);
          setUnreadNotification(unreadNotificationCount);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [supabaseClient, user, notificationList]);

  return (
    <MantineHeader height={{ base: 50, md: 70 }} p="md">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          height: "100%",
          justifyContent: "space-between",
        }}
      >
        <MediaQuery largerThan="sm" styles={{ display: "none" }}>
          <Burger
            opened={openNavbar}
            onClick={setOpenNavbar}
            size="sm"
            color={theme.colors.gray[6]}
            mr="xl"
          />
        </MediaQuery>

        {!activeApp ? <Skeleton width={127} height={45} /> : null}
        {activeApp ? (
          <UnstyledButton
            onClick={() =>
              router.push(`/team-${lowerCase(activeApp)}s/dashboard`)
            }
          >
            <Image
              src={`/logo-${lowerCase(activeApp)}-${lowerCase(
                theme.colorScheme
              )}.svg`}
              width={127}
              height={45}
              alt="Formsly Logo"
            />
          </UnstyledButton>
        ) : null}
        <HeaderMenu />
      </Box>
    </MantineHeader>
  );
};

export default Header;
