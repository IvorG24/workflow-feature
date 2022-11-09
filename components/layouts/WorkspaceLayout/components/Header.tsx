import { Header as MantineHeader } from "@mantine/core";
import Image from "next/image";
import { Container } from "@mantine/core";
import styles from "./Header.module.css";
import { Sun, MoonStars } from "components/icons";
import { ActionIcon, useMantineColorScheme } from "@mantine/core";

const Header = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <MantineHeader height={60} className={styles.header}>
      <Container fluid m={0} className={styles.inner}>
        <Image
          src={`/images/logo-${colorScheme === "dark" ? "light" : "dark"}.png`}
          alt="Logo"
          width={150}
          height={48}
        />
        <ActionIcon
          variant="default"
          onClick={() => toggleColorScheme()}
          aria-label="toggle dark mode"
        >
          {colorScheme === "dark" ? <MoonStars /> : <Sun />}
        </ActionIcon>
      </Container>
    </MantineHeader>
  );
};

export default Header;
