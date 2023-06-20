import { checkIfEmailExists, signUpUser } from "@/backend/api/post";
import {
  Anchor,
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
import { FormProvider, useForm } from "react-hook-form";
import validator from "validator";
import SocialMediaButtonList from "../SocialMediaButton/SocialMediaButtonList";
import PasswordInputWithStrengthMeter from "./PasswordInputWithStrengthMeter";

export type SignUpFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

const SignUpPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const signUpFormMethods = useForm<SignUpFormValues>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = signUpFormMethods;

  const handleSignUp = async (data: SignUpFormValues) => {
    try {
      setIsLoading(true);
      const isEmailExists = await checkIfEmailExists(supabaseClient, {
        email: data.email,
      });
      if (isEmailExists) {
        notifications.show({
          message: "Email already registered.",
          color: "orange",
        });
        return;
      }

      const signUp = await signUpUser(supabaseClient, {
        email: data.email,
        password: data.password,
      });
      if (!signUp.user && !signUp.session) throw Error;
      notifications.show({
        message:
          "Confirmation email sent. Please check your email inbox to proceed.",
        color: "green",
        withCloseButton: true,
        autoClose: false,
      });
      reset();
    } catch (error) {
      console.error(error);
      notifications.show({
        message: "Something went wrong. Please try again later.",
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
          <form onSubmit={handleSubmit(handleSignUp)}>
            <Title order={4} mb={8}>
              Sign up to Formsly
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
              <FormProvider {...signUpFormMethods}>
                <PasswordInputWithStrengthMeter />
              </FormProvider>
              <PasswordInput
                placeholder="Confirm your password"
                label="Confirm Password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword", {
                  required:
                    "Confirm password field cannot be empty. Please confirm your password.",
                  validate: (value, formValues) =>
                    value === formValues.password ||
                    "Your password does not match.",
                })}
              />
              <Button type="submit">Sign up</Button>
            </Stack>
          </form>
          <Anchor
            w="100%"
            component="button"
            mt="md"
            size="xs"
            align="center"
            onClick={() => router.push("/sign-in")}
          >
            Already registered? Sign in here
          </Anchor>
          <Divider
            my="lg"
            label={<Text c="dimmed">Or sign up with</Text>}
            labelPosition="center"
          />
          <SocialMediaButtonList
            flexprops={{ mt: "md", direction: "column", gap: "sm" }}
            buttonprops={{ variant: "outline" }}
          />
        </Paper>
      </Center>
    </Container>
  );
};

export default SignUpPage;
