// todo: Create deleteField query
// import deleteField from "@/services/field/deleteField";

import {
  FieldWithFieldArrayId,
  SectionWithFieldArrayId,
} from "@/utils/react-hook-form";
import { AppType, FieldWithChoices } from "@/utils/types";
import {
  Box,
  Button,
  Container,
  ContainerProps,
  Divider,
  TextInput,
  createStyles,
} from "@mantine/core";
import { IconCirclePlus } from "@tabler/icons-react";
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
          ? theme.colors.dark[6]
          : theme.colors.dark[7]
        : mode === "edit"
        ? theme.colors.gray[0]
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
        {fields.map((field, fieldIndex) => (
          <Box key={field.id} mt={fieldIndex === 0 ? 24 : 16}>
            <Field
              formType={formType}
              fieldIndex={fieldIndex}
              field={field as FieldWithFieldArrayId}
              sectionIndex={sectionIndex}
              onDelete={() => removeField(fieldIndex)}
              mode={mode}
            />
          </Box>
        ))}
      </Box>

      {mode === "edit" && (
        <>
          <Button
            onClick={() =>
              appendField({
                field_id: uuidv4(),
                field_name: "Field",
                field_type: formType === "REQUEST" ? "TEXT" : "SLIDER",
                field_section_id: section.section_id,
                form_id: formId,
                field_is_required: false,
                field_is_positive_metric: true,
                field_order: fields.length + 1,
              })
            }
            size="xs"
            mt={fields.length > 0 ? 32 : 64}
            leftIcon={<IconCirclePlus height={16} />}
          >
            Add a Field
          </Button>

          <Divider mt={24} />
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
        </>
      )}
    </Container>
  );
};

export default Section;
