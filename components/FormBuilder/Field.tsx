import { FieldWithFieldArrayId } from "@/utils/react-hook-form";
import { AppType, FieldType } from "@/utils/types";
import {
  ActionIcon,
  Box,
  Button,
  Center,
  Checkbox,
  Container,
  FileInput,
  Flex,
  Group,
  MultiSelect,
  NumberInput,
  Paper,
  Select,
  SelectProps,
  Switch,
  TextInput,
  Textarea,
  Tooltip,
  createStyles,
} from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import {
  IconArrowBigDownLine,
  IconArrowBigUpLine,
  IconCalendar,
  IconCirclePlus,
  IconClock,
  IconFile,
  IconInfoCircle,
  IconTrash,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
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
  isActive: boolean;
  onNotActive: () => void;
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

  sliderLabel: {
    fontWeight: 600,
    paddingRight: 60,
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
  isActive,
  onNotActive,
}: Props) => {
  const timeInputRef = useRef<HTMLInputElement>(null);
  const [fieldPrompt, setFieldPrompt] = useState(field.field_name);
  const [fieldDescription, setFieldDescription] = useState(
    field.field_description || ""
  );
  const [isFieldRequired, setIsFieldRequired] = useState<boolean>(
    field.field_is_required
  );
  const [isFieldPositive, setIsFieldPositive] = useState<boolean>(
    field.field_is_positive_metric
  );

  const [sliderStart, setSliderStart] = useState<number | "">(1);
  const [sliderEnd, setSliderEnd] = useState<number | "">(5);

  const {
    watch,
    control,
    register,
    setError,
    formState: { errors },
  } = useFormContext<FormBuilderData>();

  const {
    fields: options,
    append: appendChoice,
    remove: removeChoice,
    // update: updateChoice,
  } = useFieldArray({
    control: control,
    name: `sections.${sectionIndex}.fields.${fieldIndex}.options`,
  });

  const optionsWatch = watch(
    `sections.${sectionIndex}.fields.${fieldIndex}.options`
  );
  const optionsDropdownData = optionsWatch?.map((option) => ({
    value: option.option_id,
    label: option.option_value,
  }));

  const { classes } = useStyles({ mode });

  const fieldType = watch(
    `sections.${sectionIndex}.fields.${fieldIndex}.field_type`
  );

  const requestTypeOptions = [
    { value: "TEXT", label: "Text" },
    { value: "NUMBER", label: "Number" },
    { value: "TEXTAREA", label: "Text Area" },
    { value: "DROPDOWN", label: "Dropdown" },
    { value: "MULTISELECT", label: "Multiselect" },
    // { value: "SLIDER", label: "Slider" },
    { value: "DATE", label: "Date" },
    { value: "TIME", label: "Time" },
    { value: "SWITCH", label: "Switch" },
    { value: "FILE", label: "File" },
  ];

  const reviewTypeOptions = [
    // { value: "SLIDER", label: "Slider" },
    { value: "BOOLEAN", label: "Boolean" },
  ];

  const typeOptions =
    formType === "REQUEST" ? requestTypeOptions : reviewTypeOptions;

  const handleDone = async () => {
    let isValid = true;
    if (fieldPrompt.length <= 0) {
      setError(`sections.${sectionIndex}.fields.${fieldIndex}.field_name`, {
        message: "Field name is required",
      });
      isValid = false;
    }

    if (
      options.length <= 0 &&
      (fieldType === "DROPDOWN" || fieldType === "MULTISELECT")
    ) {
      notifications.show({
        message: "At least 1 option is required.",
        color: "orange",
      });
      isValid = false;
    }

    const optionValueList = optionsWatch.map((option) => option.option_value);
    const isOptionHasDuplicate =
      new Set(optionValueList).size !== optionValueList.length;
    if (isOptionHasDuplicate) {
      notifications.show({
        message: "Options must be unique.",
        color: "orange",
      });
      isValid = false;
    }

    if (isValid) {
      setError(`sections.${sectionIndex}.fields.${fieldIndex}.field_name`, {
        message: "",
      });
      onNotActive();
    }
  };

  // useEffect(() => {
  //   if (fieldType === "SLIDER" && optionsWatch.length <= 0) {
  //     appendChoice({
  //       option_id: uuidv4(),
  //       option_field_id: field.field_id,
  //       option_value: "[1,5]",
  //       option_order: options.length + 1,
  //       option_description: "",
  //     });
  //   }
  // }, [optionsWatch, fieldType]);

  // useEffect(() => {
  //   if (fieldType === "SLIDER") {
  //     updateChoice(0, {
  //       option_id: uuidv4(),
  //       option_field_id: field.field_id,
  //       option_value: `[${sliderStart},${sliderEnd}]`,
  //       option_order: options.length + 1,
  //       option_description: "",
  //     });
  //   }
  // }, [sliderStart, sliderEnd]);

  if (!isActive) {
    // const step = 1;
    // const fieldMin = sliderStart || 1;
    // const fieldMax = sliderEnd || 5;
    // const getMarks = () => {
    //   const marks = [];
    //   for (let i = fieldMin; i <= fieldMax; i += step) {
    //     marks.push({
    //       value: i,
    //       label: i.toString(),
    //     });
    //   }
    //   return marks;
    // };

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
        className={classes.notActiveContainer}
      >
        {fieldType === "TEXT" && (
          <TextInput
            label={label}
            className={classes.previewField}
            withAsterisk={isFieldRequired}
          />
        )}

        {fieldType === "NUMBER" && (
          <NumberInput
            {...field}
            label={label}
            className={classes.previewField}
            withAsterisk={isFieldRequired}
            min={0}
            max={999999999999}
          />
        )}

        {fieldType === "TEXTAREA" && (
          <Textarea
            label={label}
            className={classes.previewField}
            withAsterisk={isFieldRequired}
          />
        )}

        {fieldType === "DROPDOWN" && (
          <Select
            {...field}
            label={label}
            data={optionsDropdownData}
            className={classes.previewField}
            style={{ width: "100%" }}
            withAsterisk={isFieldRequired}
            readOnly={mode === "view"}
            clearable
          />
        )}

        {fieldType === "MULTISELECT" && (
          <MultiSelect
            {...field}
            label={label}
            data={optionsDropdownData}
            className={classes.previewField}
            style={{ width: "100%" }}
            withAsterisk={isFieldRequired}
            readOnly={mode === "view"}
          />
        )}

        {/* {fieldType === "SLIDER" && (
          <Box className={classes.previewField} pb="xl">
            <Text className={classes.sliderLabel}>{label}</Text>
            <Slider
              {...field}
              pt={16}
              pb={32}
              defaultValue={1}
              min={fieldMin}
              max={fieldMax}
              step={step}
              marks={getMarks()}
              showLabelOnHover={false}
            />
          </Box>
        )}   */}

        {fieldType === "DATE" && (
          <DatePickerInput
            {...field}
            label={label}
            readOnly={mode === "view"}
            withAsterisk={isFieldRequired}
            className={classes.previewField}
            icon={<IconCalendar size={16} />}
          />
        )}

        {fieldType === "SWITCH" && (
          <Switch
            {...field}
            label={label}
            readOnly={mode === "view"}
            className={classes.previewField}
            mt="xs"
            sx={{ label: { cursor: "pointer" } }}
          />
        )}

        {fieldType === "TIME" && (
          <TimeInput
            {...field}
            label={label}
            readOnly={mode === "view"}
            withAsterisk={isFieldRequired}
            className={classes.previewField}
            icon={<IconClock size={16} />}
            rightSection={
              <ActionIcon onClick={() => timeInputRef.current?.showPicker()}>
                <IconClock size="1rem" stroke={1.5} />
              </ActionIcon>
            }
          />
        )}

        {fieldType === "FILE" && (
          <FileInput
            {...field}
            label={label}
            readOnly={mode === "view"}
            withAsterisk={isFieldRequired}
            className={classes.previewField}
            icon={<IconFile size={16} />}
            clearable
            multiple={false}
          />
        )}
      </Box>
    );
  }

  return (
    <Paper shadow="xs" radius="sm" className={classes.paper}>
      <ActionIcon
        className={classes.closeIcon}
        onClick={() => {
          onDelete(fieldIndex);
          onNotActive();
        }}
        color="red"
      >
        <IconTrash height={16} />
      </ActionIcon>

      {(fieldType === "TEXT" ||
        fieldType === "TEXTAREA" ||
        fieldType === "NUMBER" ||
        fieldType === "DATE" ||
        fieldType === "SWITCH" ||
        fieldType === "TIME" ||
        fieldType === "FILE") && (
        <Container fluid p={24}>
          <FieldTypeDropdown
            sectionIndex={sectionIndex}
            fieldIndex={fieldIndex}
            data={typeOptions}
          />

          <TextInput
            label="Name"
            mt={16}
            {...register(
              `sections.${sectionIndex}.fields.${fieldIndex}.field_name`,
              {
                required: "Field name is required",
                onChange: (e) => setFieldPrompt(e.target.value),
              }
            )}
            error={
              errors.sections?.[sectionIndex]?.fields?.[fieldIndex]?.field_name
                ?.message
            }
          />

          <TextInput
            label="Description"
            mt={16}
            {...register(
              `sections.${sectionIndex}.fields.${fieldIndex}.field_description`,
              {
                onChange: (e) => setFieldDescription(e.target.value),
              }
            )}
          />

          {fieldType !== "SWITCH" && (
            <Checkbox
              label="Required"
              mt={24}
              {...register(
                `sections.${sectionIndex}.fields.${fieldIndex}.field_is_required`,
                {
                  onChange: (e) => setIsFieldRequired(e.target.checked),
                }
              )}
              className={classes.checkboxCursor}
            />
          )}
          <Center mt="md">
            <Button onClick={() => handleDone()} w={80} variant="light">
              Done
            </Button>
          </Center>
        </Container>
      )}

      {(fieldType === "DROPDOWN" || fieldType === "MULTISELECT") && (
        <Container fluid p={24}>
          <FieldTypeDropdown
            sectionIndex={sectionIndex}
            fieldIndex={fieldIndex}
            data={typeOptions}
          />

          <TextInput
            label="Name"
            mt={16}
            {...register(
              `sections.${sectionIndex}.fields.${fieldIndex}.field_name`,
              {
                required: "Field name is required",
                onChange: (e) => setFieldPrompt(e.target.value),
              }
            )}
            error={
              errors.sections?.[sectionIndex]?.fields?.[fieldIndex]?.field_name
                ?.message
            }
          />

          {options.map((option, optionIndex) => (
            <OptionContainer
              onDelete={() => removeChoice(optionIndex)}
              key={option.id}
            >
              <Option
                label={`Option ${optionIndex + 1}`}
                {...register(
                  `sections.${sectionIndex}.fields.${fieldIndex}.options.${optionIndex}.option_value`,
                  {
                    validate: (value, formValues) =>
                      value !==
                        formValues.sections?.[sectionIndex].fields?.[fieldIndex]
                          .options?.[optionIndex].option_value ||
                      "Option must be unique",
                  }
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
                option_value: "",
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
              `sections.${sectionIndex}.fields.${fieldIndex}.field_description`,
              {
                onChange: (e) => setFieldDescription(e.target.value),
              }
            )}
          />

          <Checkbox
            label="Required"
            mt={24}
            {...register(
              `sections.${sectionIndex}.fields.${fieldIndex}.field_is_required`,
              {
                onChange: (e) => setIsFieldRequired(e.target.checked),
              }
            )}
            className={classes.checkboxCursor}
          />
          <Center mt="md">
            <Button onClick={() => handleDone()} w={80} variant="light">
              Done
            </Button>
          </Center>
        </Container>
      )}

      {fieldType === "SLIDER" && (
        <Container fluid p={24}>
          <FieldTypeDropdown
            sectionIndex={sectionIndex}
            fieldIndex={fieldIndex}
            data={typeOptions}
          />

          <TextInput
            label="Name"
            mt={16}
            {...register(
              `sections.${sectionIndex}.fields.${fieldIndex}.field_name`,
              {
                required: "Field name is required",
                onChange: (e) => setFieldPrompt(e.target.value),
              }
            )}
            error={
              errors.sections?.[sectionIndex]?.fields?.[fieldIndex]?.field_name
                ?.message
            }
          />

          <TextInput
            label="Description"
            mt={16}
            {...register(
              `sections.${sectionIndex}.fields.${fieldIndex}.field_description`,
              {
                onChange: (e) => setFieldDescription(e.target.value),
              }
            )}
          />

          <Flex mt="md" gap="md">
            <NumberInput
              label="Start"
              value={sliderStart}
              onChange={setSliderStart}
              min={0}
              max={10}
            />
            <NumberInput
              label="End"
              value={sliderEnd}
              min={sliderStart || 0}
              max={10}
              onChange={setSliderEnd}
            />
          </Flex>

          {formType === "REVIEW" && (
            <Checkbox
              label="Field is positive"
              mt={24}
              {...register(
                `sections.${sectionIndex}.fields.${fieldIndex}.field_is_positive_metric`,
                {
                  onChange: (e) => setIsFieldPositive(e.target.checked),
                }
              )}
              className={classes.checkboxCursor}
            />
          )}

          <Center mt="md">
            <Button onClick={() => handleDone()} w={80} variant="light">
              Done
            </Button>
          </Center>
        </Container>
      )}

      {fieldType === "BOOLEAN" && (
        <Container fluid p={24}>
          <FieldTypeDropdown
            sectionIndex={sectionIndex}
            fieldIndex={fieldIndex}
            data={typeOptions}
          />

          <TextInput
            label="Name"
            mt={16}
            {...register(
              `sections.${sectionIndex}.fields.${fieldIndex}.field_name`,
              {
                required: "Field name is required",
                onChange: (e) => setFieldPrompt(e.target.value),
              }
            )}
            error={
              errors.sections?.[sectionIndex]?.fields?.[fieldIndex]?.field_name
                ?.message
            }
          />

          <TextInput
            label="Description"
            mt={16}
            {...register(
              `sections.${sectionIndex}.fields.${fieldIndex}.field_description`,
              {
                onChange: (e) => setFieldDescription(e.target.value),
              }
            )}
          />

          <Checkbox
            label="Field is positive"
            mt={24}
            {...register(
              `sections.${sectionIndex}.fields.${fieldIndex}.field_is_positive_metric`,
              {
                onChange: (e) => setIsFieldPositive(e.target.checked),
              }
            )}
            className={classes.checkboxCursor}
          />

          <Center mt="md">
            <Button onClick={() => handleDone()} w={80} variant="light">
              Done
            </Button>
          </Center>
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
      name={`sections.${sectionIndex}.fields.${fieldIndex}.field_type`}
      control={control}
      render={({ field }) => (
        <Select
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
