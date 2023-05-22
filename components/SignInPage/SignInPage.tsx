import {
  Box,
  Button,
  Center,
  Container,
  Divider,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "react-hook-form";
import validator from "validator";
import SocialMediaButtonList from "../SocialMediaButtonList";

type SignInFormValues = {
  email: string;
  password: string;
};

const SignInPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>();

  const handleSignIn = (data: SignInFormValues) => {
    console.log(data);
  };

  return (
    <Container px={0} fluid>
      <Center mt={48}>
        <Paper p="md" w="100%" maw={360}>
          <form onSubmit={handleSubmit(handleSignIn)}>
            <Title order={4} mb={8}>
              Sign in to Formsly
            </Title>
            <Stack>
              <TextInput
                {...register("email", {
                  required:
                    "Email field cannot be empty. Please enter your email address.",
                  validate: (value) =>
                    validator.isEmail(value) ||
                    "Email is invalid. Please enter a valid email address.",
                })}
                placeholder="Enter your email address"
                label="Email"
                error={errors.email?.message}
              />
              <Box>
                <PasswordInput
                  {...register("password", {
                    required:
                      "Password field cannot be empty. Please enter your password.",
                  })}
                  placeholder="Enter your password"
                  label="Password"
                  error={errors.password?.message}
                />
                <Text mt={8} size="xs" color="blue" align="right">
                  Forgot Password?
                </Text>
              </Box>
              <Button type="submit">Sign in</Button>
            </Stack>
          </form>
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
