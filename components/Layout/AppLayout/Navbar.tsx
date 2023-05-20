import { Navbar as MantineNavbar, Stack } from "@mantine/core";
import FormList from "../NavbarComponents/FormList";
import ReviewAppNavLinks from "../NavbarComponents/ReviewAppNavLink";
import SelectTeam from "../NavbarComponents/SelectTeam";

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
      <Stack>
        <SelectTeam />
        <ReviewAppNavLinks />
        <FormList />
      </Stack>
    </MantineNavbar>
  );
};

export default Navbar;
