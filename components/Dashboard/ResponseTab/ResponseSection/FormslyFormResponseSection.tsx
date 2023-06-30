import { RequestResponseDataType } from "@/utils/types";
import { Box, Divider, Flex, Title } from "@mantine/core";
import FieldResponseTable from "./FieldResponseTable";

type ResponseSectionProps = {
  responseSection: RequestResponseDataType;
};

const FormslyFormResponseSection = ({
  responseSection,
}: ResponseSectionProps) => {
  const label = responseSection.sectionLabel;
  const responseData = responseSection.responseData.filter(
    (response) => response.field_name !== "General Name"
  );

  return (
    <Box p="md" w={{ base: "100%" }}>
      <Divider
        my="xs"
        label={<Title order={5}>{label}</Title>}
        labelPosition="center"
      />
      <Flex w="100%" wrap="wrap" gap="md">
        {responseData.map((response) => (
          <FieldResponseTable key={response.field_id} response={response} />
        ))}
      </Flex>
    </Box>
  );
};

export default FormslyFormResponseSection;
