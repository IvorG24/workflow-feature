import { resetPassword, signInUser } from "@/backend/api/post";
import {
  Alert,
  Box,
  Button,
  Center,
  Container,
  LoadingOverlay,
  Paper,
  PasswordInput,
  Stack,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconAlertCircle } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";

type CreatePasswordFormProps = {
  password: string;
  confirmPassword: string;
};

type Props = {
  email: string;
  inviteTeamId: string;
};

const CreatePasswordPage = ({ email, inviteTeamId }: Props) => {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();

  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePasswordFormProps>();

  const handleCreatePassword = async (data: CreatePasswordFormProps) => {
    try {
      setIsLoading(true);

      const { error: signInError } = await signInUser(supabaseClient, {
        email,
        password: inviteTeamId,
      });
      if (signInError) throw signInError;

      const { error: resetError } = await resetPassword(
        supabaseClient,
        data.password
      );
      if (resetError) throw resetError;

      notifications.show({
        message: "Password created.",
        color: "green",
      });
      router.push(`/onboarding?inviteTeamId=${inviteTeamId}`);
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
          <form onSubmit={handleSubmit(handleCreatePassword)}>
            <Title order={4} mb={8}>
              Create Password
            </Title>
            <Stack>
              <Alert icon={<IconAlertCircle size="1rem" />}>
                {`Password must be at least 6 characters long and include lowercase and uppercase letters, as well as a special symbol (e.g., $&+).`}
              </Alert>
              <Box>
                <PasswordInput
                  placeholder="Enter your new password"
                  label="Password"
                  error={errors.password?.message}
                  {...register("password", {
                    required:
                      "Password field cannot be empty. Please enter your password.",
                    minLength: {
                      value: 6,
                      message: "Password must have atleast 6 characters.",
                    },
                    validate: {
                      haveLowerCase: (value) =>
                        /[a-z]/.test(value) ||
                        "Password must have atleast one lowercase letter.",
                      haveUpperCase: (value) =>
                        /[A-Z]/.test(value) ||
                        "Password must have atleast one uppercase letter.",
                      haveSpecialSymbol: (value) =>
                        /[$&+,:;=?@#|'<>.^*()%!-]/.test(value) ||
                        "Password must have a special symbol.",
                    },
                  })}
                />
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
              </Box>
              <Button type="submit">Create Password</Button>
            </Stack>
          </form>
        </Paper>
      </Center>
    </Container>
  );
};

export default CreatePasswordPage;
