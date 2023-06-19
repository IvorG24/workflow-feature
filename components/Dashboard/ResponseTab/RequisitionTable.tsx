import { FormslyFormResponseDataType } from "@/utils/types";
import { Divider, Flex, Paper, Title } from "@mantine/core";
import ResponseTable from "./ResponseTable";

type ResponseTableProps = {
  response: FormslyFormResponseDataType;
};

const RequisitionTable = ({ response }: ResponseTableProps) => {
  const filterResponseData = response.responseData.filter(
    (d) => d.label !== "General Name"
  );

  return (
    <Paper mt="sm" p="md" w={{ base: "100%" }}>
      <Divider
        my="xs"
        label={<Title order={5}>{response.label}</Title>}
        labelPosition="center"
      />
      <Flex w="100%" wrap="wrap" gap="md">
        {filterResponseData.map((response, idx) => (
          <ResponseTable key={response.label + idx} response={response} />
        ))}
      </Flex>
    </Paper>
  );
};

export default RequisitionTable;
