// todo: create test for #61
import { Burger, Container, Group, useMantineColorScheme } from "@mantine/core";
import Image from "next/image";
import { useState } from "react";
import styles from "./MobileHeader.module.scss";
import MobileNavbar from "./MobileNavbar";

const MobileHeader = () => {
  const { colorScheme } = useMantineColorScheme();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Group
      position="apart"
      className={`${styles.container} ${
        colorScheme === "light" ? styles.lightContainer : styles.darkContainer
      }`}
    >
      <Container fluid w={0} className={isOpen ? styles.open : styles.close}>
        <MobileNavbar
          opened={isOpen}
          onToggleOpened={() => setIsOpen((prev) => !prev)}
        />
      </Container>

      <Image
        src={`/image/logo-${colorScheme}.png`}
        alt="logo"
        width={147}
        height={52}
      />

      <Burger
        opened={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        transitionDuration={0}
      />
    </Group>
  );
};

export default MobileHeader;
