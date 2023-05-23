import {
  Button,
  Container,
  Divider,
  Paper,
  PasswordInput,
  Stack,
  Text,
} from "@mantine/core";
import { useFormContext } from "react-hook-form";
import { ChangePasswordForm } from "./UserSettingsPage";

type Props = {
  onChangePassword: (data: ChangePasswordForm) => void;
};

const ChangePassword = ({ onChangePassword }: Props) => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
  } = useFormContext<ChangePasswordForm>();

  return (
    <Container p={0} mt="xl" fluid>
      <Paper p="lg" shadow="xs">
        <form onSubmit={handleSubmit(onChangePassword)}>
          <Stack>
            <Text weight={600}>Change Password</Text>

            <Divider mt={-12} />

            <PasswordInput
              {...register("old_password", {
                required: true,
                minLength: 6,
              })}
              error={errors.old_password?.message}
              placeholder="Old Password"
              label="Old Password"
              withAsterisk
            />

            <PasswordInput
              {...register("new_password", {
                required: true,
                minLength: 6,
              })}
              error={errors.new_password?.message}
              placeholder="New Password"
              label="New Password"
              withAsterisk
            />

            <PasswordInput
              {...register("confirm_password", {
                required: true,
                validate: (value: string) =>
                  value === getValues("new_password") ||
                  "Password do not match",
              })}
              error={errors.confirm_password?.message}
              placeholder="Confirm Password"
              label="Confirm Password"
              withAsterisk
            />

            <Button
              type="submit"
              w={125}
              size="xs"
              sx={{ alignSelf: "flex-end" }}
              disabled={!isValid}
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
