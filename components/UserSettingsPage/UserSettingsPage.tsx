import {
  createAttachment,
  resetPassword,
  uploadImage,
} from "@/backend/api/post";
import { udpateUser } from "@/backend/api/update";
import { useUserActions } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { UserWithSignatureType } from "@/utils/types";
import { Container, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { capitalize } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import UploadSignature from "../UploadSignature/UploadSignature";
import ChangePassword from "./ChangePassword";
import PersonalInfo from "./PersonalInfo";

export type PersonalInfoForm = {
  user_id: string;
  user_email: string;
  user_username: string;
  user_first_name: string;
  user_last_name: string;
  user_phone_number: string;
  user_job_title: string;
  user_avatar: string;
};

export type ChangePasswordForm = {
  old_password: string;
  password: string;
  confirm_password: string;
};

type Props = {
  user: UserWithSignatureType;
};

const UserSettingsPage = ({ user }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();

  const { setUserAvatar, setUserInitials } = useUserActions();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUpdatingPersonalInfo, setIsUpdatingPersonalInfo] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [openCanvas, setOpenCanvas] = useState(false);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signatureUrl, setSignatureUrl] = useState("");
  const [isUpdatingSignature, setIsUpdatingSignature] = useState(false);

  useEffect(() => {
    const getUserSignatureUrl = async () => {
      try {
        setIsUpdatingSignature(true);
        const {
          data: { publicUrl },
        } = supabaseClient.storage
          .from("USER_SIGNATURES")
          .getPublicUrl(user.user_signature_attachment.attachment_value);
        const url = `${publicUrl}?id=${uuidv4()}`;

        setSignatureUrl(url);
      } catch (e) {
        notifications.show({
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
        router.push("/500");
      } finally {
        setIsUpdatingSignature(false);
      }
    };
    if (user.user_signature_attachment) {
      getUserSignatureUrl();
    }
  }, [user]);

  const personalInfoFormMethods = useForm<PersonalInfoForm>({
    defaultValues: {
      user_id: user.user_id,
      user_email: user.user_email,
      user_username: user.user_username,
      user_first_name: user.user_first_name,
      user_last_name: user.user_last_name,
      user_phone_number: user.user_phone_number || "",
      user_job_title: user.user_job_title || "",
      user_avatar: user.user_avatar || "",
    },
  });

  const changePasswordFormMethods = useForm<ChangePasswordForm>();

  const handleSavePersonalInfo = async (data: PersonalInfoForm) => {
    try {
      setIsUpdatingPersonalInfo(true);

      let imageUrl = "";
      if (avatarFile) {
        imageUrl = await uploadImage(supabaseClient, {
          id: data.user_id,
          image: avatarFile,
          bucket: "USER_AVATARS",
        });
        setUserAvatar(imageUrl);
      }

      await udpateUser(supabaseClient, {
        ...data,
        user_avatar: imageUrl ? imageUrl : data.user_avatar,
      });

      setUserInitials(
        `${capitalize(data.user_first_name[0])}${capitalize(
          data.user_last_name[0]
        )}`
      );

      notifications.show({
        message: "Personal info updated.",
        color: "green",
      });
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsUpdatingPersonalInfo(false);
    }
  };

  const handleChangePassword = async (data: ChangePasswordForm) => {
    try {
      setIsUpdatingPassword(true);
      await resetPassword(supabaseClient, data.password);
      notifications.show({
        message: "Password updated.",
        color: "green",
      });
      changePasswordFormMethods.reset();
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleUploadSignature = async (signature: File) => {
    try {
      setIsUpdatingSignature(true);

      const { data: signatureAttachment, url } = await createAttachment(
        supabaseClient,
        {
          attachmentData: {
            attachment_name: signature.name,
            attachment_bucket: "USER_SIGNATURES",
            attachment_value: user.user_id,
            attachment_id: user.user_signature_attachment_id
              ? user.user_signature_attachment_id
              : undefined,
          },
          file: signature,
        }
      );

      await udpateUser(supabaseClient, {
        user_id: user.user_id,
        user_signature_attachment_id: signatureAttachment.attachment_id,
      });

      setSignatureUrl(url);
      notifications.show({
        message: "Signature updated.",
        color: "green",
      });
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setOpenCanvas(false);
      setIsUpdatingSignature(false);
    }
  };

  return (
    <Container>
      <Title order={2}>User Settings</Title>

      <FormProvider {...personalInfoFormMethods}>
        <PersonalInfo
          onSavePersonalInfo={handleSavePersonalInfo}
          avatarFile={avatarFile}
          onAvatarFileChange={setAvatarFile}
          isUpdatingPersonalInfo={isUpdatingPersonalInfo}
        />
      </FormProvider>

      <FormProvider {...changePasswordFormMethods}>
        <ChangePassword
          onChangePassword={handleChangePassword}
          isUpdatingPassword={isUpdatingPassword}
        />
      </FormProvider>

      <UploadSignature
        onUploadSignature={handleUploadSignature}
        user={user}
        isUpdatingSignature={isUpdatingSignature}
        openCanvas={openCanvas}
        setOpenCanvas={setOpenCanvas}
        signatureFile={signatureFile}
        setSignatureFile={setSignatureFile}
        signatureUrl={signatureUrl}
      />
    </Container>
  );
};

export default UserSettingsPage;
