import { Container, Title } from "@mantine/core";

// const guideFunction = async () => {
//   let imageUrl = "";
//   if (image) {
//     imageUrl = await uploadImage(supabaseClient, {
//       id: TEMP_USER_ID,
//       image: image,
//       bucket: "USER_AVATARS",
//     });
//   }
//   await createUser(supabaseClient, {
//     user_id: TEMP_USER_ID,
//     user_email: "test@gmail.com",
//     user_first_name: "John",
//     user_last_name: "Doe",
//     user_username: "johndoe",
//     user_avatar: imageUrl,
//   });
// };

const OnboardingPage = () => {
  return (
    <Container>
      <Title>Onboarding Page</Title>
    </Container>
  );
};

export default OnboardingPage;
