// todo: create test for #61
import {
  Burger,
  Group,
  Transition,
  useMantineColorScheme,
} from "@mantine/core";
import Image from "next/image";
import { useState } from "react";
import styles from "./MobileHeader.module.scss";
import Navbar from "./MobileNavbar";

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
      <Transition
        mounted={isOpen}
        transition="slide-right"
        duration={400}
        timingFunction="ease"
      >
        {(transitionStyles) => (
          <div style={transitionStyles} className={styles.modal}>
            <Navbar />
          </div>
        )}
      </Transition>

      <Image
        src={`/image/logo-${colorScheme}.png`}
        alt="logo"
        width={147}
        height={52}
      />

      <Burger opened={isOpen} onClick={() => setIsOpen((prev) => !prev)} />
    </Group>
  );
};

export default MobileHeader;
