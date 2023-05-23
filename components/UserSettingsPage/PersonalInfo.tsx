import {
  Button,
  Container,
  Divider,
  Flex,
  Paper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useFormContext } from "react-hook-form";
import validator from "validator";
import { PersonalInfoForm } from "./UserSettingsPage";

type Props = {
  onSavePersonalInfo: (data: PersonalInfoForm) => void;
};

const PersonalInfo = ({ onSavePersonalInfo }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useFormContext<PersonalInfoForm>();

  return (
    <Container p={0} mt="xl" fluid>
      <Paper p="lg" shadow="xs">
        <form onSubmit={handleSubmit(onSavePersonalInfo)}>
          <Stack spacing={12}>
            <Text weight={600}>Personal Info</Text>

            <Divider mt={-12} />

            <Flex direction={{ base: "column", md: "row" }} gap={16}>
              <TextInput
                w="100%"
                label="Username"
                {...register("user_username", {
                  required: true,
                  minLength: 2,
                  maxLength: 50,
                })}
                error={errors.user_username?.message}
              />

              <TextInput
                w="100%"
                label="Email"
                {...register("user_email", {
                  required: true,
                  validate: {
                    isEmail: (value: string) =>
                      validator.isEmail(value) || "Email is invalid",
                  },
                })}
                error={errors.user_email?.message}
                disabled
              />
            </Flex>

            <Flex direction={{ base: "column", md: "row" }} gap={16}>
              <TextInput
                w="100%"
                label="First Name"
                {...register("user_first_name", {
                  required: true,
                  minLength: 2,
                  maxLength: 50,
                })}
                error={errors.user_first_name?.message}
              />

              <TextInput
                w="100%"
                label="Last Name"
                {...register("user_last_name", {
                  required: true,
                  minLength: 2,
                  maxLength: 50,
                })}
                error={errors.user_last_name?.message}
              />
            </Flex>

            <Button
              type="submit"
              w={120}
              size="xs"
              sx={{ alignSelf: "flex-end" }}
              disabled={!isDirty}
            >
              Save Changes
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default PersonalInfo;
