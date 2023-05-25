import { deleteForm } from "@/backend/api/delete";
import { updateFormVisibility } from "@/backend/api/update";
import { Database } from "@/utils/database";
import { FormWithOwnerType, TeamMemberWithUserType } from "@/utils/types";
import { Button, Container, Paper, Stack, Text, Title } from "@mantine/core";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

// Example
// const { data, count } = await getFormListWithFilter(supabaseClient, {
//   teamId: teamId,
//   app: "REQUEST",
//   page: 1,
//   limit: DEFAULT_FORM_LIST_LIMIT,
//   creator: ["eb4d3419-b70f-44ba-b88f-c3d983cbcf3b"],
//   status: "visible",
//   sort: "ascending",
//   search: "dup",
// });

type Props = {
  formList: FormWithOwnerType[];
  formListCount: number;
  teamMemberList: TeamMemberWithUserType[];
};

const RequestFormListPage = ({
  formList,
  formListCount,
  teamMemberList,
}: Props) => {
  const supabaseClient = createBrowserSupabaseClient<Database>();

  const handleUpdateFormVisiblity = async () => {
    await updateFormVisibility(supabaseClient, {
      formId: "b8408545-4354-47d0-a648-928c6755a94b",
      isHidden: true,
    });
  };

  const handleDeleteForm = async () => {
    await deleteForm(supabaseClient, {
      formId: "b8408545-4354-47d0-a648-928c6755a94b",
    });
  };
  return (
    <Container>
      <Title>Request Form List Page</Title>
      <Paper p="xl" mt="xl">
        <Text>Count: {formListCount}</Text>
        <pre>{JSON.stringify(formList, null, 2)}</pre>
      </Paper>
      <Paper p="xl" mt="xl">
        <pre>{JSON.stringify(teamMemberList, null, 2)}</pre>
      </Paper>
      <Stack mt="xl">
        <Button onClick={handleUpdateFormVisiblity}>
          Test Update Form Visibility
        </Button>
        <Button onClick={handleDeleteForm}>Test Delete Form</Button>
      </Stack>
    </Container>
  );
};

export default RequestFormListPage;
