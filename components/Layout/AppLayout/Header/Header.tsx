import { useStore } from "@/utils/store";
import {
  Box,
  Burger,
  Header as MantineHeader,
  MediaQuery,
  Skeleton,
  useMantineTheme,
} from "@mantine/core";
import { lowerCase } from "lodash";
import Image from "next/image";
import { MouseEventHandler } from "react";
import HeaderMenu from "./HeaderMenu";

type HeaderProps = {
  openNavbar: boolean;
  setOpenNavbar: MouseEventHandler<HTMLButtonElement>;
};

const Header = ({ openNavbar, setOpenNavbar }: HeaderProps) => {
  const theme = useMantineTheme();
  const store = useStore();

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

        {!store.activeApp ? <Skeleton width={127} height={45} /> : null}
        {store.activeApp ? (
          <Image
            src={`/logo-${lowerCase(store.activeApp)}-${lowerCase(
              theme.colorScheme
            )}.svg`}
            width={127}
            height={45}
            alt="Formsly Logo"
          />
        ) : null}
        <HeaderMenu />
      </Box>
    </MantineHeader>
  );
};

export default Header;
