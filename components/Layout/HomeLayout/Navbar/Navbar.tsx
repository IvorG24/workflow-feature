import {
  ActionIcon,
  Button,
  Navbar as MantineNavbar,
  MediaQuery,
  NavLink,
  Stack,
} from "@mantine/core";
import { IconCash, IconHome, IconPhone, IconStar } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { MouseEventHandler } from "react";

const links = [
  {
    label: "Home",
    icon: (
      <ActionIcon variant="transparent" ml="xs">
        <IconHome />
      </ActionIcon>
    ),
    href: `/`,
  },
  {
    label: "Features",
    icon: (
      <ActionIcon variant="transparent" ml="xs">
        <IconStar />
      </ActionIcon>
    ),
    href: `/`,
  },
  {
    label: "Pricing",
    icon: (
      <ActionIcon variant="transparent" ml="xs">
        <IconCash />
      </ActionIcon>
    ),
    href: `/`,
  },
  {
    label: "Contact Us",
    icon: (
      <ActionIcon variant="transparent" ml="xs">
        <IconPhone />
      </ActionIcon>
    ),
    href: `/`,
  },
];

type NavbarProps = {
  openNavbar: boolean;
  setOpenNavbar: MouseEventHandler<HTMLButtonElement>;
};

const Navbar = ({ openNavbar, setOpenNavbar }: NavbarProps) => {
  const router = useRouter();

  return (
    <MediaQuery largerThan="sm" styles={{ display: "none" }}>
      <MantineNavbar
        p="md"
        hiddenBreakpoint="sm"
        hidden={!openNavbar}
        width={{ sm: 200, lg: 300 }}
      >
        <Stack spacing={0}>
          {links.map((link, idx) => (
            <NavLink
              label={link.label}
              style={{ borderRadius: 5 }}
              icon={link.icon ? link.icon : null}
              key={`navLink-${idx}`}
              px="xl"
              onClick={(e) => {
                router.push(link.href);
                setOpenNavbar(e);
              }}
            />
          ))}
        </Stack>
        <Stack mt="md">
          <Button
            variant="outline"
            onClick={(e) => {
              router.push("/sign-in");
              setOpenNavbar(e);
            }}
          >
            Log in
          </Button>
          <Button
            onClick={(e) => {
              router.push("/sign-up");
              setOpenNavbar(e);
            }}
          >
            Sign up
          </Button>
        </Stack>
      </MantineNavbar>
    </MediaQuery>
  );
};

export default Navbar;
