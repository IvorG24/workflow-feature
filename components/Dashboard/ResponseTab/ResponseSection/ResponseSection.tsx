import { RequestResponseDataType } from "@/utils/types";
import { Divider, Flex, Paper, Title } from "@mantine/core";
import ResponseDataTable from "./ResponseDataTable";

type ResponseSectionProps = {
  responseSection: RequestResponseDataType;
};

const ResponseSection = ({ responseSection }: ResponseSectionProps) => {
  const label = responseSection.sectionLabel;
  const responseData = responseSection.responseData.filter(
    (response) => response.field_name !== "General Name"
  );

  return (
    <Paper mt="sm" p="md" w={{ base: "100%" }}>
      <Divider
        my="xs"
        label={<Title order={5}>{label}</Title>}
        labelPosition="center"
      />
      <Flex w="100%" wrap="wrap" gap="md">
        {responseData.map((response) => (
          <ResponseDataTable key={response.field_id} response={response} />
        ))}
      </Flex>
    </Paper>
  );
};

export default ResponseSection;
