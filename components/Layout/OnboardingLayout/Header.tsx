import { SIGN_IN_PAGE_PATH } from "@/utils/constant";
import { Database } from "@/utils/database";
import {
  ActionIcon,
  Box,
  Burger,
  Button,
  Flex,
  Group,
  Header as MantineHeader,
  MediaQuery,
  UnstyledButton,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconMoonStars, IconSun } from "@tabler/icons-react";
import { lowerCase } from "lodash";
import Image from "next/image";
import { useRouter } from "next/router";
import { MouseEventHandler } from "react";

type HeaderProps = {
  openNavbar: boolean;
  setOpenNavbar: MouseEventHandler<HTMLButtonElement>;
};

const Header = ({ openNavbar, setOpenNavbar }: HeaderProps) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const router = useRouter();
  const supabaseClient = createPagesBrowserClient<Database>();

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    await router.push(SIGN_IN_PAGE_PATH);
  };

  return (
    <MantineHeader height={{ base: 50, md: 70 }} px="md">
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

        <Flex h="100%" w="100%" align="center" justify="space-between">
          <Group>
            <UnstyledButton onClick={() => router.push("/")}>
              <Image
                src={`/logo-request-${lowerCase(theme.colorScheme)}.svg`}
                width={127}
                height={45}
                alt="Formsly Logo"
              />
            </UnstyledButton>
            <ActionIcon variant="light" onClick={() => toggleColorScheme()}>
              {colorScheme === "dark" ? (
                <IconSun size={16} />
              ) : (
                <IconMoonStars size={16} />
              )}
            </ActionIcon>
          </Group>
          <Button onClick={handleLogout}>Log out</Button>
        </Flex>
      </Box>
    </MantineHeader>
  );
};

export default Header;
