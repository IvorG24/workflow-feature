import { Header as MantineHeader } from "@mantine/core";
import Image from "next/image";
import { Container, Group, Button } from "@mantine/core";
import styles from "./Header.module.scss";
import { Sun } from "components/icons";

const Header = () => {
  return (
    <MantineHeader height={60} className={styles.header}>
      <Container fluid m={0}>
        <Group align="center">
          <Image src="/images/logo.png" alt="Logo" width={150} height={48} />
          <Button
            variant="default"
            size="xs"
            px="xs"
            className={styles.darkmodeToggle}
          >
            <div className={styles.icon}>
              <Sun />
            </div>
          </Button>
        </Group>
      </Container>
    </MantineHeader>
  );
};

export default Header;
