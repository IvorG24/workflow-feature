import { Navbar as MantineNavbar, Text } from "@mantine/core";

type NavbarProps = {
  openNavbar: boolean;
};

const Navbar = ({ openNavbar }: NavbarProps) => {
  return (
    <MantineNavbar
      p="md"
      hiddenBreakpoint="sm"
      hidden={!openNavbar}
      width={{ sm: 200, lg: 300 }}
    >
      <Text>Formsly Navbar</Text>
    </MantineNavbar>
  );
};

export default Navbar;
