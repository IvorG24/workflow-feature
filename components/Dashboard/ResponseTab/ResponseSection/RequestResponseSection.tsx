import { RequestResponseDataType } from "@/utils/types";
import { Flex, Group, Paper, Title } from "@mantine/core";
import { IconBolt } from "@tabler/icons-react";
import FieldResponseTable from "./FieldResponseTable";

type RequestResponseSectionProps = {
  requestResponse: RequestResponseDataType[];
};

const RequestResponseSection = ({
  requestResponse,
}: RequestResponseSectionProps) => {
  const responseData = requestResponse.flatMap(
    (response) => response.responseData
  );

  return (
    <Paper mt="xl" p="xl">
      <Group spacing="xs" mb="lg">
        <IconBolt />
        <Title order={3}>Field Response Data</Title>
      </Group>
      <Flex gap="lg" wrap="wrap" justify="center">
        {responseData.map((response) => (
          <FieldResponseTable key={response.field_id} response={response} />
        ))}
      </Flex>
    </Paper>
  );
};

export default RequestResponseSection;
