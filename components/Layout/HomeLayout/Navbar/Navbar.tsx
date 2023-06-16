import { DEFAULT_LANDING_PAGE } from "@/utils/constant";
import {
  Button,
  Navbar as MantineNavbar,
  MediaQuery,
  NavLink,
  Stack,
} from "@mantine/core";
import { useUser } from "@supabase/auth-helpers-react";
import { IconCash, IconHome, IconPhone, IconStar } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { MouseEventHandler } from "react";

const links = [
  {
    label: "Home",
    icon: <IconHome />,
    href: `/`,
  },
  {
    label: "Features",
    icon: <IconStar color="gray" />,
    href: `/`,
  },
  {
    label: "Pricing",
    icon: <IconCash color="gray" />,
    href: `/`,
  },
  {
    label: "Contact Us",
    icon: <IconPhone color="gray" />,
    href: `/`,
  },
];

type NavbarProps = {
  openNavbar: boolean;
  setOpenNavbar: MouseEventHandler<HTMLButtonElement>;
};

const Navbar = ({ openNavbar, setOpenNavbar }: NavbarProps) => {
  const router = useRouter();
  const user = useUser();

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
          {user ? (
            <Button onClick={() => router.push(DEFAULT_LANDING_PAGE)}>
              Go to Formsly
            </Button>
          ) : null}
          {!user ? (
            <>
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
            </>
          ) : null}
        </Stack>
      </MantineNavbar>
    </MediaQuery>
  );
};

export default Navbar;
