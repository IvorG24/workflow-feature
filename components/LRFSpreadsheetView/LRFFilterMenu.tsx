import { OptionType } from "@/utils/types";
import { Button, Drawer, MultiSelect, Stack } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { IconFilter } from "@tabler/icons-react";
import { Controller, useFormContext } from "react-hook-form";
import { FilterFormValues } from "./LRFSpreadsheetView";

type Props = {
  projectListOptions: OptionType[];
  handleFilterData: (data: FilterFormValues) => void;
};

const LRFFilterMenu = ({ projectListOptions, handleFilterData }: Props) => {
  const [isFilterMenuOpen, { open: openFilterMenu, close: closeFilterMenu }] =
    useDisclosure(false);

  const { handleSubmit, control } = useFormContext<FilterFormValues>();

  return (
    <>
      <Button leftIcon={<IconFilter size={16} />} onClick={openFilterMenu}>
        Filter
      </Button>
      <Drawer
        opened={isFilterMenuOpen}
        onClose={closeFilterMenu}
        position="right"
        title="Spreadsheet Filter Menu"
      >
        <Stack p="sm">
          <Controller
            control={control}
            name="projectFilter"
            render={({ field: { value, onChange } }) => (
              <MultiSelect
                placeholder="Filter by Project"
                data={projectListOptions}
                value={value}
                onChange={(value) => onChange(value)}
                clearable
              />
            )}
          />
          <Controller
            control={control}
            name="dateFilter"
            render={({ field: { value, onChange } }) => (
              <DatePickerInput
                placeholder="Filter by Date"
                type="range"
                allowSingleDateInRange
                value={value}
                onChange={(value) => onChange(value)}
                maxDate={new Date()}
                clearable
              />
            )}
          />

          <Button type="submit" onClick={handleSubmit(handleFilterData)}>
            Apply Filter
          </Button>
        </Stack>
      </Drawer>
    </>
  );
};

export default LRFFilterMenu;
