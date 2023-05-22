import { useStore } from "@/utils/store";
import { Navbar as MantineNavbar, Skeleton, Stack } from "@mantine/core";
import FormList from "./FormList";
import NavLink from "./NavLink";
import SelectTeam from "./SelectTeam";

type NavbarProps = {
  openNavbar: boolean;
};

const Navbar = ({ openNavbar }: NavbarProps) => {
  const store = useStore();
  return (
    <MantineNavbar
      p="md"
      hiddenBreakpoint="sm"
      hidden={!openNavbar}
      width={{ sm: 200, lg: 300 }}
    >
      <Stack>
        <SelectTeam />
        {!store.activeApp ? (
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
        {store.activeApp ? (
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
