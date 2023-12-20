import { useActiveApp, useTeamList } from "@/stores/useTeamStore";
import { Navbar as MantineNavbar, Skeleton, Stack } from "@mantine/core";
import { useScrollLock } from "@mantine/hooks";
import NavLink from "./NavLink";
import SelectTeam from "./SelectTeam";

type NavbarProps = {
  openNavbar: boolean;
};

const Navbar = ({ openNavbar }: NavbarProps) => {
  const activeApp = useActiveApp();
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
      {hasTeam ? <SelectTeam /> : null}
      {!activeApp && hasTeam ? (
        <Stack>
          <Stack spacing={5}>
            <Skeleton height={20} width={60} />
            <Skeleton height={30} />
          </Stack>
          <Stack spacing={5}>
            <Skeleton height={20} width={60} />
            <Skeleton height={30} />
            <Skeleton height={30} />
          </Stack>
          <Stack spacing={5}>
            <Skeleton height={20} width={60} />
            <Skeleton height={30} />
            <Skeleton height={30} />
            <Skeleton height={30} />
            <Skeleton height={30} />
          </Stack>
        </Stack>
      ) : null}
      {activeApp ? (
        <>
          <NavLink />
          {/* {!isEmpty(activeTeam) && hasTeam ? <FormList /> : null} */}
        </>
      ) : null}
    </MantineNavbar>
  );
};

export default Navbar;
