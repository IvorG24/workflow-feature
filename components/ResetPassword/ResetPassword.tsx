import { resetPassword } from "@/backend/api/post";
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
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { IconAlertCircle } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";

type ResetPasswordFormProps = {
  password: string;
  confirmPassword: string;
};

const ResetPasswordPage = () => {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const user = useUser();

  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormProps>();

  const handleResetPassword = async (data: ResetPasswordFormProps) => {
    try {
      setIsLoading(true);
      if (!user) {
        notifications.show({
          message: "Unauthorized submission.",
          color: "red",
        });
        router.push("/sign-in");
        return;
      }
      const updatePassword = await resetPassword(supabaseClient, data.password);
      if (!updatePassword) throw new Error();
      notifications.show({
        message: "Password updated.",
        color: "green",
      });
      router.push("/team-requests/requests");
    } catch (error) {
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
          <form onSubmit={handleSubmit(handleResetPassword)}>
            <Title order={4} mb={8}>
              Reset Password
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
              <Button type="submit">Reset Password</Button>
            </Stack>
          </form>
        </Paper>
      </Center>
    </Container>
  );
};

export default ResetPasswordPage;
