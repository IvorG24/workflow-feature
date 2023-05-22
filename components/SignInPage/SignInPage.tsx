import { signInUser } from "@/backend/api/post";
import {
  Anchor,
  Box,
  Button,
  Center,
  Container,
  Divider,
  LoadingOverlay,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import validator from "validator";
import SocialMediaButtonList from "../SocialMediaButtonList";

type SignInFormValues = {
  email: string;
  password: string;
};

const SignInPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>();

  const handleSignIn = async (data: SignInFormValues) => {
    try {
      setIsLoading(true);
      const signIn = await signInUser(supabaseClient, {
        email: data.email,
        password: data.password,
      });
      if (!signIn.user && !signIn.session) throw Error;
      notifications.show({
        message: "Sign in successful.",
        color: "green",
      });
      router.push("/onboarding");
    } catch (error) {
      notifications.show({
        title: "Something went wrong",
        message: "Please try again later",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container px={0} fluid>
      <Center mt={48}>
        <Paper p="md" w="100%" maw={360}>
          <LoadingOverlay visible={isLoading} overlayBlur={2} />
          <form onSubmit={handleSubmit(handleSignIn)}>
            <Title order={4} mb={8}>
              Sign in to Formsly
            </Title>
            <Stack>
              <TextInput
                placeholder="Enter your email address"
                label="Email"
                error={errors.email?.message}
                {...register("email", {
                  required:
                    "Email field cannot be empty. Please enter your email address.",
                  validate: (value) =>
                    validator.isEmail(value) ||
                    "Email is invalid. Please enter a valid email address.",
                })}
              />
              <Box>
                <PasswordInput
                  placeholder="Enter your password"
                  label="Password"
                  error={errors.password?.message}
                  {...register("password", {
                    required:
                      "Password field cannot be empty. Please enter your password.",
                  })}
                />
                <Text mt={8} size="xs" color="blue" align="right">
                  Forgot Password?
                </Text>
              </Box>
              <Button type="submit">Sign in</Button>
            </Stack>
          </form>
          <Anchor
            w="100%"
            component="button"
            mt="md"
            size="xs"
            align="center"
            onClick={() => router.push("/sign-up")}
          >
            Not yet registered? Sign up here
          </Anchor>
          <Divider
            my="lg"
            label={<Text c="dimmed">Or sign in with</Text>}
            labelPosition="center"
          />
          <SocialMediaButtonList
            flexProps={{ mt: "md", direction: "column", gap: "sm" }}
            buttonProps={{ variant: "outline" }}
          />
        </Paper>
      </Center>
    </Container>
  );
};

export default SignInPage;
