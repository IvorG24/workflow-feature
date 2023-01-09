import { Database } from "@/utils/database.types";
import {
  Button,
  Container,
  Divider,
  Flex,
  Notification,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Provider } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import validator from "validator";
import { Facebook, Github, Google } from "../Icon";
import styles from "./SignIn.module.scss";

type FormData = {
  email: string;
  password: string;
};

const SignIn = () => {
  const { colorScheme } = useMantineColorScheme();
  const [notification, setNotification] = useState<string | null>(null);
  const router = useRouter();
  const supabase = useSupabaseClient<Database>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { email, password } = data;
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setNotification(error.message);
        throw error;
      }
      await router.push("/");
    } catch (e) {
      console.error(e);
    }
  });

  const signInWithProvider = async (provider: Provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
      });

      if (error) {
        setNotification(error.message);
        throw error;
      }
      await router.push("/");
    } catch (e) {
      setNotification("Failed to sign in.");
      console.error(e);
    }
  };

  return (
    <>
      {notification !== null && (
        <Notification
          color="red"
          className={styles.notification}
          onClose={() => setNotification(null)}
        >
          {notification}
        </Notification>
      )}
      <Container
        className={styles.signin}
        style={{
          backgroundColor: colorScheme === "light" ? "#FFFFFF" : "#1A1B1E",
        }}
      >
        <form onSubmit={onSubmit} className={styles.form}>
          <Stack spacing="xs">
            <Title order={3}>Sign in</Title>
            <Text>You need to be signed in to start using Formsly.</Text>
            <>
              <TextInput
                label="Email"
                mt="lg"
                type="email"
                {...register("email", {
                  required: "Email address is required",
                  validate: {
                    isEmail: (input) =>
                      validator.isEmail(input) || "Email is invalid",
                  },
                })}
                error={errors.email?.message}
                data-cy="signin-input-email"
              />
              <TextInput
                label="Password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                error={errors.password?.message}
                data-cy="signin-input-password"
              />
            </>
            <Button
              mt={25}
              type="submit"
              color="green"
              aria-label="sign in with email and password"
              data-cy="signin-submit"
            >
              Sign In
            </Button>
          </Stack>
        </form>
        <Container className={styles.provider}>
          <Divider
            my="xs"
            label="Or sign in with"
            labelPosition="center"
            pt="lg"
          />
          <Flex gap="md" my="xl">
            <Button
              variant="outline"
              aria-label="sign in with google"
              color="gray.4"
              fullWidth
              onClick={() => signInWithProvider("google")}
              className={styles.google}
            >
              <Google />
            </Button>
            <Button
              variant="outline"
              aria-label="sign in with facebook"
              color="gray.4"
              fullWidth
              onClick={() => signInWithProvider("facebook")}
              className={styles.facebook}
            >
              <Facebook />
            </Button>
            <Button
              variant="outline"
              aria-label="sign in with github"
              color="gray.4"
              fullWidth
              onClick={() => signInWithProvider("github")}
              className={`${styles.github} ${
                colorScheme === "dark" ? styles.github__darkMode : ""
              }`}
            >
              <Github />
            </Button>
          </Flex>
        </Container>

        <Flex gap={5} justify="center" align="center" mt="lg">
          <Text>Do not have an account yet?</Text>
          <Link href="/register" data-cy="signin-link-register">
            <Text color="green">Register</Text>
          </Link>
        </Flex>
      </Container>
    </>
  );
};

export default SignIn;
