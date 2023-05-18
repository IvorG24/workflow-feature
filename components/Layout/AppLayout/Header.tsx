import {
  Box,
  Burger,
  Header as MantineHeader,
  MediaQuery,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { MouseEventHandler } from "react";

type HeaderProps = {
  openNavbar: boolean;
  setOpenNavbar: MouseEventHandler<HTMLButtonElement>;
};

const Header = ({ openNavbar, setOpenNavbar }: HeaderProps) => {
  const theme = useMantineTheme();

  return (
    <MantineHeader height={{ base: 50, md: 70 }} p="md">
      <Box style={{ display: "flex", alignItems: "center", height: "100%" }}>
        <MediaQuery largerThan="sm" styles={{ display: "none" }}>
          <Burger
            opened={openNavbar}
            onClick={setOpenNavbar}
            size="sm"
            color={theme.colors.gray[6]}
            mr="xl"
          />
        </MediaQuery>

        <Text>Formsly Header</Text>
      </Box>
    </MantineHeader>
  );
};

export default Header;
