import Layout from "@/components/Layout/Layout";
import {
  getUserProfile,
  isUsernameExisting,
  updateUserProfile,
} from "@/utils/queries";
import { isValidFirstOrLastName, isValidUsername } from "@/utils/string";
import {
  Avatar,
  Button,
  Center,
  FileInput,
  Group,
  LoadingOverlay,
  Stack,
  TextInput,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { startCase } from "lodash";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useRef, useState } from "react";

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

  const teamName = `${ctx.query?.teamName}`;
  // const username = `${ctx.query?.username}`;
  const user = session?.user;

  const userProfile = await getUserProfile(supabaseClient, user.id);

  return {
    props: { teamName, user, userProfile },
  };
};

const UserProfilePage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ teamName, user, userProfile }) => {
  const router = useRouter();

  const supabaseClient = useSupabaseClient();

  const [avatar, setAvatar] = useState<File | null>(null);

  const avatarInput = useRef<HTMLButtonElement>(null);

  const [isUpdating, setIsUpdating] = useState(false);

  const [inputList, setInputList] = useState({
    firstName: userProfile.user_first_name || "",
    lastName: userProfile.user_last_name || "",
    username: userProfile.username || "",
    email: userProfile.user_email || "",
  });
  const [errorList, setErrorList] = useState({
    firstName: "",
    lastName: "",
    username: "",
  });

  const handleUpdateUserProfile = async () => {
    try {
      setIsUpdating(true);

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

      await updateUserProfile(
        supabaseClient,
        {
          user_first_name: inputList.firstName.trim(),
          user_last_name: inputList.lastName.trim(),
          username: inputList.username.toLowerCase().trim(),
        },
        user.id
      );

      setErrorList({
        firstName: "",
        lastName: "",
        username: "",
      });

      showNotification({
        message: "User profile has been updated.",
      });

      router.push(`/teams/${teamName}/users/${inputList.username}/profile`);
    } catch (error) {
      console.error(error);
      showNotification({
        message: "Failed to update user profile",
        color: "red",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <LoadingOverlay visible={isUpdating} overlayBlur={2} />
      <Group position="center">
        {/* User Profile Information */}
        <Group>
          <Stack w="100%" maw={300}>
            <Center>
              <FileInput
                accept="image/png,image/jpeg"
                display="none"
                ref={avatarInput}
                onChange={(e) => setAvatar(e)}
              />
              <Avatar
                color="cyan"
                radius={125}
                size={250}
                // TODO: Add upload avatar functionality
                // onClick={() => avatarInput.current?.click()}
                // style={{ cursor: "pointer" }}
                src={avatar ? URL.createObjectURL(avatar) : ""}
                alt="User avatar"
              >
                {startCase(userProfile?.username?.[0])}
                {startCase(userProfile?.username?.[1])}
              </Avatar>
            </Center>

            <TextInput
              placeholder="First name"
              value={inputList["firstName"]}
              error={errorList["firstName"]}
              onChange={(e) =>
                setInputList({ ...inputList, firstName: e.currentTarget.value })
              }
            />
            <TextInput
              placeholder="Last name"
              value={inputList["lastName"]}
              error={errorList["lastName"]}
              onChange={(e) =>
                setInputList({ ...inputList, lastName: e.currentTarget.value })
              }
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
            />
            <TextInput
              placeholder="Email"
              value={inputList["email"]}
              disabled
            />
            <Group noWrap mt="xs">
              <Button size="xs" onClick={handleUpdateUserProfile}>
                Update
              </Button>
              {/* <Button size="xs" variant="outline">
              Cancel
            </Button> */}
            </Group>

            {/* // TODO: Add badges for current user here */}
          </Stack>
        </Group>

        {/* User Profile Team Information */}
        {/* // TODO: Add Requests of curent user here */}
      </Group>
    </>
  );
};

export default UserProfilePage;

UserProfilePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
