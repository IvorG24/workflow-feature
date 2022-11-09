import { Header as MantineHeader } from "@mantine/core";
import { Container } from "@mantine/core";
import styles from "./Header.module.scss";
import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import Image from "next/image";

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
      </Container>
    </MantineHeader>
  );
};

export default Header;
