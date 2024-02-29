import { useTeamList } from "@/stores/useTeamStore";
import { Navbar as MantineNavbar, ScrollArea } from "@mantine/core";
import { useScrollLock } from "@mantine/hooks";
import NavLink from "./NavLink";
import SelectTeam from "./SelectTeam";

type NavbarProps = {
  openNavbar: boolean;
};

const Navbar = ({ openNavbar }: NavbarProps) => {
  useScrollLock(openNavbar);
  const teamList = useTeamList();
  const hasTeam = teamList.length > 0;

  return (
    <MantineNavbar
      p="md"
      hiddenBreakpoint="sm"
      hidden={!openNavbar}
      width={{ sm: 200, lg: 300 }}
    >
      <ScrollArea offsetScrollbars={false} scrollbarSize={10}>
        {hasTeam ? <SelectTeam /> : null}
        <NavLink />
      </ScrollArea>
    </MantineNavbar>
  );
};

export default Navbar;
