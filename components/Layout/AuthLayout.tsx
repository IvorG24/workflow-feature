import {
  Container,
  Flex,
  MantineProvider,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import { ReactNode } from "react";
import { Logo } from "../Icon";
import styles from "./AuthLayout.module.scss";

type Props = {
  children: ReactNode;
};

const AuthLayout = ({ children }: Props) => {
  const colorScheme = useColorScheme();
  return (
    <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
      <Flex styles={styles.auth}>
        <Container className={styles.welcome}>
          <Stack w={300}>
            <div className={styles.logo} data-testid="logo">
              <Logo />
            </div>
            <Title order={1} color="dark.6">
              Welcome to Formsly
            </Title>
            <Text color="gray.7">
              We help businesses automate all their requests and processes with
              their teams
            </Text>
          </Stack>
        </Container>
        {children}
      </Flex>
    </MantineProvider>
  );
};

export default AuthLayout;
