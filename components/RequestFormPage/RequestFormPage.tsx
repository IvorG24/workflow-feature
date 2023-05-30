import { FormType } from "@/utils/types";
import { Button, Container, Flex, Stack, Title } from "@mantine/core";
import { useRouter } from "next/router";
import FormDetailsSection from "./FormDetailsSection";
import FormSection from "./FormSection";
import FormSignerSection from "./FormSignerSection";

type Props = {
  form: FormType;
};

const RequestFormPage = ({ form }: Props) => {
  const router = useRouter();
  const { formId } = router.query;
  console.log(form);
  return (
    <Container>
      <Flex justify="space-between">
        <Title order={2}>Form Preview</Title>
        <Button
          onClick={() => router.push(`/team-requests/forms/${formId}/create`)}
        >
          Create Request
        </Button>
      </Flex>
      <Stack spacing="xl" mt="xl">
        <FormDetailsSection form={form} />

        {form.form_section.map((section) => (
          <FormSection section={section} key={section.section_id} />
        ))}

        <FormSignerSection signerList={form.form_signer} />
      </Stack>
    </Container>
  );
};

export default RequestFormPage;
