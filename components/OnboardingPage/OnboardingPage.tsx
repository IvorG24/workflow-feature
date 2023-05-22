import { OnboardUserParams } from "@/pages/onboarding";
import {
  Button,
  Center,
  Container,
  Divider,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  createStyles,
} from "@mantine/core";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { parsePhoneNumber } from "react-phone-number-input";
import PhoneInputWithCountry from "react-phone-number-input/react-hook-form";
import "react-phone-number-input/style.css";
import UploadAvatar from "../UploadAvatar/UploadAvatar";

type Props = {
  onOnboardUser: (data: OnboardUserParams) => Promise<void>;
  avatarFile: File | null;
  onAvatarFileChange: (value: File | null) => void;
};

const useStyles = createStyles((theme) => ({
  phone: {
    padding: "14px !important",
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[1]
    } !important`,
    borderRadius: "4px !important",
    height: "42px",

    "& input": {
      border: "none",
      marginLeft: 4,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[0]
          : theme.colors.gray[0],
      background: "transparent",

      "&:focus-visible": {
        outline: "none !important",
        boxShadow: "none !important",
      },
    },
  },
}));

const OnboardingPage = ({
  onOnboardUser,
  avatarFile,
  onAvatarFileChange,
}: Props) => {
  const { classes } = useStyles();

  const [phone, setPhone] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    control,
  } = useFormContext<OnboardUserParams>();

  return (
    <Container p={0} mih="100vh" fluid>
      <Container p="xl" maw={450}>
        <Paper p="xl" shadow="sm" withBorder>
          <Title color="blue">Onboarding</Title>

          <Text size="lg" mt="lg" fw="bold">
            Complete your profile
          </Text>

          <Divider mt={4} />

          <Center mt="lg">
            <UploadAvatar
              value={avatarFile}
              onChange={onAvatarFileChange}
              onError={(error: string) =>
                setError("user_avatar", { message: error })
              }
            />
          </Center>

          <form onSubmit={handleSubmit(onOnboardUser)}>
            <TextInput
              label="Email"
              {...register("user_email")}
              mt="sm"
              disabled
            />

            <TextInput
              label="Username"
              {...register("user_username", {
                required: "Username is required",
                minLength: {
                  value: 2,
                  message: "Username must have at least 2 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Username must be shorter than 100 characters",
                },
              })}
              error={errors.user_username?.message}
              mt="sm"
            />

            <TextInput
              label="First name"
              {...register("user_first_name", {
                required: "First name is required",
                minLength: {
                  value: 2,
                  message: "First name must have at least 2 characters",
                },
                maxLength: {
                  value: 100,
                  message: "First name must be shorter than 100 characters",
                },
              })}
              error={errors.user_first_name?.message}
              mt="sm"
            />

            <TextInput
              label="Last name"
              {...register("user_last_name", {
                required: "Last name is required",
                minLength: {
                  value: 2,
                  message: "Last name must have at least 2 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Last name must be shorter than 100 characters",
                },
              })}
              error={errors.user_last_name?.message}
              mt="sm"
            />

            <Text size="lg" mt="lg" fw="bold">
              Optional
            </Text>

            <Divider mt={4} />

            <Container m={0} p={0} fluid>
              <Stack spacing={0} mt={16}>
                <Text fw={600} fz={14}>
                  Mobile number
                </Text>

                <PhoneInputWithCountry
                  name="user_phone_number"
                  aria-label="Phone"
                  placeholder="Enter your phone number"
                  international
                  control={control}
                  defaultCountry="PH"
                  onChange={setPhone}
                  defaultValue={parsePhoneNumber(phone || "", "PH")?.number}
                  className={classes.phone}
                />
                <Text pt={2} fz={12} color="red">
                  {errors.user_phone_number?.message}
                </Text>
              </Stack>
            </Container>

            <TextInput
              label="Job Title"
              {...register("user_job_title", {
                minLength: {
                  value: 2,
                  message: "Job title must have at least 2 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Job title must be shorter than 100 characters",
                },
              })}
              error={errors.user_job_title?.message}
              mt="sm"
            />

            <Button type="submit" mt="xl" fullWidth>
              Save and continue to homepage
            </Button>
          </form>
        </Paper>
      </Container>
    </Container>
  );
};

export default OnboardingPage;
