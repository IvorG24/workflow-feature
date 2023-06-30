import { useActiveApp, useActiveTeam } from "@/stores/useTeamStore";
import { Navbar as MantineNavbar, Skeleton, Stack } from "@mantine/core";
import { useScrollLock } from "@mantine/hooks";
import { isEmpty } from "lodash";
import FormList from "./FormList";
import NavLink from "./NavLink";
import SelectTeam from "./SelectTeam";

type NavbarProps = {
  openNavbar: boolean;
};

const Navbar = ({ openNavbar }: NavbarProps) => {
  const activeApp = useActiveApp();
  const activeTeam = useActiveTeam();
  useScrollLock(openNavbar);

  return (
    <MantineNavbar
      p="md"
      hiddenBreakpoint="sm"
      hidden={!openNavbar}
      width={{ sm: 200, lg: 300 }}
    >
      {!isEmpty(activeTeam) ? <SelectTeam /> : null}
      {!activeApp ? (
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
          {!isEmpty(activeTeam) ? <FormList /> : null}
        </>
      ) : null}
    </MantineNavbar>
  );
};

export default Navbar;
