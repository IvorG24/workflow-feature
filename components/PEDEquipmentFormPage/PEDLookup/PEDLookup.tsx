import { EquipmentLookupChoices } from "@/utils/types";
import { Container, Paper, Stack } from "@mantine/core";
import EquipmentLookup from "./EquipmentLookup/EquipmentLookup";

const PEDLookup = () => {
  const equipmentLookupList = [
    { table: "equipment_category", label: "Category" },
    { table: "equipment_brand", label: "Brand" },
    { table: "equipment_model", label: "Model" },
    {
      table: "capacity_unit_of_measurement",
      label: "Capacity Unif of Measurement",
    },
  ] as { table: EquipmentLookupChoices; label: string }[];

  return (
    <Container p={0} fluid pos="relative">
      <Stack>
        {equipmentLookupList.map((lookup, index) => (
          <Paper p="xl" shadow="xs" key={index}>
            <EquipmentLookup lookup={lookup} />
          </Paper>
        ))}
      </Stack>
    </Container>
  );
};

export default PEDLookup;
