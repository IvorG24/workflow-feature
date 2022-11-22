import { Container, Flex, Stack, Text, Title } from "@mantine/core";
import { ReactNode } from "react";
import { Logo } from "../Icon";
import styles from "./Auth.module.scss";

type Props = {
  children: ReactNode;
};

const Auth = ({ children }: Props) => {
  return (
    <Flex styles={styles.auth}>
      <Container className={styles.welcome}>
        <Stack w={300}>
          <div className={styles.logo}>
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
  );
};

export default Auth;
