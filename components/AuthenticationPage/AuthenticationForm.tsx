import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  Paper,
  PaperProps,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useToggle } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { Provider } from "@supabase/supabase-js";
import { startCase } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  FacebookButton,
  GoogleButton,
  TwitterButton,
} from "./SocialButtonList/SocialButtonList";

type AuthenticationFormValues = {
  email: string;
  password: string;
  terms: boolean;
};

const AuthenticationForm = (props: PaperProps) => {
  const [type, toggle] = useToggle(["signIn", "register"]);
  const { supabaseClient, isLoading, session } = useSessionContext();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  const form = useForm<AuthenticationFormValues>({
    initialValues: {
      email: "",
      password: "",
      terms: true,
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      password: (val) =>
        val.length < 6 ? "Password should include at least 6 characters" : null,
    },
  });

  useEffect(() => {
    setIsVerifying(true);
    if (!router.isReady) return;
    if (isLoading) return;
    if (session) {
      router.push("/");
      return;
    }
    setIsVerifying(false);
  }, [router, session, isLoading]);

  const handleOnSubmit = async (data: AuthenticationFormValues) => {
    try {
      setIsVerifying(true);
      const { email, password } = data;

      if (type === "signIn") {
        const { error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabaseClient.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      }

      await router.push("/");
    } catch (e) {
      console.error(e);
      showNotification({
        title: "Error",
        message: type === "signIn" ? "Sign In failed" : "Registration failed",
        color: "red",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const signInWithProvider = async (provider: Provider) => {
    try {
      setIsVerifying(true);
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: provider,
      });
      if (error) throw error;
    } catch (e) {
      console.error(e);
      showNotification({
        title: "Error",
        message: type === "signIn" ? "Sign In failed" : "Registration failed",
        color: "red",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Container p="xl" size="sm">
      <LoadingOverlay visible={isLoading || isVerifying} overlayBlur={2} />
      <Paper radius="md" p="xl" withBorder {...props}>
        <Text size="lg" weight={500}>
          Welcome to Mantine, {type} with
        </Text>

        <Group grow mb="md" mt="md">
          <GoogleButton
            onClick={() => signInWithProvider("google")}
            radius="xl"
          >
            Google
          </GoogleButton>
          <FacebookButton
            onClick={() => signInWithProvider("facebook")}
            radius="xl"
          >
            Facebook
          </FacebookButton>
          <TwitterButton
            onClick={() => signInWithProvider("twitter")}
            radius="xl"
          >
            Twitter
          </TwitterButton>
        </Group>

        <Divider
          label="Or continue with email"
          labelPosition="center"
          my="lg"
        />

        <form onSubmit={form.onSubmit(handleOnSubmit)}>
          <Stack>
            <TextInput
              required
              label="Email"
              placeholder="hello@mantine.dev"
              value={form.values.email}
              onChange={(event) =>
                form.setFieldValue("email", event.currentTarget.value)
              }
              error={form.errors.email && "Invalid email"}
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              value={form.values.password}
              onChange={(event) =>
                form.setFieldValue("password", event.currentTarget.value)
              }
              error={
                form.errors.password &&
                "Password should include at least 6 characters"
              }
            />

            {type === "register" && (
              <Checkbox
                label="I accept terms and conditions"
                checked={form.values.terms}
                onChange={(event) =>
                  form.setFieldValue("terms", event.currentTarget.checked)
                }
              />
            )}
          </Stack>

          <Group position="apart" mt="xl">
            <Anchor
              component="button"
              type="button"
              color="dimmed"
              onClick={() => toggle()}
              size="xs"
            >
              {type === "register"
                ? "Already have an account? Sign In"
                : "Don't have an account? Register"}
            </Anchor>
            <Button type="submit">{startCase(type)}</Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};

export default AuthenticationForm;
