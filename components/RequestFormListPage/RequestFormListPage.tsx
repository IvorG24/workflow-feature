import { FormWithTeamMember } from "@/utils/types";
import {
  ActionIcon,
  Container,
  Flex,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import FormCard from "./FormCard";


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

// type Props = {
//   formList: FormWithOwnerType[];
//   formListCount: number;
//   teamMemberList: TeamMemberWithUserType[];
// };


type Props = {
  forms: FormWithTeamMember[];
};

type SearchForm = {
  search: string;
};

const RequestFormListPage = ({ forms }: Props) => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SearchForm>();

  const [isHiddenOnly, setIsHiddenOnly] = useState(false);

  // todo: handle search form
  const handleSearchForm = ({ search }: SearchForm) => {
    console.log(search);
  };

  // todo: handle hide form
  const handleHideForm = (id: string) => {
    console.log(id);
  };

  // todo: handle delete form
  const handleDeleteForm = (id: string) => {
    console.log(id);
  };

  // const handleUpdateFormVisiblity = async () => {
  //   await updateFormVisibility(supabaseClient, {
  //     formId: "b8408545-4354-47d0-a648-928c6755a94b",
  //     isHidden: true,
  //   });
  // };

  // const handleDeleteForm = async () => {
  //   await deleteForm(supabaseClient, {
  //     formId: "b8408545-4354-47d0-a648-928c6755a94b",
  //   });
  // };

  return (
    <Container p={0} fluid>
      <Title order={2}>Forms </Title>

      <Flex gap="xl" align="center" wrap="wrap" mt="xl">
        <form onSubmit={handleSubmit(handleSearchForm)}>
          <TextInput
            placeholder="Search form..."
            size="xs"
            rightSection={
              <ActionIcon size="xs" type="submit">
                <IconSearch />
              </ActionIcon>
            }
            {...register("search", {
              required: true,
              minLength: {
                value: 2,
                message: "Must have at least 2 characters",
              },
            })}
            error={errors.search?.message}
          />
        </form>

        <Switch
          label="Hidden only"
          size="xs"
          checked={isHiddenOnly}
          onChange={(event) => setIsHiddenOnly(event.currentTarget.checked)}
        />
      </Flex>

      <Flex
        justify={forms.length > 0 ? "flex-start" : "center"}
        align="center"
        gap="md"
        wrap="wrap"
        mih={170}
        mt="xl"
      >
        {forms.length > 0 ? (
          forms.map((form) => (
            <FormCard
              form={form}
              onDeleteForm={() => handleDeleteForm(form.form_id)}
              onHideForm={() => handleHideForm(form.form_id)}
              key={form.form_id}
            />
          ))
        ) : (
          <Text align="center" size={24} weight="bolder" color="dark.1">
            No form/s found for keyword &quot;{getValues("search")}&quot;
          </Text>
        )}
      </Flex>

      {/* <Paper p="xl" mt="xl">
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
      </Stack> */}
    </Container>
  );
};

export default RequestFormListPage;
