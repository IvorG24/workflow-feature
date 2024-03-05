import { Container, Paper, Stack } from "@mantine/core";
import CategoryLookup from "./CategoryLookup/CategoryLookup";

const ItemLookup = () => {
  const serviceLookupList = [
    { table: "item_unit_of_measurement", label: "Unit of Measurement" },
  ] as { table: string; label: string }[];

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