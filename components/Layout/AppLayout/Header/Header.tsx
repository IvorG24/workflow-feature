import useRealtimeNotificationList from "@/hooks/useRealtimeNotificationList";
import {
  useNotificationActions,
  useUnreadNotificationCount,
} from "@/stores/useNotificationStore";
import { useActiveApp } from "@/stores/useTeamStore";
import {
  Box,
  Burger,
  Header as MantineHeader,
  MediaQuery,
  Skeleton,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";

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

  const notificationList = useRealtimeNotificationList();
  const unreadNotificationCount = useUnreadNotificationCount();
  const { setNotificationList, setUnreadNotification } =
    useNotificationActions();

  useEffect(() => {
    setNotificationList(notificationList);
    setUnreadNotification(unreadNotificationCount);
  }, [notificationList, unreadNotificationCount]);

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
              router.push(`/team-${activeApp.toLowerCase()}s/dashboard`)
            }
          >
            <Image
              src={`/logo-${activeApp.toLowerCase()}-${theme.colorScheme.toLowerCase()}.svg`}
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
