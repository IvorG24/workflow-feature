import {
  Button,
  Container,
  Divider,
  LoadingOverlay,
  Paper,
  PasswordInput,
  Stack,
  Text,
} from "@mantine/core";
import { useFormContext } from "react-hook-form";
import PasswordInputWithStrengthMeter from "../SignUpPage/PasswordInputWithStrengthMeter";
import { ChangePasswordForm } from "./UserSettingsPage";

type Props = {
  onChangePassword: (data: ChangePasswordForm) => void;
  isUpdatingPassword: boolean;
};

const ChangePassword = ({ onChangePassword, isUpdatingPassword }: Props) => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isDirty },
  } = useFormContext<ChangePasswordForm>();

  return (
    <Container p={0} mt="xl" pos="relative" fluid>
      <LoadingOverlay
        visible={isUpdatingPassword}
        overlayBlur={2}
        transitionDuration={500}
      />
      <Paper p="lg" shadow="xs">
        <form onSubmit={handleSubmit(onChangePassword)}>
          <Stack>
            <Text weight={600}>Change Password</Text>

            <Divider mt={-12} />

            <PasswordInput
              {...register("old_password", {
                required: "Old password is required",
                minLength: {
                  value: 6,
                  message: "Password must have atleast 6 characters.",
                },
              })}
              error={errors.old_password?.message}
              placeholder="Old Password"
              label="Old Password"
            />

            <PasswordInputWithStrengthMeter label="New Password" />

            <PasswordInput
              {...register("confirm_password", {
                required: "Confirm password is required",
                validate: (value: string) =>
                  value === getValues("password") || "Password do not match",
              })}
              error={errors.confirm_password?.message}
              placeholder="Confirm Password"
              label="Confirm Password"
            />

            <Button
              type="submit"
              w={125}
              size="xs"
              sx={{ alignSelf: "flex-end" }}
              disabled={!isDirty}
            >
              Update Password
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default ChangePassword;
