// todo: add minlength validations and create unit tests
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
import { useState } from "react";
import { useForm } from "react-hook-form";
import validator from "validator";
import { Facebook, Github, Google } from "../Icon";
import styles from "./Register.module.scss";

type FormData = {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const Register = () => {
  const { colorScheme } = useMantineColorScheme();
  const [notification, setNotification] = useState<string | null>(null);
  const supabase = useSupabaseClient<Database>();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { email, password, fullName, phoneNumber } = data;
      // todo: add loading state
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            // Using underscore case as naming convention in key just follow the naming convention of Facebook when saving user metadata. See auth.users.raw_user_metadata.
            phone_number: phoneNumber,
            full_name: fullName,
          },
        },
      });
      if (error) {
        setNotification(error.message);
        throw error;
      }
      reset();
      setNotification(
        "Please check your email for the email confirmation link."
      );
    } catch (e) {
      console.error(e);
    }
  });

  const signUpWithProvider = async (provider: Provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
      });

      if (error) {
        setNotification(error.message);
        throw error;
      }
    } catch (e) {
      setNotification("Failed to register.");
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
        className={styles.register}
        style={{
          backgroundColor: colorScheme === "light" ? "#FFFFFF" : "#1A1B1E",
        }}
      >
        <form onSubmit={onSubmit} className={styles.form}>
          <Stack spacing="xs">
            <Title order={3}>Register</Title>
            <Text>Register to start using Formsly.</Text>
            <>
              <TextInput
                label="Full Name"
                type="text"
                {...register("fullName", {
                  required: "Full Name is required",
                  minLength: {
                    value: 3,
                    message: "Full name must be at least 3 characters",
                  },
                })}
                error={errors.fullName?.message}
              />
              <TextInput
                label="Phone Number"
                type="text"
                {...register("phoneNumber", {
                  validate: {
                    isPhoneNumber: (input) =>
                      validator.isMobilePhone(input) ||
                      "Phone number is invalid",
                  },
                })}
                error={errors.phoneNumber?.message}
              />
              <TextInput
                label="Email"
                type="email"
                {...register("email", {
                  required: "Email address is required",
                  validate: {
                    isEmail: (input) =>
                      validator.isEmail(input) || "Email is invalid",
                  },
                })}
                error={errors.email?.message}
              />
              <TextInput
                label="Password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                error={errors.password?.message}
              />
              <TextInput
                label="Confirm Password"
                type="password"
                {...register("confirmPassword", {
                  required: "Confirm Password is required",
                })}
                error={errors.confirmPassword?.message}
              />
            </>
            <Button
              mt={25}
              type="submit"
              color="green"
              aria-label="register with email and password"
            >
              Register
            </Button>
          </Stack>
        </form>
        <Container className={styles.provider}>
          <Divider
            my="xs"
            label="Or register with"
            labelPosition="center"
            pt="lg"
          />
          <Flex gap="md" my="xl">
            <Button
              variant="outline"
              aria-label="register with google"
              color="gray.4"
              fullWidth
              onClick={() => signUpWithProvider("google")}
              className={styles.google}
            >
              <Google />
            </Button>
            <Button
              variant="outline"
              aria-label="register with facebook"
              color="gray.4"
              fullWidth
              onClick={() => signUpWithProvider("facebook")}
              className={styles.facebook}
            >
              <Facebook />
            </Button>
            <Button
              variant="outline"
              aria-label="register with github"
              color="gray.4"
              fullWidth
              onClick={() => signUpWithProvider("github")}
              className={`${styles.github} ${
                colorScheme === "dark" ? styles.github__darkMode : ""
              }`}
            >
              <Github />
            </Button>
          </Flex>
        </Container>

        <Flex gap={5} justify="center" align="center">
          <Text>Already have an account?</Text>
          <Link href="/sign-in">
            <Text color="green">Sign In</Text>
          </Link>
        </Flex>
      </Container>
    </>
  );
};

export default Register;
