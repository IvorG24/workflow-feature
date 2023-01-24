import {
  ActionIcon,
  Autocomplete,
  Box,
  Burger,
  createStyles,
  Group,
  Header,
  MediaQuery,
  Tooltip,
} from "@mantine/core";
import { IconBell, IconPlus, IconSearch } from "@tabler/icons";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";
import { Brand } from "../Navbar/Brand";

export type FormslyHeaderProps = {
  opened: boolean;
  setOpened: Dispatch<SetStateAction<boolean>>;
};

const useStyles = createStyles((theme) => ({
  link: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    }),
  },
}));

function FormslyHeader({ opened, setOpened }: FormslyHeaderProps) {
  //   const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
  //     useDisclosure(false);
  //   const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const { classes, theme } = useStyles();
  const router = useRouter();

  const links = [
    {
      label: "Requests",
      url: `/teams/${router.query.teamName}/requests}`,
    },
    {
      label: "Analytics",
      url: `/teams/${router.query.teamName}/analytics}`,
    },
    {
      label: "Environment Impact",
      url: `/teams/${router.query.teamName}/environment}`,
    },
  ];

  return (
    // <Header height={{ base: 50, md: 70 }} p="md">
    <Box>
      <Header height={60} px="md">
        <Group position="apart" sx={{ height: "100%" }}>
          {/* Original */}
          {/* <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            className={classes.hiddenDesktop}
          /> */}
          <MediaQuery largerThan="md" styles={{ display: "none" }}>
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              size="sm"
              color={theme.colors.gray[6]}
              mr="xl"
            />
          </MediaQuery>
          <MediaQuery smallerThan="md" styles={{ display: "none" }}>
            <Group sx={{ height: "100%" }} spacing="sm">
              <Brand />
              <Autocomplete
                placeholder="Find a filled out form..."
                icon={<IconSearch size={16} stroke={1.5} />}
                data={[]}
                zIndex={1000}
              />
            </Group>
          </MediaQuery>
          <MediaQuery smallerThan="md" styles={{ display: "none" }}>
            <Group sx={{ height: "100%" }} spacing={0}>
              {links.map((link) => (
                <a
                  key={link.label}
                  //   href="#"
                  onClick={() => router.push(link.url)}
                  className={classes.link}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  {link.label}
                </a>
              ))}
            </Group>
          </MediaQuery>
          <Group spacing={0} position="right">
            <Tooltip label="Notifications">
              <ActionIcon
                size="lg"
                onClick={() => router.push("/notifications")}
              >
                <IconBell size={18} stroke={1.5} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Fill out a form">
              <ActionIcon
                size="lg"
                onClick={() =>
                  router.push(`/teams/${router.query.teamName}/requests/create`)
                }
              >
                <IconPlus size={18} stroke={1.5} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Header>
    </Box>
  );
}

export default FormslyHeader;
