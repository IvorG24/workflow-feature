import { UserWithSignatureType } from "@/utils/types";
import { Container, LoadingOverlay, Title } from "@mantine/core";
import { FormProvider, useForm } from "react-hook-form";
import ChangePassword from "./ChangePassword";
import PersonalInfo from "./PersonalInfo";

export type PersonalInfoForm = {
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
  new_password: string;
  confirm_password: string;
};

type Props = {
  user: UserWithSignatureType;
};

const UserSettingsPage = ({ user }: Props) => {
  const personalInfoFormMethods = useForm<PersonalInfoForm>({
    defaultValues: {
      user_email: user.user_email,
      user_username: user.user_username,
      user_first_name: user.user_first_name,
      user_last_name: user.user_last_name,
    },
  });

  const changePasswordFormMethods = useForm<ChangePasswordForm>();

  const handleSavePersonalInfo = async (data: PersonalInfoForm) => {
    console.log(data);
  };

  const handleChangePassword = async (data: ChangePasswordForm) => {
    console.log(data);
  };

  // const supabaseClient = createBrowserSupabaseClient<Database>();

  // const handleTestUpdateUser = async () => {
  //   try {
  //     await udpateUser(supabaseClient, {
  //       user_id: TEMP_USER_ID,
  //       user_first_name: "Updated First Name",
  //       user_last_name: "Updated Last Name",
  //       user_username: "updatedUserName",
  //       user_phone_number: "9856895689",
  //       user_job_title: "Updated Job Title",
  //     });
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  return (
    <Container fluid>
      <LoadingOverlay
        visible={false}
        overlayBlur={2}
        transitionDuration={500}
      />

      <Title>User Settings Page</Title>

      <FormProvider {...personalInfoFormMethods}>
        <PersonalInfo onSavePersonalInfo={handleSavePersonalInfo} />
      </FormProvider>

      <FormProvider {...changePasswordFormMethods}>
        <ChangePassword onChangePassword={handleChangePassword} />
      </FormProvider>
    </Container>
  );
};

export default UserSettingsPage;
