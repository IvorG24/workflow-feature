import { ApplicationInformationFilterFormValues } from "@/utils/types";
import {
  Accordion,
  Box,
  Button,
  Drawer,
  Flex,
  MultiSelect,
  NumberInput,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { IconCalendar, IconFilter } from "@tabler/icons-react";
import { Controller, useFormContext } from "react-hook-form";

const sectionList = [
  {
    sectionName: "Request",
    sectionFieldList: [
      {
        id: "requestFilter.requestId",
        label: "Request ID",
        type: "TEXT",
      },
      {
        id: "requestFilter.dateCreatedRange",
        label: "Date Created",
        type: "DATE",
      },
      {
        id: "requestFilter.status",
        label: "Status",
        type: "MULTISELECT",
      },
      {
        id: "requestFilter.dateUpdatedRange",
        label: "Date Updated",
        type: "DATE",
      },
    ],
  },
  {
    sectionName: "Header",
    sectionFieldList: [
      {
        id: "responseFilter.position",
        label: "Position",
        type: "MULTISELECT",
      },
      {
        id: "responseFilter.certificate",
        label: "Certificate",
        type: "BOOLEAN",
      },
      {
        id: "responseFilter.license",
        label: "License",
        type: "BOOLEAN",
      },
      {
        id: "responseFilter.source",
        label: "Where did you learn the job vacancy?",
        type: "MULTISELECT",
      },
    ],
  },
  {
    sectionName: "Personal Information",
    sectionFieldList: [
      {
        id: "responseFilter.firstName",
        label: "First Name",
        type: "TEXT",
      },
      {
        id: "responseFilter.middleName",
        label: "Middle Name",
        type: "TEXT",
      },
      {
        id: "responseFilter.lastName",
        label: "Last Name",
        type: "TEXT",
      },
      {
        id: "responseFilter.gender",
        label: "Gender",
        type: "SELECT",
      },
      {
        id: "responseFilter.ageRange",
        label: "Age Range",
        type: "NUMBER",
      },
      {
        id: "responseFilter.civilStatus",
        label: "Civil Status",
        type: "MULTISELECT",
      },
    ],
  },
  {
    sectionName: "Contact Information",
    sectionFieldList: [
      {
        id: "responseFilter.contactNumber",
        label: "Contact Number",
        type: "TEXT",
      },
      {
        id: "responseFilter.emailAddress",
        label: "Email Address",
        type: "TEXT",
      },
      {
        id: "responseFilter.region",
        label: "Region",
        type: "TEXT",
      },
      {
        id: "responseFilter.province",
        label: "Province",
        type: "TEXT",
      },
      {
        id: "responseFilter.city",
        label: "City",
        type: "TEXT",
      },
      {
        id: "responseFilter.barangay",
        label: "Barangay",
        type: "TEXT",
      },
      {
        id: "responseFilter.street",
        label: "Street",
        type: "TEXT",
      },
      {
        id: "responseFilter.zipCode",
        label: "Zip Code",
        type: "TEXT",
      },
    ],
  },
  {
    sectionName: "ID Number",
    sectionFieldList: [
      {
        id: "responseFilter.sssId",
        label: "SSS ID",
        type: "TEXT",
      },
      {
        id: "responseFilter.philhealthNumber",
        label: "Philhealth Number",
        type: "TEXT",
      },
      {
        id: "responseFilter.pagibigNumber",
        label: "Pag IBIG Number",
        type: "TEXT",
      },
      {
        id: "responseFilter.tin",
        label: "TIN",
        type: "TEXT",
      },
    ],
  },
  {
    sectionName: "Educational Background",
    sectionFieldList: [
      {
        id: "responseFilter.highestEducationalAttainment",
        label: "Highest Educational Attainment",
        type: "MULTISELECT",
      },
      {
        id: "responseFilter.degree",
        label: "Degree",
        type: "TEXT",
      },
      {
        id: "responseFilter.torOrDiplomaAttachment",
        label: "TOR / Diploma Attachment",
        type: "BOOLEAN",
      },
      {
        id: "responseFilter.school",
        label: "School",
        type: "TEXT",
      },
      {
        id: "responseFilter.yearGraduated",
        label: "Year Graduated",
        type: "DATE",
      },
    ],
  },
  {
    sectionName: "Work Information",
    sectionFieldList: [
      {
        id: "responseFilter.employmentStatus",
        label: "Empoyment Status",
        type: "SELECT",
      },
      {
        id: "responseFilter.workedAtStaClara",
        label: "Already worked at Sta Clara before",
        type: "BOOLEAN",
      },
      {
        id: "responseFilter.willingToBeAssignedAnywhere",
        label: "Willing to be assigned anywhere",
        type: "BOOLEAN",
      },
      {
        id: "responseFilter.regionWillingToBeAssigned",
        label: "Region willing to be assigned",
        type: "MULTISELECT",
      },
      {
        id: "responseFilter.soonestJoiningDate",
        label: "Soonest Joining Date",
        type: "DATE",
      },
      {
        id: "responseFilter.workExperience",
        label: "Total months of relevant work experience",
        type: "NUMBER",
      },
      {
        id: "responseFilter.expectedSalary",
        label: "Expected Salary",
        type: "NUMBER",
      },
    ],
  },
];

type Props = {
  fetchData: (data?: ApplicationInformationFilterFormValues) => void;
};

const ApplicationInformationFilterMenu = ({ fetchData }: Props) => {
  const [isFilterMenuOpen, { open: openFilterMenu, close: closeFilterMenu }] =
    useDisclosure(false);

  const { handleSubmit, control, register } =
    useFormContext<ApplicationInformationFilterFormValues>();

  const renderResponse = (field: {
    id: string;
    label: string;
    type: string;
  }) => {
    switch (field.type) {
      case "TEXT":
        return (
          <TextInput
            label={field.label}
            {...register(field.id as "requestFilter")}
          />
        );
      case "DATE":
        return (
          <Stack spacing={0}>
            <Text size={14} fw={500}>
              {field.label}
            </Text>
            <Flex gap="xs">
              <Controller
                control={control}
                name={`${field.id}.start` as "requestFilter"}
                render={({ field: { value, onChange } }) => {
                  return (
                    <DateInput
                      placeholder="Start"
                      value={value as Date}
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
                name={`${field.id}.end` as "requestFilter"}
                render={({ field: { value, onChange } }) => {
                  return (
                    <DateInput
                      placeholder="End"
                      value={value as Date}
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
        );
      case "MULTISELECT":
        return (
          <Controller
            control={control}
            name={field.id as "requestFilter"}
            render={({ field: { value, onChange } }) => (
              <MultiSelect
                label={field.label}
                data={[]}
                value={value as string[]}
                onChange={onChange}
                clearable
              />
            )}
          />
        );
      case "SELECT":
        return (
          <Controller
            control={control}
            name={field.id as "requestFilter"}
            render={({ field: { value, onChange } }) => (
              <Select
                label={field.label}
                data={[]}
                value={value as string}
                onChange={onChange}
                clearable
              />
            )}
          />
        );
      case "BOOLEAN":
        return (
          <Controller
            control={control}
            name={field.id as "requestFilter"}
            render={({ field: { value, onChange } }) => (
              <Select
                label={field.label}
                data={[
                  { label: "True", value: "true" },
                  { label: "False", value: "false" },
                ]}
                value={value as string}
                onChange={onChange}
                clearable
              />
            )}
          />
        );
      case "NUMBER":
        return (
          <Stack spacing={0}>
            <Text size={14} fw={500}>
              {field.label}
            </Text>
            <Flex gap="xs">
              <Controller
                control={control}
                name={`${field.id}.start` as "requestFilter"}
                render={({ field: { value, onChange } }) => {
                  return (
                    <NumberInput
                      placeholder="Start"
                      value={value as number}
                      onChange={onChange}
                      sx={{ flex: 1 }}
                      hideControls
                    />
                  );
                }}
              />
              <Controller
                control={control}
                name={`${field.id}.end` as "requestFilter"}
                render={({ field: { value, onChange } }) => {
                  return (
                    <NumberInput
                      placeholder="End"
                      value={value as number}
                      onChange={onChange}
                      sx={{ flex: 1 }}
                      hideControls
                    />
                  );
                }}
              />
            </Flex>
          </Stack>
        );
    }
  };

  return (
    <>
      <Button leftIcon={<IconFilter size={16} />} onClick={openFilterMenu}>
        Filter
      </Button>
      <Drawer
        opened={isFilterMenuOpen}
        onClose={closeFilterMenu}
        position="right"
        title="Application Information Filter Menu"
        p={0}
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <Stack spacing="xs" sx={{ overflow: "hidden" }}>
          {sectionList.map((section, sectionIndex) => {
            return (
              <Accordion key={sectionIndex} variant="contained">
                <Accordion.Item value={section.sectionName}>
                  <Accordion.Control>
                    <Text color="dimmed">{section.sectionName}</Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack spacing="xs">
                      {section.sectionFieldList.map((field, fieldIndex) => {
                        return (
                          <Box key={fieldIndex}>{renderResponse(field)}</Box>
                        );
                      })}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            );
          })}
          <Button type="submit" mt="xs" onClick={handleSubmit(fetchData)}>
            Apply Filter
          </Button>
        </Stack>
      </Drawer>
    </>
  );
};

export default ApplicationInformationFilterMenu;
