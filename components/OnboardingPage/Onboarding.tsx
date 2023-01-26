// TODO: Refactor the frontend of this one.
import { createTeam, createUserProfile } from "@/utils/queries";
import { TeamTableInsert, UserProfileTableInsert } from "@/utils/types";
import {
  Button,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  Paper,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { toLower } from "lodash";
import { useRouter } from "next/router";
import { useState } from "react";

// Create type OnboardingFormValues
type OnboardingFormValues = {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  avatar: File | null;
  teamName: string;
  teamLogo: File | null;
};

function Onboarding() {
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<OnboardingFormValues>({
    initialValues: {
      firstName: "",
      lastName: "",
      username: "",
      phone: "",
      avatar: null,
      teamName: "",
      teamLogo: null,
    },
  });

  const handleSubmit = async (values: OnboardingFormValues) => {
    try {
      setIsLoading(true);
      if (!user?.id) throw new Error("User is not logged in.");
      let avatarFilepath = null;
      let teamLogoFilepath = null;

      // Save user profile information
      const createUserProfileParams: UserProfileTableInsert = {
        user_id: user.id,
        user_email: user.email,
        user_avatar_filepath: avatarFilepath,
        user_first_name: values.firstName,
        user_last_name: values.lastName,
        username: values.username,
      };
      await createUserProfile(supabaseClient, createUserProfileParams);

      // Create first team
      const createTeamParams: TeamTableInsert = {
        team_name: values.teamName,
        team_logo_filepath: teamLogoFilepath,
      };
      const data = await createTeam(supabaseClient, createTeamParams, user.id);

      router.push(`/teams/${toLower(data.team_table.team_name as string)}`);
      form.reset();
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
        message: "Something went wrong. Please try again.",
        color: "red",
      });
    }
  };

  return (
    <>
      <LoadingOverlay visible={isLoading} overlayBlur={2} />
      <Container p="xl" size="sm">
        <Paper radius="md" p="xl" withBorder>
          <Text size="lg" weight={500}>
            Onboarding
          </Text>
          <Text size="md" weight={400}>
            Complete your profile information
          </Text>
          <Divider
            label="Add Profile Information"
            labelPosition="center"
            my="lg"
          />
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Group>
              <label>First Name:</label>
              <input
                type="text"
                name="firstName"
                {...form.getInputProps("firstName")}
              />
              <label>Last Name:</label>
              <input
                type="text"
                name="lastName"
                {...form.getInputProps("lastName")}
              />
              <label>Username:</label>
              <input
                type="text"
                name="username"
                {...form.getInputProps("username")}
              />
              <label>Phone Number:</label>
              <input
                type="text"
                name="phone"
                {...form.getInputProps("phone")}
              />
              <label>Profile Picture:</label>
              <input
                type="file"
                name="avatar"
                {...form.getInputProps("avatar")}
              />
            </Group>
            <Divider
              label="Create your first team"
              labelPosition="center"
              my="lg"
            />
            <Group>
              <label>Team Name:</label>
              <input
                type="text"
                name="teamName"
                {...form.getInputProps("teamName")}
              />
              <label>Team Logo:</label>
              <input
                type="file"
                name="teamLogo"
                {...form.getInputProps("teamLogo")}
              />
            </Group>
            <Group position="center" mt="xl">
              <Button type="submit">Save</Button>
            </Group>
          </form>
        </Paper>
      </Container>
    </>
  );
}

export default Onboarding;
