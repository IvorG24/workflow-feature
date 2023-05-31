// todo: Create deleteField query
// import deleteField from "@/services/field/deleteField";

import {
  FieldWithFieldArrayId,
  SectionWithFieldArrayId,
} from "@/utils/react-hook-form";
import { AppType, FieldWithChoices } from "@/utils/types";
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Container,
  ContainerProps,
  Divider,
  Flex,
  TextInput,
  createStyles,
  useMantineTheme,
} from "@mantine/core";
import { IconCirclePlus, IconSettings } from "@tabler/icons-react";
import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import useDeepCompareEffect from "use-deep-compare-effect";
import { v4 as uuidv4 } from "uuid";
import Field from "./Field";

export type Mode = "answer" | "edit" | "view";

type Props = {
  formType: AppType;
  section: SectionWithFieldArrayId;
  sectionIndex: number;
  onDelete?: (sectionId: string) => void;
  fields: FieldWithChoices[];
  formId?: string;
  mode?: Mode;
} & ContainerProps;

type UseStylesProps = {
  mode: Mode;
};

const useStyles = createStyles((theme, { mode }: UseStylesProps) => ({
  container: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? mode === "edit"
          ? theme.colors.dark[7]
          : theme.colors.dark[7]
        : "#fff",
    borderRadius: 4,
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[2]
    }
    `,
    paddingInline: "32px",
    paddingTop: "16px",
    paddingBottom: mode === "edit" ? "16px" : "32px",
  },
  sectionName: {
    "& input": {
      fontSize: 18,
      fontWeight: 500,
    },
  },
}));

const Section = ({
  formType,
  section,
  sectionIndex,
  onDelete,
  formId,
  mode = "edit",
  ...props
}: Props) => {
  const { classes } = useStyles({ mode });
  const methods = useFormContext();
  const [activeField, setActiveField] = useState<number | null>(null);
  const [savedField, setSavedField] = useState<FieldWithChoices | null>(null);

  const { colorScheme } = useMantineTheme();
  const {
    fields: fields,
    append: appendField,
    remove: removeField,
  } = useFieldArray({
    control: methods.control,
    name: `sections.${sectionIndex}.field_table`,
  });

  const watchedData = useWatch({
    control: methods.control,
    defaultValue: section,
  });

  const handleChangeActiveField = (index: number | null) => {
    setActiveField(index);
  };

  // this is to update the field order when a field is removed
  useDeepCompareEffect(() => {
    fields.forEach((field, index) => {
      methods.setValue(
        `sections.${sectionIndex}.field_table.${index}.field_order`,
        index + 1
      );
    });
  }, [watchedData]);

  return (
    <Container
      maw={768}
      className={classes.container}
      key={section.id}
      {...props}
    >
      <Box maw={522}>
        {!(mode === "answer" && !section.section_name) && (
          <Box>
            <TextInput
              variant="unstyled"
              size="lg"
              className={classes.sectionName}
              {...methods.register(`sections.${sectionIndex}.section_name`)}
              aria-label={`sections.${sectionIndex}.name`}
              placeholder="Section Name"
              readOnly={mode !== "edit"}
            />
            {mode === "edit" && <Divider mt={-4} />}
          </Box>
        )}
        {fields.map((field, fieldIndex) => (
          <Flex
            align="center"
            gap="xs"
            key={field.id}
            mt={fieldIndex === 0 ? 24 : 16}
            w="100%"
          >
            <Box w="100%">
              <Field
                formType={formType}
                fieldIndex={fieldIndex}
                field={field as FieldWithFieldArrayId}
                sectionIndex={sectionIndex}
                onDelete={() => removeField(fieldIndex)}
                mode={mode}
                isActive={activeField === fieldIndex}
                onNotActive={() => handleChangeActiveField(null)}
                onCancel={() => {
                  handleChangeActiveField(null);
                  methods.setValue(
                    `sections.${sectionIndex}.field_table.${fieldIndex}`,
                    savedField
                  );
                }}
              />
            </Box>
            {activeField === null && (
              <ActionIcon
                onClick={() => {
                  const fieldData = methods.getValues(
                    `sections.${sectionIndex}.field_table.${fieldIndex}`
                  );
                  console.log("edit");
                  console.log(fieldData);
                  setSavedField(fieldData);
                  handleChangeActiveField(fieldIndex);
                }}
                mt="lg"
              >
                <IconSettings
                  color={colorScheme === "dark" ? "#c3c3c3" : "#2e2e2e"}
                  size={18}
                />
              </ActionIcon>
            )}
          </Flex>
        ))}
      </Box>

      {mode === "edit" && (
        <>
          <Button
            onClick={() => {
              appendField({
                field_id: uuidv4(),
                field_name: "Field",
                field_type: formType === "REQUEST" ? "TEXT" : "SLIDER",
                field_section_id: section.section_id,
                form_id: formId,
                field_is_required: false,
                field_is_positive_metric: true,
                field_order: fields.length + 1,
              });
              handleChangeActiveField(fields.length);
            }}
            size="xs"
            mt={fields.length > 0 ? 32 : 64}
            leftIcon={<IconCirclePlus height={16} />}
          >
            Add a Field
          </Button>

          <Divider mt={24} />

          <Flex justify="space-between">
            <Checkbox
              label="Duplicatable section"
              {...methods.register(
                `sections.${sectionIndex}.section_is_duplicatable`
              )}
              mt="md"
            />

            <Button
              size="xs"
              color="red"
              variant="subtle"
              mt={16}
              onClick={() => {
                onDelete && onDelete(section.section_id);
              }}
            >
              Remove Section
            </Button>
          </Flex>
        </>
      )}
    </Container>
  );
};

export default Section;
