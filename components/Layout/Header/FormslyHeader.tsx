import useFetchUserProfile from "@/hooks/useFetchUserProfile";
import { getRandomMantineColor } from "@/utils/styling";
import {
  ActionIcon,
  Avatar,
  Burger,
  createStyles,
  Group,
  Header,
  MediaQuery,
  Menu,
  Tooltip,
} from "@mantine/core";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import {
  IconBell,
  IconLogout,
  IconMail,
  IconSettings,
  IconUserCircle,
} from "@tabler/icons";
import { startCase } from "lodash";
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
  menu: {
    // styles cursor
  },
}));

function FormslyHeader({ opened, setOpened }: FormslyHeaderProps) {
  //   const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
  //     useDisclosure(false);
  //   const [linkListOpened, { toggle: togglelinkList }] = useDisclosure(false);
  const { classes, theme } = useStyles();
  const router = useRouter();
  // const [keyword, setKeyword] = useState("");
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const { userProfile } = useFetchUserProfile(user?.id);

  const linkList = [
    {
      label: "Requests",
      url: `/teams/${router.query.teamName}/requests`,
    },
    {
      label: "Analytics",
      url: `/teams/${router.query.teamName}/analytics`,
    },
    {
      label: "Environmental Impact",
      url: `/teams/${router.query.teamName}/environment-impact`,
    },
  ];

  // const handleSearchRequest = (keyword: string) => {
  //   router.push(`/teams/${router.query.teamName}/requests?keyword=${keyword}`);
  // };

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    await router.push("/authentication");
  };

  // const handleCreateRequest = async () => {
  //   const teamFormList = await getTeamFormList(
  //     supabaseClient,
  //     router.query.teamName as string
  //   );

  //   if (teamFormList.length === 0) {
  //     showNotification({
  //       message: "Please create a form first",
  //       color: theme.colors.red[7],
  //     });
  //     return;
  //   }

  //   const formName = teamFormList[0].form_name;

  //   router.push(
  //     `/teams/${
  //       router.query.teamName as string
  //     }/requests/create?form=${formName}`
  //   );
  // };

  return (
    // <Header height={{ base: 50, md: 70 }} p="md">
    // <Box>
    <Header height={60} px="md">
      <Group position="apart" sx={{ height: "100%" }} noWrap>
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
          <Group sx={{ height: "100%" }} spacing="sm" noWrap>
            <Brand />
            {/* <Autocomplete
              placeholder="Find a request by title or description..."
              icon={<IconSearch size={16} stroke={1.5} />}
              data={keyword ? [{ label: keyword, value: keyword }] : []}
              zIndex={10000000000}
              onChange={setKeyword}
              onItemSubmit={(e) => {
                handleSearchRequest(e.value);
              }}
            /> */}
          </Group>
        </MediaQuery>
        {/* <MediaQuery largerThan="md" styles={{ display: "none" }}>
          <Group sx={{ height: "100%" }} spacing="sm" position="center">
            <Autocomplete
              placeholder="Find a request by title or description..."
              icon={<IconSearch size={16} stroke={1.5} />}
              data={keyword ? [{ label: keyword, value: keyword }] : []}
              zIndex={10000000000}
              onChange={setKeyword}
              onItemSubmit={(e) => {
                handleSearchRequest(e.value);
              }}
            />
          </Group>
        </MediaQuery> */}
        <MediaQuery smallerThan="md" styles={{ display: "none" }}>
          <Group sx={{ height: "100%" }} spacing={0} noWrap>
            {linkList.map((link) => (
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
        <Group spacing={0} position="right" noWrap>
          {/* <MediaQuery smallerThan="md" styles={{ display: "none" }}>
            <Tooltip label="Send request for approval">
              <Button
                onClick={handleCreateRequest}
                size="xs"
                leftIcon={<IconPlus size={14} />}
              >
                Create request
              </Button>
            </Tooltip>
          </MediaQuery> */}
          {/* <MediaQuery largerThan="md" styles={{ display: "none" }}>
            <Tooltip label="Fill out a form">
              <ActionIcon size="lg" onClick={handleCreateRequest}>
                <IconPlus size={18} stroke={1.5} />
              </ActionIcon>
            </Tooltip>
          </MediaQuery> */}
          <Tooltip label="Notifications">
            <ActionIcon
              size="lg"
              onClick={() =>
                router.push(
                  `/teams/${router.query.teamName as string}/notifications`
                )
              }
            >
              <IconBell size={18} stroke={1.5} />
            </ActionIcon>
          </Tooltip>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon>
                <Avatar
                  size="sm"
                  // src={userProfile?.user_avatar_filepath}
                  // alt={userProfile?.username || ""}
                  color={getRandomMantineColor()}
                >
                  {startCase(userProfile?.username?.charAt(0))}
                  {startCase(userProfile?.username?.charAt(1))}
                </Avatar>
                {/* <ActionIcon size="lg">
                <IconUserCircle size={18} stroke={1.5} />
              </ActionIcon> */}
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Account</Menu.Label>
              <Menu.Item
                onClick={() =>
                  router.push(
                    `/teams/${router.query.teamName as string}/users/${
                      userProfile?.username as string
                    }/profile`
                  )
                }
                icon={<IconUserCircle size={14} />}
              >
                Profile
              </Menu.Item>
              <Menu.Item
                onClick={() =>
                  router.push(
                    `/teams/${router.query.teamName as string}/users/${
                      userProfile?.username as string
                    }/settings/account`
                  )
                }
                icon={<IconSettings size={14} />}
              >
                Settings
              </Menu.Item>
              <Menu.Item
                onClick={() => router.push(`/team-invitations`)}
                icon={<IconMail size={14} />}
              >
                Team Invitations
              </Menu.Item>
              <Menu.Item onClick={handleLogout} icon={<IconLogout size={14} />}>
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </Header>
    // </Box>
  );
}

export default FormslyHeader;
