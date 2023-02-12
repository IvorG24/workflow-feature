import Layout from "@/components/Layout/Layout";
import { getFileUrl, uploadFile } from "@/utils/file";
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
  Divider,
  FileInput,
  Group,
  Image,
  LoadingOverlay,
  Space,
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
import { ReactElement, useEffect, useRef, useState } from "react";
import {
  default as ReactSignatureCanvas,
  default as SignatureCanvas,
} from "react-signature-canvas";

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

  const sigCanvas = useRef<ReactSignatureCanvas>(null);

  const supabaseClient = useSupabaseClient();

  const [avatar, setAvatar] = useState<File | null>(null);

  const avatarInput = useRef<HTMLButtonElement>(null);

  const [isUpdating, setIsUpdating] = useState(false);

  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);

  const [signatureFile, setSignatureFile] = useState<File | null>(null);

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

  const handleDrawSignature = async () => {
    try {
      setIsUpdating(true);

      if (sigCanvas.current?.isEmpty()) {
        showNotification({
          message: "Please provide a signature",
          color: "red",
        });
        return;
      }

      const canvas = sigCanvas.current?.getCanvas();
      const dataURL = canvas?.toDataURL("image/png");
      const blob = await fetch(dataURL || "").then((r) => r.blob());

      const file = new File([blob], `${userProfile.username}-signature.png`, {
        type: "image/png",
      });

      if (!file) throw new Error();

      const { path } = await uploadFile(
        supabaseClient,
        file.name,
        file,
        "signatures",
        teamName,
        userProfile.username as string
      );

      await updateUserProfile(
        supabaseClient,
        { user_signature_filepath: path },
        user.id
      );

      const url = URL.createObjectURL(file);

      setSignatureUrl(url);

      showNotification({
        message: "Signature has been updated",
      });
    } catch (error) {
      console.error(error);
      showNotification({
        message: "Failed to draw signature",
        color: "red",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUploadSignature = async () => {
    try {
      setIsUpdating(true);

      if (!signatureFile) {
        showNotification({
          message: "Please provide a signature file",
          color: "red",
        });
        return;
      }

      const { path } = await uploadFile(
        supabaseClient,
        signatureFile.name,
        signatureFile,
        "signatures",
        teamName,
        userProfile.username as string
      );

      await updateUserProfile(
        supabaseClient,
        { user_signature_filepath: path },
        user.id
      );

      const url = URL.createObjectURL(signatureFile);

      setSignatureUrl(url);

      showNotification({
        message: "Signature has been updated",
      });
    } catch (error) {
      console.error(error);
      showNotification({
        message: "Failed to upload signature",
        color: "red",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveSignature = async () => {
    try {
      setIsUpdating(true);

      await updateUserProfile(
        supabaseClient,
        { user_signature_filepath: null },
        user.id
      );

      setSignatureUrl(null);

      showNotification({
        message: "Signature has been removed",
      });
    } catch (error) {
      console.error(error);
      showNotification({
        message: "Failed to remove signature",
        color: "red",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (!userProfile.user_signature_filepath) return;

      const url = await getFileUrl(
        supabaseClient,
        userProfile.user_signature_filepath,
        "signatures"
      );

      setSignatureUrl(url);
    })();
  }, [userProfile.user_signature_filepath]);

  return (
    <>
      <LoadingOverlay visible={isUpdating} overlayBlur={2} />
      <Stack align="center">
        {/* User Profile Information */}
        <Stack w="100%" maw={400}>
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
            maw={400}
            w="100%"
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
          <TextInput placeholder="Email" value={inputList["email"]} disabled />
          <Group noWrap mt="xs">
            <Button w="100%" maw={400} onClick={handleUpdateUserProfile}>
              Update
            </Button>
          </Group>
        </Stack>

        <Space h="xl" />

        {/* Add signature */}

        <Space h="xl" />

        <Center component="div" maw={400}>
          <Image
            radius="md"
            src={signatureUrl}
            alt="User signature"
            withPlaceholder
            caption={
              signatureUrl
                ? "Your uploaded signature"
                : "No signature uploaded yet"
            }
          />
        </Center>

        {signatureUrl && (
          <Button
            w="100%"
            maw={400}
            onClick={handleRemoveSignature}
            variant="outline"
          >
            Remove signature
          </Button>
        )}

        <Space h="xl" />

        <Center
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.dark[5]
                : theme.colors.blue[0],
            color: theme.colors.gray[1],
            borderRadius: "0.5rem",
          })}
        >
          <SignatureCanvas
            canvasProps={{
              height: "300px",
              width: "400px",
              className: "sigCanvas",
            }}
            ref={sigCanvas}
            data-testid="sigCanvas"
          />
        </Center>

        <Button w="100%" maw={400} onClick={handleDrawSignature}>
          Draw your signature
        </Button>
        <Button
          w="100%"
          maw={400}
          onClick={() => sigCanvas.current?.clear()}
          variant="outline"
        >
          Clear
        </Button>
        <Divider label="Or" />
        <FileInput
          w="100%"
          maw={400}
          placeholder={signatureFile?.name || "Upload signature"}
          withAsterisk
          accept="image/png,image/jpeg"
          value={signatureFile}
          onChange={setSignatureFile}
        />
        <Button w="100%" maw={400} onClick={handleUploadSignature}>
          Upload signature
        </Button>
      </Stack>
    </>
  );
};

export default UserProfilePage;

UserProfilePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
