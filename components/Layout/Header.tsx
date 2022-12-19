import {
  ActionIcon,
  Burger,
  Flex,
  Group,
  Header as MantineHeader,
  MediaQuery,
  useMantineColorScheme,
} from "@mantine/core";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import SvgMoon from "../Icon/Moon";
import SvgSun from "../Icon/Sun";

type Props = {
  openNavbar: boolean;
  setOpenNavbar: Dispatch<SetStateAction<boolean>>;
};

const Header = ({ openNavbar, setOpenNavbar }: Props) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  return (
    <MantineHeader height={{ base: 60 }} p="sm">
      <Flex justify="space-between" align="center" h="100%" py="md">
        <Group>
          <Image
            src={`/image/logo-${colorScheme}.png`}
            alt="logo"
            width={147}
            height={52}
          />
          <ActionIcon
            variant="default"
            onClick={() => toggleColorScheme()}
            aria-label="toggle dark mode"
          >
            {colorScheme === "dark" ? <SvgSun /> : <SvgMoon />}
          </ActionIcon>
        </Group>
        <MediaQuery largerThan="sm" styles={{ display: "none" }}>
          <Burger
            opened={openNavbar}
            onClick={() => setOpenNavbar((prev) => !prev)}
            size="sm"
          />
        </MediaQuery>
      </Flex>
    </MantineHeader>
  );
};

export default Header;
