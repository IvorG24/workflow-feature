import { Button, Container, Flex, Paper, Radio, Title } from "@mantine/core";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

type Data = {
  formType: "approval_form" | "review_form";
};

const FormsType = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Data>();

  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
    router.push("/forms/question");
  });

  return (
    <Container p="md" fluid>
      <Paper shadow="sm" p="lg" withBorder>
        <Title order={1} mb="xl">
          Create Form
        </Title>

        <form onSubmit={onSubmit}>
          <Radio.Group
            label="What type of form do you want to create?"
            error={errors.formType?.message}
          >
            <Flex direction="column" gap="sm" mt="xs">
              <Radio
                value="approval_form"
                label="Approval Form"
                {...register("formType", { required: "Form type required" })}
              />
              <Radio
                value="review_form"
                label="Review Form"
                {...register("formType")}
              />
            </Flex>
          </Radio.Group>

          <Button type="submit" my="lg" aria-label="continue">
            Continue
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default FormsType;
