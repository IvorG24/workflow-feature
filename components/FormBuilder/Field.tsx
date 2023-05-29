// todo: implement delete option query
// import deleteChoice from "@/services/option/deleteChoice";
import { FieldWithFieldArrayId } from "@/utils/react-hook-form";
import { AppType, FieldType } from "@/utils/types";
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  Group,
  MultiSelect,
  NumberInput,
  Paper,
  Radio,
  Select,
  SelectProps,
  Slider,
  Text,
  TextInput,
  Textarea,
  Tooltip,
  createStyles,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useClickOutside } from "@mantine/hooks";
import {
  IconArrowBigDownLine,
  IconArrowBigUpLine,
  IconCirclePlus,
  IconInfoCircle,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import {
  Controller,
  get,
  useFieldArray,
  useFormContext,
} from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { FormBuilderData } from "./FormBuilder";
import Option from "./Option";
import OptionContainer from "./OptionContainer";
import { Mode } from "./Section";

type Props = {
  formType: AppType;
  field: FieldWithFieldArrayId;
  fieldIndex: number;
  sectionIndex: number;
  onDelete: (fieldIndex: number) => void;
  mode: Mode;
};

type UseStylesProps = {
  mode: Mode;
};

const useStyles = createStyles((theme, { mode }: UseStylesProps) => ({
  notActiveContainer: {
    cursor: mode === "edit" ? "pointer" : "auto",
    position: "relative",
  },
  previewField: {
    pointerEvents: mode === "edit" ? "none" : "auto",
    label: {
      display: "flex",
    },
  },
  paper: {
    border: `1px solid ${theme.colors.blue[6]}`,
    position: "relative",
  },
  closeIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  radioGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  booleanGroup: {
    display: "flex",
    justifyContent: "center",
    gap: 16,
  },

  radio: {
    cursor: "pointer",
  },
  sliderLabel: {
    fontWeight: 600,
    paddingRight: 60,
  },

  pointerEventsNone: {
    pointerEvents: "none",
  },

  fullWidth: {
    width: "100%",
  },

  checkboxCursor: {
    input: {
      cursor: "pointer",
    },
  },
}));

const Field = ({
  formType,
  field,
  fieldIndex,
  sectionIndex,
  onDelete,
  mode = "edit",
}: Props) => {
  const [isActive, setIsActive] = useState(false);
  const [fieldPrompt, setFieldPrompt] = useState(field.field_name);
  const [fieldDescription, setFieldDescription] = useState(
    field.field_description || ""
  );
  const [isFieldRequired, setIsFieldRequired] = useState(
    field.field_is_required
  );
  const [isFieldPositive, setIsFieldPositive] = useState(
    field.field_is_positive_metric
  );
  const [isSelectingFieldType, setIsSelectingFieldType] = useState(false);

  const ref = useClickOutside(() => {
    if (!isSelectingFieldType) {
      setIsActive(false);
    }
  });

  const {
    watch,
    control,
    register,
    getValues,
    formState: { errors },
  } = useFormContext<FormBuilderData>();
  const {
    fields: options,
    append: appendChoice,
    remove: removeChoice,
  } = useFieldArray({
    control: control,
    name: `sections.${sectionIndex}.field_table.${fieldIndex}.options`,
  });

  const optionsWatch = watch(
    `sections.${sectionIndex}.field_table.${fieldIndex}.options`
  );
  const optionsDropdownData = optionsWatch?.map((option) => ({
    value: option.option_id,
    label: option.option_value,
  }));

  const { classes } = useStyles({ mode });

  const fieldType = watch(
    `sections.${sectionIndex}.field_table.${fieldIndex}.field_type`
  );

  const requestTypeOptions = [
    { value: "TEXT", label: "Text" },
    { value: "NUMBER", label: "Number" },
    { value: "TEXTAREA", label: "Text Area" },
    { value: "SELECT", label: "Select" },
    { value: "MULTISELECT", label: "Multiselect" },
    { value: "SLIDER", label: "Slider" },
    { value: "DATE", label: "Date" },
  ];

  const reviewTypeOptions = [
    { value: "SLIDER", label: "Slider" },
    { value: "BOOLEAN", label: "Boolean" },
  ];

  const typeOptions =
    formType === "REQUEST" ? requestTypeOptions : reviewTypeOptions;

  const fieldPromptName = `sections.${sectionIndex}.field_table.${fieldIndex}.field_response`;
  const fieldPromptError = get(errors, fieldPromptName);

  if (!isActive) {
    const step = 1;
    const fieldMin = 1;
    const fieldMax = 5;
    const getMarks = () => {
      const marks = [];
      for (let i = fieldMin; i <= fieldMax; i += step) {
        marks.push({
          value: i,
          label: i.toString(),
        });
      }
      return marks;
    };

    const label = (
      <FieldLabel
        formType={formType}
        isFieldPositive={isFieldPositive}
        fieldDescription={fieldDescription}
        fieldPrompt={fieldPrompt}
        fieldType={fieldType as FieldType}
      />
    );
    return (
      <Box
        role="button"
        aria-label="click to edit field"
        onClick={() => {
          if (mode === "edit") setIsActive(true);
        }}
        className={classes.notActiveContainer}
      >
        {fieldType === "TEXT" && (
          <TextInput
            label={label}
            className={`${classes.previewField} ${
              mode === "view" && classes.pointerEventsNone
            }`}
            withAsterisk={isFieldRequired}
            {...register(
              `sections.${sectionIndex}.field_table.${fieldIndex}.field_response`,
              {
                required: {
                  value: isFieldRequired,
                  message: "Field is required",
                },
              }
            )}
            error={
              fieldPromptError ? (
                <Text color="red" size="sm">
                  Field is required
                </Text>
              ) : null
            }
            readOnly
          />
        )}

        {fieldType === "NUMBER" && (
          <Controller
            name={`sections.${sectionIndex}.field_table.${fieldIndex}.field_response`}
            control={control}
            render={({ field }) => (
              <NumberInput
                {...field}
                label={label}
                className={`${classes.previewField} ${
                  mode === "view" && classes.pointerEventsNone
                }`}
                withAsterisk={isFieldRequired}
                {...register(
                  `sections.${sectionIndex}.field_table.${fieldIndex}.field_response`,
                  {
                    required: {
                      value: isFieldRequired,
                      message: "Field is required",
                    },
                  }
                )}
                value={Number(field.value)}
                onChange={(value) => field.onChange(Number(value))}
                error={
                  fieldPromptError ? (
                    <Text color="red" size="sm">
                      Field is required
                    </Text>
                  ) : null
                }
                min={0}
                max={999999999999}
              />
            )}
            rules={{
              required: {
                value: isFieldRequired,
                message: "Field is required",
              },
            }}
          />
        )}

        {fieldType === "TEXTAREA" && (
          <Textarea
            label={label}
            className={`${classes.previewField} ${
              mode === "view" ? classes.pointerEventsNone : ""
            }`}
            withAsterisk={isFieldRequired}
            {...register(
              `sections.${sectionIndex}.field_table.${fieldIndex}.field_response`,
              {
                required: {
                  value: isFieldRequired,
                  message: "Field is required",
                },
              }
            )}
            error={
              fieldPromptError ? (
                <Text color="red" size="sm">
                  Field is required
                </Text>
              ) : null
            }
          />
        )}

        {fieldType === "SELECT" && (
          <Controller
            name={`sections.${sectionIndex}.field_table.${fieldIndex}.field_response`}
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                value={`${field.value}`}
                maw={223}
                label={label}
                data={optionsDropdownData}
                className={`${classes.previewField} ${
                  mode === "view" ? classes.pointerEventsNone : ""
                }`}
                style={{ width: "100%" }}
                withAsterisk={isFieldRequired}
                readOnly={mode === "view"}
                error={
                  fieldPromptError ? (
                    <Text color="red" size="sm">
                      Field is required
                    </Text>
                  ) : null
                }
              />
            )}
            rules={{
              required: {
                value: isFieldRequired,
                message: "Field is required",
              },
            }}
          />
        )}

        {fieldType === "MULTISELECT" && (
          <Controller
            name={`sections.${sectionIndex}.field_table.${fieldIndex}.field_response`}
            control={control}
            render={({ field }) => (
              <MultiSelect
                {...field}
                value={[]}
                maw={223}
                label={label}
                data={optionsDropdownData}
                className={`${classes.previewField} ${
                  mode === "view" ? classes.pointerEventsNone : ""
                }`}
                style={{ width: "100%" }}
                withAsterisk={isFieldRequired}
                readOnly={mode === "view"}
                error={
                  fieldPromptError ? (
                    <Text color="red" size="sm">
                      Field is required
                    </Text>
                  ) : null
                }
              />
            )}
            rules={{
              required: {
                value: isFieldRequired,
                message: "Field is required",
              },
            }}
          />
        )}

        {fieldType === "SLIDER" && (
          <Box
            className={`${classes.previewField} ${
              mode === "view" ? classes.pointerEventsNone : ""
            }`}
          >
            <Text className={classes.sliderLabel}>{label}</Text>
            <Controller
              name={`sections.${sectionIndex}.field_table.${fieldIndex}.field_response`}
              render={({ field }) => (
                <Slider
                  {...field}
                  className={mode === "view" ? classes.pointerEventsNone : ""}
                  pt={16}
                  pb={32}
                  defaultValue={1}
                  min={fieldMin}
                  max={fieldMax}
                  step={step}
                  marks={getMarks()}
                  showLabelOnHover={false}
                />
              )}
            />
          </Box>
        )}

        {fieldType === "DATE" && (
          <Controller
            name={`sections.${sectionIndex}.field_table.${fieldIndex}.field_response`}
            control={control}
            render={({ field }) => (
              <DatePickerInput
                {...field}
                label={label}
                value={field.value ? new Date(`${field.value}`) : null}
                readOnly={mode === "view"}
                withAsterisk={isFieldRequired}
                maw={223}
                className={`${classes.previewField} ${
                  mode === "view" ? classes.pointerEventsNone : ""
                }`}
                error={
                  fieldPromptError ? (
                    <Text color="red" size="sm">
                      Field is required
                    </Text>
                  ) : null
                }
              />
            )}
            rules={{
              required: {
                value: isFieldRequired,
                message: "Field is required",
              },
            }}
          />
        )}

        {fieldType === "BOOLEAN" && (
          <>
            <Radio.Group
              defaultValue={
                getValues(
                  `sections.${sectionIndex}.field_table.${fieldIndex}.field_response`
                )
                  ? "yes"
                  : "no"
              }
              className={`${classes.previewField} ${
                mode === "view" && classes.pointerEventsNone
              }`}
              label={label}
              error={
                fieldPromptError ? (
                  <Text color="red" size="sm">
                    Field is required
                  </Text>
                ) : null
              }
            >
              <Radio
                value="yes"
                label="Yes"
                {...register(
                  `sections.${sectionIndex}.field_table.${fieldIndex}.field_response`
                )}
              />
              <Radio
                value="no"
                label="No"
                {...register(
                  `sections.${sectionIndex}.field_table.${fieldIndex}.field_response`
                )}
              />
            </Radio.Group>
          </>
        )}
      </Box>
    );
  }

  return (
    <Paper ref={ref} shadow="xs" radius="sm" className={classes.paper}>
      <ActionIcon
        className={classes.closeIcon}
        onClick={() => onDelete(fieldIndex)}
        color="red"
      >
        <IconTrash height={16} />
      </ActionIcon>

      {(fieldType === "TEXT" ||
        fieldType === "TEXTAREA" ||
        fieldType === "NUMBER" ||
        fieldType === "DATE") && (
        <Container fluid p={24}>
          <FieldTypeDropdown
            sectionIndex={sectionIndex}
            fieldIndex={fieldIndex}
            data={typeOptions}
            onDropdownOpen={() => setIsSelectingFieldType(true)}
            onDropdownClose={() => {
              setTimeout(() => setIsSelectingFieldType(false), 100);
            }}
          />

          <TextInput
            label="Field"
            mt={16}
            {...register(
              `sections.${sectionIndex}.field_table.${fieldIndex}.field_name`,
              {
                onChange: (e) => setFieldPrompt(e.target.value),
              }
            )}
          />

          <TextInput
            label="Description"
            mt={16}
            {...register(
              `sections.${sectionIndex}.field_table.${fieldIndex}.field_description`,
              {
                onChange: (e) => setFieldDescription(e.target.value),
              }
            )}
          />

          <Checkbox
            label="Required"
            mt={24}
            {...register(
              `sections.${sectionIndex}.field_table.${fieldIndex}.field_is_required`,
              {
                onChange: (e) => setIsFieldRequired(e.target.checked),
              }
            )}
            className={classes.checkboxCursor}
          />
        </Container>
      )}

      {(fieldType === "SELECT" || fieldType === "MULTISELECT") && (
        <Container fluid p={24}>
          <FieldTypeDropdown
            sectionIndex={sectionIndex}
            fieldIndex={fieldIndex}
            data={typeOptions}
            onDropdownOpen={() => setIsSelectingFieldType(true)}
            onDropdownClose={() => {
              setTimeout(() => setIsSelectingFieldType(false), 100);
            }}
          />
          <TextInput
            label="Field"
            mt={16}
            {...register(
              `sections.${sectionIndex}.field_table.${fieldIndex}.field_name`,
              {
                onChange: (e) => setFieldPrompt(e.target.value),
              }
            )}
          />

          {options.map((option, optionIndex) => (
            <OptionContainer
              onDelete={() => removeChoice(optionIndex)}
              key={option.id}
            >
              <Option
                label={`Option ${optionIndex + 1}`}
                {...register(
                  `sections.${sectionIndex}.field_table.${fieldIndex}.options.${optionIndex}.option_value`
                )}
              />
              <Option
                label="Description"
                {...register(
                  `sections.${sectionIndex}.field_table.${fieldIndex}.options.${optionIndex}.option_description`
                )}
              />
            </OptionContainer>
          ))}

          <Button
            size="xs"
            variant="subtle"
            mt={16}
            onClick={() =>
              appendChoice({
                option_id: uuidv4(),
                option_field_id: field.field_id,
                option_value: "option",
                option_order: options.length + 1,
                option_description: "",
              })
            }
            leftIcon={<IconCirclePlus height={16} />}
          >
            Add Option
          </Button>

          <TextInput
            label="Description"
            mt={16}
            {...register(
              `sections.${sectionIndex}.field_table.${fieldIndex}.field_description`,
              {
                onChange: (e) => setFieldDescription(e.target.value),
              }
            )}
          />

          <Checkbox
            label="Required"
            mt={24}
            {...register(
              `sections.${sectionIndex}.field_table.${fieldIndex}.field_is_required`,
              {
                onChange: (e) => setIsFieldRequired(e.target.checked),
              }
            )}
            className={classes.checkboxCursor}
          />
        </Container>
      )}

      {fieldType === "SLIDER" && (
        <Container fluid p={24}>
          <FieldTypeDropdown
            sectionIndex={sectionIndex}
            fieldIndex={fieldIndex}
            data={typeOptions}
            onDropdownOpen={() => setIsSelectingFieldType(true)}
            onDropdownClose={() => {
              setTimeout(() => setIsSelectingFieldType(false), 100);
            }}
          />
          <TextInput
            label="Field"
            mt={16}
            {...register(
              `sections.${sectionIndex}.field_table.${fieldIndex}.field_name`,
              {
                onChange: (e) => setFieldPrompt(e.target.value),
              }
            )}
          />

          <TextInput
            label="Description"
            mt={16}
            {...register(
              `sections.${sectionIndex}.field_table.${fieldIndex}.field_description`,
              {
                onChange: (e) => setFieldDescription(e.target.value),
              }
            )}
          />

          {formType === "REVIEW" && (
            <Checkbox
              label="Field is positive"
              mt={24}
              {...register(
                `sections.${sectionIndex}.field_table.${fieldIndex}.field_is_positive_metric`,
                {
                  onChange: (e) => setIsFieldPositive(e.target.checked),
                }
              )}
              className={classes.checkboxCursor}
            />
          )}
        </Container>
      )}

      {fieldType === "BOOLEAN" && (
        <Container fluid p={24}>
          <FieldTypeDropdown
            sectionIndex={sectionIndex}
            fieldIndex={fieldIndex}
            data={typeOptions}
            onDropdownOpen={() => setIsSelectingFieldType(true)}
            onDropdownClose={() => {
              setTimeout(() => setIsSelectingFieldType(false), 100);
            }}
          />
          <TextInput
            label="Field"
            mt={16}
            {...register(
              `sections.${sectionIndex}.field_table.${fieldIndex}.field_name`,
              {
                onChange: (e) => setFieldPrompt(e.target.value),
              }
            )}
          />

          <TextInput
            label="Description"
            mt={16}
            {...register(
              `sections.${sectionIndex}.field_table.${fieldIndex}.field_description`,
              {
                onChange: (e) => setFieldDescription(e.target.value),
              }
            )}
          />

          <Checkbox
            label="Field is positive"
            mt={24}
            {...register(
              `sections.${sectionIndex}.field_table.${fieldIndex}.field_is_positive_metric`,
              {
                onChange: (e) => setIsFieldPositive(e.target.checked),
              }
            )}
            className={classes.checkboxCursor}
          />
        </Container>
      )}
    </Paper>
  );
};

export default Field;

type FieldTypeDropdownProp = {
  sectionIndex: number;
  fieldIndex: number;
} & SelectProps;

export function FieldTypeDropdown({
  sectionIndex,
  fieldIndex,
  onDropdownOpen,
  onDropdownClose,
  ...prop
}: FieldTypeDropdownProp) {
  const { control } = useFormContext();

  return (
    <Controller
      name={`sections.${sectionIndex}.field_table.${fieldIndex}.field_type`}
      control={control}
      render={({ field }) => (
        <Select
          maw={223}
          label="Type"
          data={prop.data}
          {...field}
          onDropdownOpen={onDropdownOpen}
          onDropdownClose={onDropdownClose}
        />
      )}
    />
  );
}

type FieldLabelProps = {
  fieldPrompt: string;
  isFieldPositive: boolean;
  fieldDescription: string;
  formType: AppType;
  fieldType: FieldType;
};

export const FieldLabel = ({
  fieldPrompt,
  isFieldPositive,
  fieldDescription,
  fieldType,
  formType,
}: FieldLabelProps) => {
  return (
    <Flex align="flex-start" gap="xs">
      {fieldPrompt}

      <Group spacing={5} mt={3}>
        {isFieldPositive ? (
          <IconArrowBigUpLine
            height={16}
            color="#40C057"
            display={
              formType === "REVIEW" && fieldType !== "TEXTAREA"
                ? "block"
                : "none"
            }
          />
        ) : (
          <IconArrowBigDownLine
            height={16}
            color="#FA5252"
            display={
              formType === "REVIEW" && fieldType !== "TEXTAREA"
                ? "block"
                : "none"
            }
          />
        )}

        {fieldDescription.length > 0 && (
          <Tooltip label={fieldDescription} withArrow multiline miw={250}>
            <Box>
              <IconInfoCircle
                height={16}
                color="#495057"
                display={fieldDescription.length > 0 ? "block" : "none"}
              />
            </Box>
          </Tooltip>
        )}
      </Group>
    </Flex>
  );
};
