import { GetTeamFormList, GetUserTeamList } from "@/utils/queries";
import {
  Autocomplete,
  Box,
  Button,
  createStyles,
  Group,
  Navbar,
  ScrollArea,
  Text,
} from "@mantine/core";
import { IconHammer, IconSearch } from "@tabler/icons";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";
import NavbarLink from "./NavbarLink";
import TeamButton from "./TeamButton";

export type FormslyNavbarProps = {
  opened: boolean;
  setOpened: Dispatch<SetStateAction<boolean>>;
  teamList: GetUserTeamList;
  formList: GetTeamFormList;
  handleSearchForm: (keyword: string) => void;
};

// const data = [
//   {
//     icon: <IconGitPullRequest size={16} />,
//     color: "blue",
//     label: "Pull Requests",
//   },
//   { icon: <IconAlertCircle size={16} />, color: "teal", label: "Open Issues" },
//   { icon: <IconMessages size={16} />, color: "violet", label: "Discussions" },
//   { icon: <IconDatabase size={16} />, color: "grape", label: "Databases" },
// ];

const useStyles = createStyles((theme) => ({
  searchCode: {
    fontWeight: 700,
    fontSize: 10,
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[7]
        : theme.colors.gray[0],
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[2]
    }`,
  },
  formTemplates: {
    // underline if hovered
    "&:hover": {
      textDecoration: "underline",
    },
    // sttyle cursor
    cursor: "pointer",
  },
}));

function FormslyNavbar({
  opened,
  setOpened,
  teamList,
  formList,
  handleSearchForm,
}: FormslyNavbarProps) {
  const { classes } = useStyles();
  const router = useRouter();

  const handleBuildForm = async () => {
    await router.push(`/teams/${router.query.teamName as string}/forms/build`);
    setOpened(false);
  };

  const handleChangeTeam = async (teamName: string) => {
    if (teamName === "manage team") {
      await router.push(
        `/teams/${router.query.teamName as string}/settings/profile`
      );
      setOpened(false);
      return;
    }

    if (teamName === "create team") {
      await router.push(`/teams/create`);
      setOpened(false);
      return;
    }

    const team = teamList.find((team) => team.team_name === teamName);
    if (team) {
      // setActiveTeam(team);
      await router.push(`/teams/${team.team_name as string}`);
      router.reload();
      setOpened(false);
    }
  };

  return (
    // Original
    // <Navbar height={600} p="xs" width={{ base: 300 }}>
    <Navbar
      p="md"
      hiddenBreakpoint="md"
      hidden={!opened}
      width={{ sm: 200, lg: 300 }}
      style={{ height: "100%" }}
    >
      {/* <Navbar
      p="md"
      hiddenBreakpoint="md"
      hidden={!opened}
      width={{ sm: 200, lg: 300 }}
      style={{ height: "100%" }}
    > */}
      <Navbar.Section>
        <TeamButton
          teamList={teamList}
          activeTeamIndex={teamList.findIndex(
            (e) => e.team_name === router.query.teamName
          )}
          handleChangeTeam={handleChangeTeam}
        />
      </Navbar.Section>
      {/* <Navbar.Section mt="xs">
        <Brand />
      </Navbar.Section> */}
      <Navbar.Section mt="xs">
        <Group position="apart">
          <Text
            fz="xl"
            c="dimmed"
            fw="bolder"
            className={classes.formTemplates}
            onClick={() => router.push(`/teams/${router.query.teamName}/forms`)}
          >
            Forms
          </Text>
          <Button
            onClick={handleBuildForm}
            size="xs"
            leftIcon={<IconHammer size={14} />}
          >
            Build form
          </Button>
        </Group>
      </Navbar.Section>
      <Navbar.Section mt="xs">
        <Autocomplete
          placeholder="Find a form..."
          size="xs"
          icon={<IconSearch size={12} stroke={1.5} />}
          rightSectionWidth={70}
          styles={{ rightSection: { pointerEvents: "none" } }}
          onChange={handleSearchForm}
          data={formList.map((form) => form.form_name) as string[]}
        />
      </Navbar.Section>

      <Navbar.Section grow component={ScrollArea} mx="-xs" px="xs">
        <Box py="md">
          {formList.map((form) => {
            return (
              <NavbarLink
                label={form.form_name as string}
                key={form.form_id}
                setOpened={setOpened}
              />
            );
          })}
        </Box>
      </Navbar.Section>
    </Navbar>
  );
}

export default FormslyNavbar;
