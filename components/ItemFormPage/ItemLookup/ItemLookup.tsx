import { Container, Paper, Stack } from "@mantine/core";
import CategoryLookup from "./CategoryLookup/CategoryLookup";

const ItemLookup = () => {
  const serviceLookupList = [
    {
      table: "item_unit_of_measurement",
      label: "Unit of Measurement",
      schema: "unit_of_measurement_schema",
    },
    { table: "supplier", label: "Supplier", schema: "team_schema" },
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

export default ItemLookup;
