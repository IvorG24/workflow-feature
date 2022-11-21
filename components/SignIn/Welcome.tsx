import { Stack, Text, Title } from "@mantine/core";
import { Logo } from "../Icon";
import styles from "./SignIn.module.scss";

const Welcome = () => {
  return (
    <div className={styles.welcome}>
      <Stack style={{ maxWidth: "500px" }}>
        <div className={styles.logo}>
          <Logo />
        </div>
        <Title order={1}>Welcome to Formsly</Title>
        <Text>
          We help businesses automate all their requests and processes with
          their teams
        </Text>
      </Stack>
    </div>
  );
};

export default Welcome;
