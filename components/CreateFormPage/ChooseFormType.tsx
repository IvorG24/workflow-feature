// todo: create unit test
import { Button, Container, Flex, Paper, Radio, Title } from "@mantine/core";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

type Data = {
  formType: "approval" | "review";
};

const ChooseFormType = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Data>();
  const { tid } = router.query;

  const onSubmit = handleSubmit(async (data) => {
    router.push(`/t/${tid}/forms/create?step=2formType=${data.formType}`);
  });

  return (
    <Container p="md" maw={500}>
      <Paper shadow="sm" p="lg" withBorder mt="lg">
        <Title order={1} mb="xl">
          Create Form
        </Title>

        <form onSubmit={onSubmit}>
          <Radio.Group
            size="lg"
            label="What type of form do you want to create?"
            error={errors.formType?.message}
          >
            <Flex direction="column" gap="sm" mt="xs">
              <Radio
                size="sm"
                value="request"
                label="Request Form"
                {...register("formType", { required: "Form type required" })}
              />
              <Radio
                size="sm"
                value="review"
                label="Review Form"
                {...register("formType")}
              />
            </Flex>
          </Radio.Group>

          <Button type="submit" mt="xl" aria-label="continue">
            Continue
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default ChooseFormType;
