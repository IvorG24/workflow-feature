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
import { Dispatch, SetStateAction } from "react";
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
  mode?: Mode;
  activeField: string | null;
  onSetActiveField: Dispatch<SetStateAction<string | null>>;
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
  mode = "edit",
  activeField,
  onSetActiveField,
  ...props
}: Props) => {
  const { classes } = useStyles({ mode });
  const methods = useFormContext();
  const { colorScheme } = useMantineTheme();
  const {
    fields: fields,
    append: appendField,
    remove: removeField,
  } = useFieldArray({
    control: methods.control,
    name: `sections.${sectionIndex}.fields`,
  });

  const watchedData = useWatch({
    control: methods.control,
    defaultValue: section,
  });

  // this is to update the field order when a field is removed
  useDeepCompareEffect(() => {
    fields.forEach((field, index) => {
      methods.setValue(
        `sections.${sectionIndex}.fields.${index}.field_order`,
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
      <Box>
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
        {fields.map((field, fieldIndex) => {
          const field_id = methods.getValues(
            `sections.${sectionIndex}.fields.${fieldIndex}.field_id`
          );
          return (
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
                  isActive={activeField === field_id}
                  onNotActive={() => onSetActiveField(null)}
                />
              </Box>
              {activeField === null && (
                <ActionIcon
                  onClick={() => {
                    onSetActiveField(field_id);
                  }}
                  variant="light"
                  mt="lg"
                >
                  <IconSettings
                    color={colorScheme === "dark" ? "#c3c3c3" : "#2e2e2e"}
                    size={18}
                    stroke={1.5}
                  />
                </ActionIcon>
              )}
            </Flex>
          );
        })}
      </Box>

      {mode === "edit" && (
        <>
          <Button
            onClick={() => {
              const fieldId = uuidv4();
              appendField({
                field_id: fieldId,
                field_name: "",
                field_type: formType === "REQUEST" ? "TEXT" : "SLIDER",
                field_section_id: section.section_id,
                field_is_required: false,
                field_is_positive_metric: true,
                field_order: fields.length + 1,
              });
              onSetActiveField(fieldId);
            }}
            disabled={activeField !== null}
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
              sx={{
                input: {
                  cursor: "pointer",
                },
              }}
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
