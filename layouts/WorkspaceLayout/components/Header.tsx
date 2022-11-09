import { Header as MantineHeader } from "@mantine/core";
import Image from "next/image";
import { Container, Group } from "@mantine/core";
import styles from "./Header.module.scss";

const Header = () => {
  return (
    <MantineHeader height={60} className={styles.header}>
      <Container fluid m={0}>
        <Group align="center">
          <Image src="/images/logo.png" alt="Logo" width={150} height={48} />
        </Group>
      </Container>
    </MantineHeader>
  );
};

export default Header;
