import { Database } from "@/utils/database.types";
import { Button, Flex, Stack, Text, TextInput, Title } from "@mantine/core";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Provider } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/router";
import { Dispatch, FC, SetStateAction } from "react";
import { useForm } from "react-hook-form";
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
  const { register, handleSubmit } = useForm<FormData>();

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
    } catch (error) {
      setNotification("Failed to sign in.");
    }
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
                {...register("email", { required: true })}
              />
              <TextInput
                label="Password"
                type="password"
                mt="sm"
                {...register("password", { required: true })}
              />
            </>
            <Button mt={25} type="submit" color="green">
              Sign In
            </Button>
          </Stack>
        </form>
        <div className={styles.provider}>
          <Text size="xs" align="center" my="xl">
            Or sign in with
          </Text>
          <Flex gap="md" my="xl">
            <Button
              variant="outline"
              color="gray"
              fullWidth
              onClick={() => signInWithProvider("google")}
            >
              <div style={{ fontSize: "25px", color: "#DB4437" }}>
                <Google />
              </div>
            </Button>
            <Button
              variant="outline"
              color="gray"
              fullWidth
              onClick={() => signInWithProvider("facebook")}
            >
              <div style={{ fontSize: "25px", color: "#4267B2" }}>
                <Facebook />
              </div>
            </Button>
            <Button
              variant="outline"
              color="gray"
              fullWidth
              onClick={() => signInWithProvider("github")}
            >
              <div style={{ fontSize: "25px", color: "#171515" }}>
                <Github />
              </div>
            </Button>
          </Flex>
        </div>

        <Flex gap={5} justify="center" align="center">
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
