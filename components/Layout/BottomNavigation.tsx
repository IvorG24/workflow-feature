import {
  Container,
  Flex,
  Stack,
  Text,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import { ReactNode } from "react";
import IconWrapper from "../IconWrapper/IconWrapper";

export type ILink = {
  href: string;
  icon: ReactNode | string;
  label?: string;
};

const BottomNavigation = ({ links }: { links: ILink[] }) => {
  const { colorScheme } = useMantineColorScheme();
  return (
    <Container
      p={0}
      bg={colorScheme === "dark" ? "dark" : "white"}
      w="100%"
      fluid
    >
      <Flex justify="space-around">
        {links.length > 0 &&
          links.map((link, idx) => (
            <UnstyledButton
              href={link.href}
              aria-label={link.label}
              component="a"
              key={idx}
            >
              <Stack align="center" spacing="xs">
                <IconWrapper fontSize={20}>{link.icon}</IconWrapper>
                <Text fz="xs">{link.label}</Text>
              </Stack>
            </UnstyledButton>
          ))}
      </Flex>
    </Container>
  );
};

export default BottomNavigation;
