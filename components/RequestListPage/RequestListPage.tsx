import { RequestType } from "@/utils/types";
import { Container, Paper, Title } from "@mantine/core";

type Props = {
  requestList: RequestType[];
};

const RequestListPage = ({ requestList }: Props) => {
  return (
    <Container>
      <Title>Request List Page</Title>
      <Paper p="xl" mt="xl">
        <pre>{JSON.stringify(requestList, null, 2)}</pre>
      </Paper>
    </Container>
  );
};

export default RequestListPage;
