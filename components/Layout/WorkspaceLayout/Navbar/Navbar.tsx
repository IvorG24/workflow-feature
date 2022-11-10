import { useState } from "react";
import { Navbar as MantineNavbar, Select, Avatar } from "@mantine/core";
import Image from "next/image";
import {
  ActionIcon,
  useMantineColorScheme,
  Divider,
  Group,
} from "@mantine/core";
// import styles from "./Navbar.module.scss";

type WorkspaceOption = {
  value: "string";
  label: "string";
};

const WORKSPACES = [
  { value: "Acme Corporation", label: "Acme Corporation" },
  { value: "Wonka Industries", label: "Wonka Industries" },
];

const Navbar = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [workspaceDropdownValue, setWorkspaceDropdownValue] = useState<
    string | null
  >(WORKSPACES[0].value);

  return (
    <MantineNavbar width={{ base: 300 }} p="md">
      <MantineNavbar.Section>
        <Group position="apart">
          <Image
            src={`/images/logo-${
              colorScheme === "dark" ? "light" : "dark"
            }.png`}
            alt="Logo"
            width={150}
            height={48}
          />
          <ActionIcon variant="default" onClick={() => toggleColorScheme()}>
            <Image
              src={
                colorScheme === "dark"
                  ? "/icons/moon-stars-light.png"
                  : "/icons/sun-dark.png"
              }
              alt="toggle dark mode"
              width={20}
              height={20}
            />
          </ActionIcon>
        </Group>
      </MantineNavbar.Section>

      <Divider mt="xs" />

      <Select
        mt="md"
        label="Workspace"
        value={workspaceDropdownValue}
        data={WORKSPACES}
        onChange={(val) => setWorkspaceDropdownValue(val)}
        icon={<Avatar radius="xl" size="sm" />}
        size="md"
      />
    </MantineNavbar>
  );
};

export default Navbar;
