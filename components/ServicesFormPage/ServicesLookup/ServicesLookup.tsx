import { Container, Paper, Stack } from "@mantine/core";
import CategoryLookup from "./CategoryLookup/CategoryLookup";

const ServicesLookup = () => {
  const serviceLookupList = [
    { table: "service_category", label: "Category", schema: "public" },
    {
      table: "general_unit_of_measurement",
      label: "Unit of Measurement",
      schema: "public",
    },
    { table: "supplier", label: "Supplier", schema: "public" },
  ] as { table: string; label: string; schema: string }[];

  return (
    <Container p={0} fluid pos="relative">
      <Stack>
        {serviceLookupList.map((lookup, index) => (
          <Paper p="xl" shadow="xs" key={index}>
            <CategoryLookup lookup={lookup} />
          </Paper>
        ))}
      </Stack>
    </Container>
  );
};

export default ServicesLookup;
