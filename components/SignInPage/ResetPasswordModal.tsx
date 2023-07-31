import { sendResetPasswordEmail } from "@/backend/api/post";
import {
  Alert,
  Box,
  Button,
  LoadingOverlay,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconAlertCircle, IconArrowLeft, IconAt } from "@tabler/icons-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import validator from "validator";

type ResetPasswordModalProps = {
  opened: boolean;
  onClose: () => void;
};

const ResetPasswordModal = ({ opened, onClose }: ResetPasswordModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const supabaseClient = useSupabaseClient();
  const defaultButtonProps = { radius: "lg", size: "md" };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ email: string }>();

  const handleSendResetLink = async (data: { email: string }) => {
    try {
      setIsLoading(true);
      await sendResetPasswordEmail(supabaseClient, data.email);
      notifications.show({
        message: "Please check your email inbox.",
        color: "green",
        withCloseButton: true,
        autoClose: false,
      });
      onClose();
      reset();
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
    <Modal
      padding="lg"
      centered
      withCloseButton={false}
      opened={opened}
      onClose={onClose}
    >
      <Box mb="md">
        <Title order={3} align="center">
          Forgot Password?
        </Title>
        <Text
          size="xs"
          c="dimmed"
          align="center"
        >{`No worries, We'll send you reset instructions`}</Text>
      </Box>
      <form onSubmit={handleSubmit(handleSendResetLink)}>
        <LoadingOverlay visible={isLoading} overlayBlur={2} />
        <Stack>
          <Box mb="md">
            <TextInput
              placeholder="youremail@mail.com"
              label="Enter your email"
              error={errors.email?.message}
              icon={<IconAt size="18px" />}
              {...register("email", {
                required:
                  "Email field cannot be empty. Please enter your email address.",
                validate: (value) =>
                  validator.isEmail(value) ||
                  "Email is invalid. Please enter a valid email address.",
              })}
            />
            <Alert icon={<IconAlertCircle size="1rem" />}>
              {`To reset your password, we'll send you an email with a link. Simply click the link provided, and you'll be redirected to update your password.`}
            </Alert>
          </Box>
          <Button type="submit" {...defaultButtonProps}>
            Reset Password
          </Button>
          <Button
            mb="md"
            type="button"
            variant="outline"
            leftIcon={<IconArrowLeft />}
            onClick={onClose}
            {...defaultButtonProps}
          >
            Back to Sign In
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default ResetPasswordModal;
