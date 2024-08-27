import { HRScreeningFilterFormValues, OptionType } from "@/utils/types";
import {
  Button,
  Drawer,
  Flex,
  MultiSelect,
  NumberInput,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { IconCalendar, IconFilter } from "@tabler/icons-react";
import { Controller, useFormContext } from "react-hook-form";

type Props = {
  fetchData: (data?: HRScreeningFilterFormValues) => void;
  handleReset: () => void;
  positionOptionList: OptionType[];
};

const HRScreeningFilterMenu = ({
  fetchData,
  handleReset,
  positionOptionList,
}: Props) => {
  const [isFilterMenuOpen, { open: openFilterMenu, close: closeFilterMenu }] =
    useDisclosure(false);

  const { handleSubmit, control, register } =
    useFormContext<HRScreeningFilterFormValues>();

  return (
    <>
      <Button
        leftIcon={<IconFilter size={16} />}
        variant="light"
        onClick={openFilterMenu}
      >
        Filter
      </Button>
      <Drawer
        opened={isFilterMenuOpen}
        onClose={closeFilterMenu}
        position="right"
        title="HR Screening Filter Menu"
        p={0}
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <form
          onSubmit={handleSubmit((data) => fetchData({ ...data, page: 1 }))}
        >
          <Stack spacing="xs" sx={{ overflow: "hidden" }}>
            <Controller
              control={control}
              name="position"
              render={({ field: { value, onChange } }) => {
                const newValue = value ?? [];
                return (
                  <MultiSelect
                    label="Position"
                    data={positionOptionList}
                    value={newValue as string[]}
                    onChange={onChange}
                    clearable
                    searchable
                  />
                );
              }}
            />
            <TextInput
              label="Application Information Request ID"
              {...register("application_information_request_id")}
            />
            <TextInput
              label="Online Application Request ID"
              {...register("online_application_request_id")}
            />
            <Stack spacing={0}>
              <Text size={14} fw={500}>
                Online Application Score
              </Text>
              <Flex gap="xs">
                <Controller
                  control={control}
                  name="online_application_score.start"
                  render={({ field: { value, onChange } }) => {
                    const newValue = value ?? "";
                    return (
                      <NumberInput
                        placeholder="Start"
                        value={newValue as number}
                        onChange={onChange}
                        sx={{ flex: 1 }}
                        hideControls
                      />
                    );
                  }}
                />
                <Controller
                  control={control}
                  name="online_application_score.end"
                  render={({ field: { value, onChange } }) => {
                    const newValue = value ?? "";
                    return (
                      <NumberInput
                        placeholder="End"
                        value={newValue as number}
                        onChange={onChange}
                        sx={{ flex: 1 }}
                        hideControls
                      />
                    );
                  }}
                />
              </Flex>
            </Stack>
            <TextInput
              label="Online Assessment Request ID"
              {...register("online_assessment_request_id")}
            />
            <Stack spacing={0}>
              <Text size={14} fw={500}>
                Online Assessment Score
              </Text>
              <Flex gap="xs">
                <Controller
                  control={control}
                  name="online_assessment_score.start"
                  render={({ field: { value, onChange } }) => {
                    const newValue = value ?? "";
                    return (
                      <NumberInput
                        placeholder="Start"
                        value={newValue as number}
                        onChange={onChange}
                        sx={{ flex: 1 }}
                        hideControls
                      />
                    );
                  }}
                />
                <Controller
                  control={control}
                  name="online_assessment_score.end"
                  render={({ field: { value, onChange } }) => {
                    const newValue = value ?? "";
                    return (
                      <NumberInput
                        placeholder="End"
                        value={newValue as number}
                        onChange={onChange}
                        sx={{ flex: 1 }}
                        hideControls
                      />
                    );
                  }}
                />
              </Flex>
            </Stack>
            <Stack spacing={0}>
              <Text size={14} fw={500}>
                Online Assessment Date
              </Text>
              <Flex gap="xs">
                <Controller
                  control={control}
                  name="online_assessment_date.start"
                  render={({ field: { value, onChange } }) => {
                    const newValue = value ? new Date(value as string) : null;
                    return (
                      <DateInput
                        placeholder="Start"
                        value={newValue as Date}
                        onChange={onChange}
                        clearable
                        icon={<IconCalendar size={16} />}
                        sx={{ flex: 1 }}
                      />
                    );
                  }}
                />
                <Controller
                  control={control}
                  name="online_assessment_date.end"
                  render={({ field: { value, onChange } }) => {
                    const newValue = value ? new Date(value as string) : null;
                    return (
                      <DateInput
                        placeholder="End"
                        value={newValue as Date}
                        onChange={onChange}
                        clearable
                        icon={<IconCalendar size={16} />}
                        sx={{ flex: 1 }}
                      />
                    );
                  }}
                />
              </Flex>
            </Stack>
            <Button variant="light" mt="xs" onClick={handleReset}>
              Reset Filter
            </Button>
            <Button type="submit">Apply Filter</Button>
          </Stack>
        </form>
      </Drawer>
    </>
  );
};

export default HRScreeningFilterMenu;
