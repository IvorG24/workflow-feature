import { createUser, uploadImage } from "@/backend/api/post";
import Meta from "@/components/Meta/Meta";
import OnboardingPage from "@/components/OnboardingPage/OnboardingPage";
import { LoadingOverlay } from "@mantine/core";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

export type OnboardUserParams = {
  user_id: string;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  user_username: string;
  user_avatar: string;
  user_phone_number: string;
  user_job_title: string;
};

type TempUser = { id: string; email: string };

const tempUser: TempUser = {
  id: uuidv4(),
  email: "johndoe3@gmail.com",
};

const Page = () => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onboardUserMethods = useForm<OnboardUserParams>({
    defaultValues: { user_id: tempUser.id, user_email: tempUser.email },
  });

  const handleOnboardUser = async (data: OnboardUserParams) => {
    try {
      setIsLoading(true);

      let imageUrl = "";
      if (avatarFile) {
        imageUrl = await uploadImage(supabaseClient, {
          id: data.user_id,
          image: avatarFile,
          bucket: "USER_AVATARS",
        });
      }

      await createUser(supabaseClient, {
        ...data,
        user_avatar: imageUrl,
      });

      router.push("/");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...onboardUserMethods}>
      <LoadingOverlay
        visible={isLoading}
        overlayBlur={2}
        sx={{ position: "fixed" }}
      />
      <Meta description="Onboarding Page" url="/onboarding" />
      <OnboardingPage
        onOnboardUser={handleOnboardUser}
        avatarFile={avatarFile}
        onAvatarFileChange={(value) => setAvatarFile(value)}
      />
    </FormProvider>
  );
};

export default Page;
