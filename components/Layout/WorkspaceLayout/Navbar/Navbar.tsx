import { Navbar as MantineNavbar } from "@mantine/core";
import Image from "next/image";
import { ActionIcon, useMantineColorScheme, Divider } from "@mantine/core";
import styles from "./Navbar.module.scss";

const Navbar = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <MantineNavbar width={{ base: 300 }} p="md">
      <MantineNavbar.Section className={styles.header}>
        <Image
          src={`/images/logo-${colorScheme === "dark" ? "light" : "dark"}.png`}
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
      </MantineNavbar.Section>

      <Divider mt="xs" />
    </MantineNavbar>
  );
};

export default Navbar;
