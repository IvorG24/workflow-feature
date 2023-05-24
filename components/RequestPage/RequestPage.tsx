import { RequestWithResponseType } from "@/utils/types";
import { Container, Paper, Title } from "@mantine/core";

type Props = {
  request: RequestWithResponseType;
};

const RequestPage = ({ request }: Props) => {
  return (
    <Container>
      <Title>Request Page</Title>
      <Paper p="xl" mt="xl">
        <pre>{JSON.stringify(request, null, 2)}</pre>
      </Paper>
    </Container>
  );
};

export default RequestPage;
