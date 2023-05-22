import { useActiveApp } from "@/stores/useTeamStore";
import { Navbar as MantineNavbar, Skeleton, Stack } from "@mantine/core";
import FormList from "./FormList";
import NavLink from "./NavLink";
import SelectTeam from "./SelectTeam";

type NavbarProps = {
  openNavbar: boolean;
};

const Navbar = ({ openNavbar }: NavbarProps) => {
  const activeApp = useActiveApp();

  return (
    <MantineNavbar
      p="md"
      hiddenBreakpoint="sm"
      hidden={!openNavbar}
      width={{ sm: 200, lg: 300 }}
    >
      <Stack>
        <SelectTeam />
        {!activeApp ? (
          <>
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
          </>
        ) : null}
        {activeApp ? (
          <>
            <NavLink />
            <FormList />
          </>
        ) : null}
      </Stack>
    </MantineNavbar>
  );
};

export default Navbar;
