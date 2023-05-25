import { RequestType } from "@/utils/types";
import { Container, Paper, Text, Title } from "@mantine/core";

// EXAMPLE
// const { data, count } = await getRequestList(supabaseClient, {
//   teamId: teamId,
//   page: 1,
//   limit: DEFAULT_REQUEST_LIST_LIMIT,
//   requestor: ["eb4d3419-b70f-44ba-b88f-c3d983cbcf3b"],
//   status: ["APPROVED"],
//   form: [
//     "b8408545-4354-47d0-a648-928c6755a94b",
//     "337658f1-0777-45f2-853f-b6f20551712e",
//   ],
//   sort: "ascending",
//   search: "45820673-8b88-4d15-a4bf-12d67f140929",
// });

type Props = {
  requestList: RequestType[];
  requestListCount: number;
};

const RequestListPage = ({ requestList, requestListCount }: Props) => {
  return (
    <Container>
      <Title>Request List Page</Title>
      <Paper p="xl" mt="xl">
        <Text>Count: {requestListCount}</Text>
        <pre>{JSON.stringify(requestList, null, 2)}</pre>
      </Paper>
    </Container>
  );
};

export default RequestListPage;
