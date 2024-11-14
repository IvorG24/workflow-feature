import { OptionType, TradeTestFilterFormValues } from "@/utils/types";
import {
  Accordion,
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
import { DateInput, DateTimePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { IconCalendar, IconFilter } from "@tabler/icons-react";
import { Controller, useFormContext } from "react-hook-form";

type Props = {
  fetchData: (data?: TradeTestFilterFormValues) => void;
  handleReset: () => void;
  positionOptionList: OptionType[];
  hrOptionList: OptionType[];
  isLoading: boolean;
};

const TradeTestFilterMenu = ({
  fetchData,
  handleReset,
  positionOptionList,
  hrOptionList,
  isLoading,
}: Props) => {
  const [isFilterMenuOpen, { open: openFilterMenu, close: closeFilterMenu }] =
    useDisclosure(false);

  const { handleSubmit, control, register } =
    useFormContext<TradeTestFilterFormValues>();

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
        title="Practical Test Filter Menu"
        p={0}
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <form
          onSubmit={handleSubmit((data) => {
            fetchData({ ...data, page: 1 });
            closeFilterMenu();
          })}
        >
          <Stack spacing="xs" sx={{ overflow: "hidden" }}>
            <Stack spacing="xs" sx={{ overflow: "hidden" }}>
              <Accordion variant="contained" defaultValue="Practical Test">
                <Accordion.Item value="Application Information">
                  <Accordion.Control>Application Information</Accordion.Control>
                  <Accordion.Panel>
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
                      <TextInput label="Name" {...register("applicant_name")} />
                      <TextInput
                        label="Contact Number"
                        {...register("applicant_contact_number")}
                      />
                      <TextInput
                        label="Email"
                        {...register("applicant_email")}
                      />
                      <TextInput
                        label="Application Information Request ID"
                        {...register("application_information_request_id")}
                      />
                      <Stack spacing={0}>
                        <Text size={14} fw={500}>
                          Application Information Score
                        </Text>
                        <Flex gap="xs">
                          <Controller
                            control={control}
                            name="application_information_score.start"
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
                            name="application_information_score.end"
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
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="General Assessment">
                  <Accordion.Control>General Assessment</Accordion.Control>
                  <Accordion.Panel>
                    <Stack spacing="xs" sx={{ overflow: "hidden" }}>
                      <TextInput
                        label="General Assessment Request ID"
                        {...register("general_assessment_request_id")}
                      />
                      <Stack spacing={0}>
                        <Text size={14} fw={500}>
                          General Assessment Score
                        </Text>
                        <Flex gap="xs">
                          <Controller
                            control={control}
                            name="general_assessment_score.start"
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
                            name="general_assessment_score.end"
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
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="Technical Assessment">
                  <Accordion.Control>Technical Assessment</Accordion.Control>
                  <Accordion.Panel>
                    <Stack spacing="xs" sx={{ overflow: "hidden" }}>
                      <TextInput
                        label="Technical Assessment Request ID"
                        {...register("technical_assessment_request_id")}
                      />
                      <Stack spacing={0}>
                        <Text size={14} fw={500}>
                          Technical Assessment Score
                        </Text>
                        <Flex gap="xs">
                          <Controller
                            control={control}
                            name="technical_assessment_score.start"
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
                            name="technical_assessment_score.end"
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
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="Practical Test">
                  <Accordion.Control>Practical Test</Accordion.Control>
                  <Accordion.Panel>
                    <Stack spacing="xs" sx={{ overflow: "hidden" }}>
                      <Stack spacing={0}>
                        <Text size={14} fw={500}>
                          Practical Test Date Created
                        </Text>
                        <Flex gap="xs">
                          <Controller
                            control={control}
                            name="trade_test_date_created.start"
                            render={({ field: { value, onChange } }) => {
                              const newValue = value
                                ? new Date(value as string)
                                : null;
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
                            name="trade_test_date_created.end"
                            render={({ field: { value, onChange } }) => {
                              const newValue = value
                                ? new Date(value as string)
                                : null;
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
                      <Controller
                        control={control}
                        name="trade_test_status"
                        render={({ field: { value, onChange } }) => {
                          const newValue = value ?? [];
                          return (
                            <MultiSelect
                              label="Practical Test Status"
                              data={[
                                { value: "PENDING", label: "Pending" },
                                { value: "QUALIFIED", label: "Qualified" },
                                {
                                  value: "NOT QUALIFIED",
                                  label: "Not Qualified",
                                },
                                {
                                  value: "WAITING FOR SCHEDULE",
                                  label: "Waiting for Schedule",
                                },
                                {
                                  value: "NOT RESPONSIVE",
                                  label: "Not Responsive",
                                },
                                {
                                  value: "CANCELLED",
                                  label: "Cancelled",
                                },
                                {
                                  value: "MISSED",
                                  label: "Missed",
                                },
                              ]}
                              value={newValue as string[]}
                              onChange={onChange}
                              clearable
                              searchable
                            />
                          );
                        }}
                      />
                      <Stack spacing={0}>
                        <Text size={14} fw={500}>
                          Practical Test Schedule
                        </Text>
                        <Flex gap="xs">
                          <Controller
                            control={control}
                            name="trade_test_schedule.start"
                            render={({ field: { value, onChange } }) => {
                              const newValue = value
                                ? new Date(value as string)
                                : null;
                              return (
                                <DateTimePicker
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
                            name="trade_test_schedule.end"
                            render={({ field: { value, onChange } }) => {
                              const newValue = value
                                ? new Date(value as string)
                                : null;
                              return (
                                <DateTimePicker
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
                      <Controller
                        control={control}
                        name="assigned_hr"
                        render={({ field: { value, onChange } }) => {
                          const newValue = value ?? [];
                          return (
                            <MultiSelect
                              label="Assigned HR"
                              data={hrOptionList}
                              value={newValue as string[]}
                              onChange={onChange}
                              clearable
                              searchable
                            />
                          );
                        }}
                      />
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </Stack>

            <Button
              variant="light"
              mt="xs"
              onClick={() => {
                handleReset();
                closeFilterMenu();
              }}
              disabled={isLoading}
            >
              Reset Filter
            </Button>
            <Button type="submit" disabled={isLoading}>
              Apply Filter
            </Button>
          </Stack>
        </form>
      </Drawer>
    </>
  );
};

export default TradeTestFilterMenu;
