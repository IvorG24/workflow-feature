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
import { toLower } from "lodash";
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
}));

function FormslyNavbar({
  opened,
  teamList,
  formList,
  handleSearchForm,
}: FormslyNavbarProps) {
  // const { classes } = useStyles();
  const router = useRouter();

  const handleBuildForm = () => {
    router.push(
      `/teams/${toLower(router.query.teamName as string)}/forms/build`
    );
  };

  const handleChangeTeam = (teamName: string) => {
    const team = teamList.find((team) => team.team_name === teamName);
    if (team) {
      // setActiveTeam(team);
      router.push(`/teams/${toLower(team.team_name as string)}`);
    }
  };

  return (
    // Original
    // <Navbar height={600} p="xs" width={{ base: 300 }}>
    <Navbar
      p="md"
      hiddenBreakpoint="md"
      hidden={!opened}
      width={{ base: 300 }}
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
          <Text fz="md">Form Templates</Text>
          <Button
            onClick={handleBuildForm}
            size="xs"
            leftIcon={<IconHammer size={14} />}
          >
            Build Form
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
              <NavbarLink label={form.form_name as string} key={form.form_id} />
            );
          })}
        </Box>
      </Navbar.Section>
    </Navbar>
  );
}

export default FormslyNavbar;
