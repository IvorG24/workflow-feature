import { FormType } from "@/utils/types";
import { Container, Paper, Title } from "@mantine/core";

type Props = {
  form: FormType;
};

const RequestFormPage = ({ form }: Props) => {
  return (
    <Container>
      <Title>Request Form Page</Title>
      <Paper p="xl" mt="xl">
        <pre>{JSON.stringify(form, null, 2)}</pre>
      </Paper>
    </Container>
  );
};

export default RequestFormPage;
