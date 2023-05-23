import { udpateUser } from "@/backend/api/update";
import { Database } from "@/utils/database";
import { TEMP_USER_ID } from "@/utils/dummyData";
import { UserWithSignatureType } from "@/utils/types";
import { Button, Container, Paper, Stack, Title } from "@mantine/core";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

type Props = {
  user: UserWithSignatureType;
};

const UserSettingsPage = ({ user }: Props) => {
  const supabaseClient = createBrowserSupabaseClient<Database>();

  const handleTestUpdateUser = async () => {
    try {
      await udpateUser(supabaseClient, {
        user_id: TEMP_USER_ID,
        user_first_name: "Updated First Name",
        user_last_name: "Updated Last Name",
        user_username: "updatedUserName",
        user_phone_number: "9856895689",
        user_job_title: "Updated Job Title",
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Container>
      <Title>User Settings Page</Title>
      <Paper p="xl" mt="xl">
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </Paper>
      <Stack mt="xl">
        <Button onClick={handleTestUpdateUser}>Test Update User</Button>
      </Stack>
    </Container>
  );
};

export default UserSettingsPage;
