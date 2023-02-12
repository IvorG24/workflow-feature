import {
  Button,
  Center,
  Divider,
  LoadingOverlay,
  Space,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";

import {
  createTeam,
  createUserProfile,
  getUserProfileNullable,
  getUserTeamList,
  isTeamNameExisting,
  isUsernameExisting,
} from "@/utils/queries";
import {
  isValidFirstOrLastName,
  isValidTeamName,
  isValidUsername,
} from "@/utils/string";
import { showNotification } from "@mantine/notifications";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { NextPageWithLayout } from "./_app";

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabaseClient = createServerSupabaseClient(ctx);

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    return {
      redirect: {
        destination: "/authentication",
        permanent: false,
      },
    };
  }

  const user = session?.user;

  const [userProfile, userTeamList] = await Promise.all([
    getUserProfileNullable(supabaseClient, user.id),
    getUserTeamList(supabaseClient, user.id),
  ]);

  // const isOnboarded = userProfile && userTeamList.length > 0;

  return {
    props: {
      user,
      userProfile,
      userTeamList,
      // isOnboarded,
    },
  };
};

const OnboardingPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ user, userProfile, userTeamList }) => {
  const router = useRouter();

  const supabaseClient = useSupabaseClient();

  const [isLoading, setIsLoading] = useState(false);

  // create input fields state as object
  const [inputList, setInputList] = useState({
    firstName: userProfile?.user_first_name || "",
    lastName: userProfile?.user_last_name || "",
    username: userProfile?.username || "",
    teamName: userTeamList[0]?.team_name || "",
    email: user.email,
  });

  // create input field list error state as object
  const [errorList, setErrorList] = useState({
    firstName: "",
    lastName: "",
    username: "",
    teamName: "",
  });

  const handleFinishOnboarding = async () => {
    try {
      setIsLoading(true);

      if (!userProfile) {
        // check if username is empty
        if (inputList.username.trim() === "") {
          setErrorList({
            ...errorList,
            username: "Username cannot be empty",
          });
          return;
        }

        // check if first name is empty
        if (inputList.firstName.trim() === "") {
          setErrorList({
            ...errorList,
            firstName: "First name cannot be empty",
          });
          return;
        }

        // check if last name is empty
        if (inputList.lastName.trim() === "") {
          setErrorList({
            ...errorList,
            lastName: "Last name cannot be empty",
          });
          return;
        }

        // Check for validity of fields before updating
        if (!isValidUsername(inputList.username)) {
          setErrorList({
            ...errorList,
            username: "Username must contain 6-30 alphanumeric and dashes only",
          });
          return;
        }
        if (!isValidFirstOrLastName(inputList.firstName)) {
          setErrorList({
            ...errorList,
            firstName:
              "First name must contain 1-30 alphanumeric, period, and dashes only",
          });
          return;
        }
        if (!isValidFirstOrLastName(inputList.lastName)) {
          setErrorList({
            ...errorList,
            lastName:
              "Last name must contain 1-30 alphanumeric, period, and dashes only",
          });
          return;
        }

        // check if username is taken
        if (
          await isUsernameExisting(
            supabaseClient,
            inputList.username.toLowerCase().trim()
          )
        ) {
          setErrorList({
            ...errorList,
            username: "Username is already taken",
          });
          return;
        }
      }

      if (userTeamList.length === 0) {
        // check for team name validity
        if (inputList.teamName.trim() === "") {
          setErrorList({
            ...errorList,
            teamName: "Team name cannot be empty",
          });
          return;
        }

        if (!isValidTeamName(inputList.teamName.trim())) {
          setErrorList({
            ...errorList,
            teamName:
              "Team name must contain 6-30 alphanumeric characters and underscores, periods, apostrophes, or dashes only",
          });
          return;
        }

        if (
          await isTeamNameExisting(
            supabaseClient,
            inputList.teamName.toLowerCase().trim()
          )
        ) {
          setErrorList({
            ...errorList,
            teamName: "Team name is already taken",
          });
          return;
        }
      }

      // create user profile if not exists
      // create team if not exists
      if (!userProfile) {
        await createUserProfile(supabaseClient, {
          user_id: user.id,
          user_first_name: inputList.firstName.trim(),
          user_last_name: inputList.lastName.trim(),
          username: inputList.username.toLowerCase().trim(),
          user_email: inputList.email as string,
        });
      }

      if (userTeamList.length === 0) {
        await createTeam(
          supabaseClient,
          {
            team_name: inputList.teamName.toLowerCase().trim(),
            team_user_id: user.id,
          },
          user.id
        );
      }

      router.push("/");
    } catch (error) {
      console.error(error);
      showNotification({
        message: "Something went wrong. Please try again.",
        title: "Error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay visible={isLoading} overlayBlur={2} />
      <Center h="90vh">
        <Stack spacing="sm" w={400}>
          <Text size="xl" c="dimmed" fw="bold">
            Onboarding
          </Text>
          <Divider />

          <Text size="lg" c="dimmed" fw="bold">
            Complete your profile
          </Text>

          <TextInput
            placeholder="First name"
            value={inputList["firstName"]}
            error={errorList["firstName"]}
            onChange={(e) =>
              setInputList({ ...inputList, firstName: e.currentTarget.value })
            }
            disabled={!!userProfile?.user_first_name}
          />
          <TextInput
            placeholder="Last name"
            value={inputList["lastName"]}
            error={errorList["lastName"]}
            onChange={(e) =>
              setInputList({ ...inputList, lastName: e.currentTarget.value })
            }
            disabled={!!userProfile?.user_last_name}
          />
          <TextInput
            placeholder="Username"
            value={inputList["username"]}
            error={errorList["username"]}
            onChange={(e) =>
              setInputList({
                ...inputList,
                username: e.currentTarget.value.toLowerCase(),
              })
            }
            disabled={!!userProfile?.username}
          />
          <TextInput placeholder="Email" value={inputList["email"]} disabled />

          <Space h="xl" />

          <Text size="lg" c="dimmed" fw="bold">
            Create your first team
          </Text>

          <TextInput
            placeholder="Team name"
            value={inputList["teamName"].toUpperCase()}
            error={errorList["teamName"]}
            onChange={(e) =>
              setInputList({
                ...inputList,
                teamName: e.currentTarget.value.toUpperCase(),
              })
            }
            disabled={userTeamList.length > 0}
          />

          <Button onClick={handleFinishOnboarding}>
            Save and continue to homepage
          </Button>
        </Stack>
      </Center>
    </>
  );
};

export default OnboardingPage;
