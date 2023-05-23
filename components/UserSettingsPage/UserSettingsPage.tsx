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

type UserProfile = {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
};

const tempUserProfile: UserProfile = {
  email: "johndoe@gmail.com",
  username: "johndoe",
  firstName: "John",
  lastName: "Doe",
};

const UserSettingsPage = () => {
  const personalInfoFormMethods = useForm<PersonalInfoForm>({
    defaultValues: {
      user_email: tempUserProfile.email,
      user_username: tempUserProfile.username,
      user_first_name: tempUserProfile.firstName,
      user_last_name: tempUserProfile.lastName,
    },
  });

  const changePasswordFormMethods = useForm<ChangePasswordForm>();

  const handleSavePersonalInfo = async (data: PersonalInfoForm) => {
    console.log(data);
  };

  const handleChangePassword = async (data: ChangePasswordForm) => {
    console.log(data);
  };

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
