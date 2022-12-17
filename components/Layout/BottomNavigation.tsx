import {
  Center,
  Container,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import { ReactNode } from "react";
import IconWrapper from "../IconWrapper/IconWrapper";
import styles from "./BottomNavigation.module.scss";

export type ILink = {
  href: string;
  icon: ReactNode | string;
  label?: string;
};

const BottomNavigation = ({ links }: { links: ILink[] }) => {
  const { colorScheme } = useMantineColorScheme();
  return (
    <Container
      p="xs"
      bg={colorScheme === "dark" ? "dark" : "white"}
      className={styles.container}
    >
      {links.length > 0 &&
        links.map((link, idx) => (
          <UnstyledButton
            href={link.href}
            aria-label={link.label}
            component="a"
            key={idx}
          >
            <Center>
              <IconWrapper fontSize={20}>{link.icon}</IconWrapper>
            </Center>
          </UnstyledButton>
        ))}
    </Container>
  );
};

export default BottomNavigation;
