// TODO: Refactor the frontend of this one.
import { isUniqueNameValid } from "@/utils/input";
import { createTeam, createUserProfile } from "@/utils/queries";
import { TeamTableInsert, UserProfileTableInsert } from "@/utils/types";
import {
  Button,
  Center,
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
  // phone: string;
  // avatar: File | null;
  teamName: string;
  // teamLogo: File | null;
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
      // phone: "",
      // avatar: null,
      teamName: "",
      // teamLogo: null,
    },
  });

  const handleSubmit = async (values: OnboardingFormValues) => {
    try {
      setIsLoading(true);
      if (!user?.id) throw new Error("User is not logged in.");

      // check all fields are filled
      if (
        !values.firstName ||
        !values.lastName ||
        !values.username ||
        !values.teamName
      ) {
        showNotification({
          message: "Please fill in all fields.",
          color: "red",
        });
        setIsLoading(false);
        return;
      }

      // check username is valid
      if (!isUniqueNameValid(toLower(values.username.trim()))) {
        showNotification({
          message:
            "Username must include uppercased, spaces, underscores, and numbers only.",
          color: "red",
        });
        return;
      }

      // check isUniqueNameValid
      if (!isUniqueNameValid(toLower(values.teamName.trim()))) {
        showNotification({
          message:
            "Team name must include uppercased, spaces, underscores, and numbers only.",
          color: "red",
        });
        return;
      }

      // check if username is unique
      const { data: usernameData, error: usernameError } = await supabaseClient
        .from("user_profile_table")
        .select("username")
        .eq("username", toLower(values.username.trim()))
        .maybeSingle();
      if (usernameError) throw new Error(usernameError.message);

      if (usernameData) {
        showNotification({
          message: "Username is already taken.",
          color: "red",
        });
        setIsLoading(false);
        return;
      }

      // check if team name is unique
      const { data: teamNameData, error: teamNameError } = await supabaseClient
        .from("team_table")
        .select("team_name")
        .eq("team_name", toLower(values.teamName.trim()))
        .maybeSingle();
      if (teamNameError) throw new Error(teamNameError.message);

      if (teamNameData) {
        showNotification({
          message: "Team name is already taken.",
          color: "red",
        });
        setIsLoading(false);
        return;
      }

      const avatarFilepath = null;
      const teamLogoFilepath = null;

      // Save user profile information
      const createUserProfileParams: UserProfileTableInsert = {
        user_id: user.id,
        user_email: user.email as string,
        user_avatar_filepath: avatarFilepath,
        user_first_name: values.firstName.trim(),
        user_last_name: values.lastName.trim(),
        username: toLower(values.username.trim()),
      };

      // check if user already has a profile
      const { data: userProfileData, error: userProfileError } =
        await supabaseClient
          .from("user_profile_table")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

      if (userProfileError) throw new Error(userProfileError.message);

      if (!userProfileData)
        await createUserProfile(supabaseClient, createUserProfileParams);

      // Create first team
      const createTeamParams: TeamTableInsert = {
        team_name: toLower(values.teamName.trim()),
        team_logo_filepath: teamLogoFilepath,
        team_user_id: user.id,
      };

      const data = await createTeam(supabaseClient, createTeamParams, user.id);

      await router.push(`/teams/${data.team_table.team_name as string}`);
      form.reset();
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      showNotification({
        message: "Something went wrong. Please try again.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay visible={isLoading} overlayBlur={2} />
      <Center h="90vh">
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
                  // make to lowercase
                  onChange={(e) =>
                    form.setFieldValue("username", e.target.value.toLowerCase())
                  }
                />
                {/* <label>Phone Number:</label>
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
                /> */}
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
                  // make to uppercase
                  onChange={(e) =>
                    form.setFieldValue("teamName", e.target.value.toUpperCase())
                  }
                />
                {/* <label>Team Logo:</label>
                <input
                  type="file"
                  name="teamLogo"
                  {...form.getInputProps("teamLogo")}
                /> */}
              </Group>
              <Group position="center" mt="xl">
                <Button type="submit">Save</Button>
              </Group>
            </form>
          </Paper>
        </Container>
      </Center>
    </>
  );
}

export default Onboarding;
