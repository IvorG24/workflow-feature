import { FormWithTeamMember } from "@/utils/types";
import { Container, Text, Title } from "@mantine/core";

type Props = {
  forms: FormWithTeamMember[];
};

const RequestFormListPage = ({ forms }: Props) => {
  return (
    <Container>
      <Title>Request Form List Page</Title>

      {forms.map((form) => (
        <Text key={form.form_id}>{form.form_id}</Text>
      ))}
    </Container>
  );
};

export default RequestFormListPage;
