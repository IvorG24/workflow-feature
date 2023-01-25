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
  teamList: any[];
  formList: any[];
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
  setOpened,
  teamList,
  formList,
  handleSearchForm,
}: FormslyNavbarProps) {
  const { classes } = useStyles();
  const router = useRouter();

  const handleBuildForm = () => {
    router.push(`/teams/${toLower(router.query.teamName as string)}/forms/build`);
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
        <TeamButton teamList={teamList} />
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
        {/* <TextInput
          placeholder="Find a form..."
          size="xs"
          icon={<IconSearch size={12} stroke={1.5} />}
          rightSectionWidth={70}
          // rightSection={<Code className={classes.searchCode}>Ctrl + K</Code>}
          styles={{ rightSection: { pointerEvents: "none" } }}
          // mb="sm"
          onChange={handleSearchForm}
        /> */}

        <Autocomplete
          placeholder="Find a form..."
          size="xs"
          icon={<IconSearch size={12} stroke={1.5} />}
          rightSectionWidth={70}
          styles={{ rightSection: { pointerEvents: "none" } }}
          onChange={handleSearchForm}
          data={formList.map((form) => form.name)}
        />
      </Navbar.Section>

      <Navbar.Section grow component={ScrollArea} mx="-xs" px="xs">
        <Box py="md">
          {formList.map((form, i) => {
            // Circular index of i.
            // const circularIndex = i % data.length;
            return (
              <NavbarLink
                // color={data[circularIndex].color}
                // icon={data[circularIndex].icon}
                label={form.name}
                key={form.id}
              />
            );
          })}
          {/* <MainLinks />
          <MainLinks />
          <MainLinks />
          <MainLinks /> */}
        </Box>
      </Navbar.Section>
    </Navbar>
  );
}

export default FormslyNavbar;
