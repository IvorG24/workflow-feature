import { Database } from "@/utils/database.types";
import {
  Button,
  Divider,
  Flex,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Provider } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/router";
import { Dispatch, FC, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import validator from "validator";
import { Facebook, Github, Google } from "../Icon";
import styles from "./SignIn.module.scss";

type FormData = {
  email: string;
  password: string;
};

type Props = {
  setNotification: Dispatch<SetStateAction<string | null>>;
};

const SignInForm: FC<Props> = ({ setNotification }) => {
  const router = useRouter();
  const supabase = useSupabaseClient<Database>();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>();
  const onSubmit = handleSubmit(async (data) => {
    if (!emailValidation(data.email)) return;
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
      router.push("/");
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
    } catch (e) {
      setNotification("Failed to sign in.");
      console.error(e);
    }
  };

  const emailValidation = (email: string) => {
    if (email.length <= 0) return false;
    const isValid = validator.isEmail(email);
    if (isValid) {
      clearErrors("email");
    } else {
      setError("email", {
        type: "validate",
        message: "Email address is invalid",
      });
    }
    return isValid;
  };
  return (
    <>
      <div className={styles.signin}>
        <form onSubmit={onSubmit} className={styles.form}>
          <Stack spacing="xs">
            <Title order={3}>Sign in</Title>
            <Text>You need to be signed in to start using formsly.</Text>
            <>
              <TextInput
                label="Email"
                mt="lg"
                type="email"
                {...register("email", {
                  required: "Email address is required",
                })}
                aria-invalid={errors.email ? "true" : "false"}
              />
              <Text color="red" role="alert" className="error">
                {errors.email?.message}
              </Text>
              <TextInput
                label="Password"
                type="password"
                mt="sm"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                aria-invalid={errors.password ? "true" : "false"}
              />
              <Text color="red" role="alert" className="error">
                {errors.password?.message}
              </Text>
            </>
            <Button
              mt={25}
              type="submit"
              color="green"
              aria-label="sign in with email and password"
            >
              Sign In
            </Button>
          </Stack>
        </form>
        <div className={styles.provider}>
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
            >
              <div style={{ fontSize: "25px", color: "#DB4437" }}>
                <Google />
              </div>
            </Button>
            <Button
              variant="outline"
              aria-label="sign in with facebook"
              color="gray.4"
              fullWidth
              onClick={() => signInWithProvider("facebook")}
            >
              <div style={{ fontSize: "25px", color: "#4267B2" }}>
                <Facebook />
              </div>
            </Button>
            <Button
              variant="outline"
              aria-label="sign in with github"
              color="gray.4"
              fullWidth
              onClick={() => signInWithProvider("github")}
            >
              <div
                style={{
                  fontSize: "25px",
                  color: "#4f4f4f",
                }}
              >
                <Github />
              </div>
            </Button>
          </Flex>
        </div>

        <Flex gap={5} justify="center" align="center" mt="lg">
          <Text>Do not have an account yet?</Text>
          <Link href="/sign-up">
            <Text color="green">Sign Up</Text>
          </Link>
        </Flex>
      </div>
    </>
  );
};

export default SignInForm;
