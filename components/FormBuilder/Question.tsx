// todo: implement delete choice query
// import deleteChoice from "@/services/choice/deleteChoice";
import { AppId } from "@/backend/utils/types";
import { QuestionWithFieldArrayId } from "@/utils/react-hook-form";
import { QuestionType } from "@/utils/types";
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Container,
  createStyles,
  Flex,
  Group,
  NumberInput,
  Paper,
  Radio,
  Select,
  SelectProps,
  Slider,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import {
  DatePicker,
  DateRangePicker,
  DateRangePickerValue,
} from "@mantine/dates";
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
  formType: AppId;
  question: QuestionWithFieldArrayId;
  questionIndex: number;
  sectionIndex: number;
  onDelete: (questionIndex: number) => void;
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
  previewQuestion: {
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

const Question = ({
  formType,
  question,
  questionIndex,
  sectionIndex,
  onDelete,
  mode = "edit",
}: Props) => {
  const [isActive, setIsActive] = useState(false);
  const [questionPrompt, setQuestionPrompt] = useState(
    question.question_prompt
  );
  const [questionDescription, setQuestionDescription] = useState(
    question.question_description || ""
  );
  const [isQuestionRequired, setIsQuestionRequired] = useState(
    question.question_is_required
  );
  const [isQuestionPositive, setIsQuestionPositive] = useState(
    question.question_is_positive
  );
  const [isSelectingQuestionType, setIsSelectingQuestionType] = useState(false);

  const [questionMin, setQuestionMin] = useState(question.question_min);
  const [questionMax, setQuestionMax] = useState(question.question_max);

  const ref = useClickOutside(() => {
    if (!isSelectingQuestionType) {
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
    fields: choices,
    append: appendChoice,
    remove: removeChoice,
  } = useFieldArray({
    control: control,
    name: `sections.${sectionIndex}.question_table.${questionIndex}.choices`,
  });

  const choicesWatch = watch(
    `sections.${sectionIndex}.question_table.${questionIndex}.choices`
  );
  const choicesDropdownData = choicesWatch?.map((choice) => ({
    value: choice.choice_id,
    label: choice.choice_text,
  }));

  const { classes } = useStyles({ mode });

  const questionType = watch(
    `sections.${sectionIndex}.question_table.${questionIndex}.question_type`
  );

  const requestTypeOptions = [
    { value: "TEXT", label: "Text" },
    { value: "NUMBER", label: "Number" },
    { value: "TEXTAREA", label: "Text Area" },
    { value: "SELECT", label: "Select" },
    { value: "MULTICHECKBOX", label: "Multiple Choice" },
    { value: "SLIDER", label: "Slider" },
    { value: "DATE", label: "Date" },
    { value: "DATERANGE", label: "Daterange" },
  ];

  const reviewTypeOptions = [
    { value: "SLIDER", label: "Slider" },
    { value: "BOOLEAN", label: "Boolean" },
  ];

  const typeOptions =
    formType === "REQUEST" ? requestTypeOptions : reviewTypeOptions;

  const questionPromptName = `sections.${sectionIndex}.question_table.${questionIndex}.question_response`;
  const questionPromptError = get(errors, questionPromptName);

  if (!isActive) {
    const step = 1;
    const getMarks = () => {
      const marks = [];
      for (let i = questionMin; i <= questionMax; i += step) {
        marks.push({
          value: i,
          label: i.toString(),
        });
      }
      return marks;
    };

    const label = (
      <QuestionLabel
        formType={formType}
        isQuestionPositive={isQuestionPositive}
        questionDescription={questionDescription}
        questionPrompt={questionPrompt}
        questionType={questionType}
      />
    );
    return (
      <Box
        role="button"
        aria-label="click to edit question"
        onClick={() => {
          if (mode === "edit") setIsActive(true);
        }}
        className={classes.notActiveContainer}
      >
        {questionType === "TEXT" && (
          <TextInput
            label={label}
            className={`${classes.previewQuestion} ${
              mode === "view" && classes.pointerEventsNone
            }`}
            withAsterisk={isQuestionRequired}
            {...register(
              `sections.${sectionIndex}.question_table.${questionIndex}.question_response`,
              {
                required: {
                  value: isQuestionRequired,
                  message: "Field is required",
                },
              }
            )}
            error={
              questionPromptError ? (
                <Text color="red" size="sm">
                  Field is required
                </Text>
              ) : null
            }
            readOnly
          />
        )}

        {questionType === "NUMBER" && (
          <Controller
            name={`sections.${sectionIndex}.question_table.${questionIndex}.question_response`}
            control={control}
            render={({ field }) => (
              <NumberInput
                {...field}
                label={label}
                className={`${classes.previewQuestion} ${
                  mode === "view" && classes.pointerEventsNone
                }`}
                withAsterisk={isQuestionRequired}
                {...register(
                  `sections.${sectionIndex}.question_table.${questionIndex}.question_response`,
                  {
                    required: {
                      value: isQuestionRequired,
                      message: "Field is required",
                    },
                  }
                )}
                value={Number(field.value)}
                onChange={(value) => field.onChange(Number(value))}
                error={
                  questionPromptError ? (
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
                value: isQuestionRequired,
                message: "Field is required",
              },
            }}
          />
        )}

        {questionType === "TEXTAREA" && (
          <Textarea
            label={label}
            className={`${classes.previewQuestion} ${
              mode === "view" ? classes.pointerEventsNone : ""
            }`}
            withAsterisk={isQuestionRequired}
            {...register(
              `sections.${sectionIndex}.question_table.${questionIndex}.question_response`,
              {
                required: {
                  value: isQuestionRequired,
                  message: "Field is required",
                },
              }
            )}
            error={
              questionPromptError ? (
                <Text color="red" size="sm">
                  Field is required
                </Text>
              ) : null
            }
          />
        )}

        {questionType === "SELECT" && (
          <Controller
            name={`sections.${sectionIndex}.question_table.${questionIndex}.question_response`}
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                value={`${field.value}`}
                maw={223}
                label={label}
                data={choicesDropdownData}
                className={`${classes.previewQuestion} ${
                  mode === "view" ? classes.pointerEventsNone : ""
                }`}
                style={{ width: "100%" }}
                withAsterisk={isQuestionRequired}
                readOnly={mode === "view"}
                error={
                  questionPromptError ? (
                    <Text color="red" size="sm">
                      Field is required
                    </Text>
                  ) : null
                }
              />
            )}
            rules={{
              required: {
                value: isQuestionRequired,
                message: "Field is required",
              },
            }}
          />
        )}

        {questionType === "MULTICHECKBOX" && (
          <Controller
            name={`sections.${sectionIndex}.question_table.${questionIndex}.question_response`}
            render={({ field }) => (
              <Checkbox.Group
                label={label}
                withAsterisk={isQuestionRequired}
                {...field}
                error={
                  questionPromptError ? (
                    <Text color="red" size="sm">
                      Field is required
                    </Text>
                  ) : null
                }
              >
                <Box
                  className={`${classes.radioGroup} ${
                    classes.previewQuestion
                  } ${mode === "view" && classes.pointerEventsNone}`}
                >
                  {choicesWatch?.map((choice) => {
                    return (
                      <Flex key={choice.choice_id}>
                        <Checkbox
                          value={choice.choice_id}
                          label={choice.choice_text}
                          className={`${classes.radio} ${
                            mode === "view"
                              ? classes.pointerEventsNone
                              : classes.checkboxCursor
                          }`}
                        />
                        {choice.choice_description.length > 0 && (
                          <Tooltip
                            label={choice.choice_description}
                            withArrow
                            multiline
                            maw={250}
                          >
                            <Box>
                              <IconInfoCircle height={16} color="#495057" />
                            </Box>
                          </Tooltip>
                        )}
                      </Flex>
                    );
                  })}
                </Box>
              </Checkbox.Group>
            )}
            rules={{
              required: {
                value: isQuestionRequired,
                message: "Field is required",
              },
            }}
          />
        )}

        {questionType === "SLIDER" && (
          <Box
            className={`${classes.previewQuestion} ${
              mode === "view" ? classes.pointerEventsNone : ""
            }`}
          >
            <Text className={classes.sliderLabel}>{label}</Text>
            <Controller
              name={`sections.${sectionIndex}.question_table.${questionIndex}.question_response`}
              render={({ field }) => (
                <Slider
                  {...field}
                  className={mode === "view" ? classes.pointerEventsNone : ""}
                  pt={16}
                  pb={32}
                  defaultValue={1}
                  min={questionMin}
                  max={questionMax}
                  step={1}
                  marks={getMarks()}
                  showLabelOnHover={false}
                />
              )}
            />
          </Box>
        )}

        {questionType === "DATE" && (
          <Controller
            name={`sections.${sectionIndex}.question_table.${questionIndex}.question_response`}
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                value={field.value ? new Date(`${field.value}`) : null}
                maw={223}
                label={label}
                withAsterisk={isQuestionRequired}
                readOnly={mode === "view"}
                className={`${classes.previewQuestion} ${
                  mode === "view" ? classes.pointerEventsNone : ""
                }`}
                error={
                  questionPromptError ? (
                    <Text color="red" size="sm">
                      Field is required
                    </Text>
                  ) : null
                }
              />
            )}
            rules={{
              required: {
                value: isQuestionRequired,
                message: "Field is required",
              },
            }}
          />
        )}

        {questionType === "DATERANGE" && (
          <Controller
            name={`sections.${sectionIndex}.question_table.${questionIndex}.question_response`}
            control={control}
            render={({ field }) => {
              const newValue: Date[] = field.value as Date[];
              return (
                <DateRangePicker
                  {...field}
                  value={
                    mode === "view"
                      ? newValue[0] && newValue[1]
                        ? [new Date(newValue[0]), new Date(newValue[1])]
                        : [null, null]
                      : (field.value as DateRangePickerValue)
                  }
                  maw={223}
                  label={label}
                  withAsterisk={isQuestionRequired}
                  readOnly={mode === "view"}
                  className={`${classes.previewQuestion} ${
                    mode === "view" ? classes.pointerEventsNone : ""
                  }`}
                  error={
                    questionPromptError ? (
                      <Text color="red" size="sm">
                        Field is required
                      </Text>
                    ) : null
                  }
                />
              );
            }}
            rules={{
              required: {
                value: isQuestionRequired,
                message: "Field is required",
              },
              validate: {
                isRequired: (value) => {
                  const newValue = value as [Date | null, Date | null];
                  if (
                    isQuestionRequired &&
                    (newValue[0] === null || newValue[1] === null)
                  ) {
                    return "Field is required";
                  } else {
                    false;
                  }
                },
              },
            }}
          />
        )}

        {questionType === "BOOLEAN" && (
          <>
            <Radio.Group
              defaultValue={
                getValues(
                  `sections.${sectionIndex}.question_table.${questionIndex}.question_response`
                )
                  ? "yes"
                  : "no"
              }
              className={`${classes.previewQuestion} ${
                mode === "view" && classes.pointerEventsNone
              }`}
              label={label}
              error={
                questionPromptError ? (
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
                  `sections.${sectionIndex}.question_table.${questionIndex}.question_response`
                )}
              />
              <Radio
                value="no"
                label="No"
                {...register(
                  `sections.${sectionIndex}.question_table.${questionIndex}.question_response`
                )}
              />
            </Radio.Group>
            {/* <Checkbox
              display="none"
              defaultChecked={metricBooleanValue === "yes"}
              {...register(
                `sections.${sectionIndex}.question_table.${questionIndex}.question_response`,
                {
                  onChange: (e) => setIsQuestionRequired(e.target.checked),
                }
              )}
            /> */}
          </>
        )}
      </Box>
    );
  }

  return (
    <Paper ref={ref} shadow="xs" radius="sm" className={classes.paper}>
      <ActionIcon
        className={classes.closeIcon}
        onClick={() => onDelete(questionIndex)}
        color="red"
      >
        <IconTrash height={16} />
      </ActionIcon>

      {(questionType === "TEXT" ||
        questionType === "TEXTAREA" ||
        questionType === "NUMBER" ||
        questionType === "DATE" ||
        questionType === "DATERANGE") && (
        <Container fluid p={24}>
          <QuestionTypeDropdown
            sectionIndex={sectionIndex}
            questionIndex={questionIndex}
            data={typeOptions}
            onDropdownOpen={() => setIsSelectingQuestionType(true)}
            onDropdownClose={() => {
              setTimeout(() => setIsSelectingQuestionType(false), 100);
            }}
          />

          <TextInput
            label="Question"
            mt={16}
            {...register(
              `sections.${sectionIndex}.question_table.${questionIndex}.question_prompt`,
              {
                onChange: (e) => setQuestionPrompt(e.target.value),
              }
            )}
          />

          <TextInput
            label="Description"
            mt={16}
            {...register(
              `sections.${sectionIndex}.question_table.${questionIndex}.question_description`,
              {
                onChange: (e) => setQuestionDescription(e.target.value),
              }
            )}
          />

          <Checkbox
            label="Required"
            mt={24}
            {...register(
              `sections.${sectionIndex}.question_table.${questionIndex}.question_is_required`,
              {
                onChange: (e) => setIsQuestionRequired(e.target.checked),
              }
            )}
            className={classes.checkboxCursor}
          />
        </Container>
      )}

      {(questionType === "SELECT" || questionType === "MULTICHECKBOX") && (
        <Container fluid p={24}>
          <QuestionTypeDropdown
            sectionIndex={sectionIndex}
            questionIndex={questionIndex}
            data={typeOptions}
            onDropdownOpen={() => setIsSelectingQuestionType(true)}
            onDropdownClose={() => {
              setTimeout(() => setIsSelectingQuestionType(false), 100);
            }}
          />
          <TextInput
            label="Question"
            mt={16}
            {...register(
              `sections.${sectionIndex}.question_table.${questionIndex}.question_prompt`,
              {
                onChange: (e) => setQuestionPrompt(e.target.value),
              }
            )}
          />

          {choices.map((choice, choiceIndex) => (
            <OptionContainer
              onDelete={() => removeChoice(choiceIndex)}
              key={choice.id}
            >
              <Option
                label={`Option ${choiceIndex + 1}`}
                {...register(
                  `sections.${sectionIndex}.question_table.${questionIndex}.choices.${choiceIndex}.choice_text`
                )}
              />
              <Option
                label="Description"
                {...register(
                  `sections.${sectionIndex}.question_table.${questionIndex}.choices.${choiceIndex}.choice_description`
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
                choice_id: uuidv4(),
                question_id: question.question_id,
                choice_text: "option",
                choice_order: choices.length + 1,
                choice_description: "",
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
              `sections.${sectionIndex}.question_table.${questionIndex}.question_description`,
              {
                onChange: (e) => setQuestionDescription(e.target.value),
              }
            )}
          />

          <Checkbox
            label="Required"
            mt={24}
            {...register(
              `sections.${sectionIndex}.question_table.${questionIndex}.question_is_required`,
              {
                onChange: (e) => setIsQuestionRequired(e.target.checked),
              }
            )}
            className={classes.checkboxCursor}
          />
        </Container>
      )}

      {questionType === "SLIDER" && (
        <Container fluid p={24}>
          <QuestionTypeDropdown
            sectionIndex={sectionIndex}
            questionIndex={questionIndex}
            data={typeOptions}
            onDropdownOpen={() => setIsSelectingQuestionType(true)}
            onDropdownClose={() => {
              setTimeout(() => setIsSelectingQuestionType(false), 100);
            }}
          />
          <TextInput
            label="Question"
            mt={16}
            {...register(
              `sections.${sectionIndex}.question_table.${questionIndex}.question_prompt`,
              {
                onChange: (e) => setQuestionPrompt(e.target.value),
              }
            )}
          />

          <TextInput
            label="Description"
            mt={16}
            {...register(
              `sections.${sectionIndex}.question_table.${questionIndex}.question_description`,
              {
                onChange: (e) => setQuestionDescription(e.target.value),
              }
            )}
          />

          <Group mt={16}>
            <Controller
              name={`sections.${sectionIndex}.question_table.${questionIndex}.question_min`}
              control={control}
              render={({ field }) => (
                <NumberInput
                  {...field}
                  label="Min"
                  maw={92}
                  {...register(
                    `sections.${sectionIndex}.question_table.${questionIndex}.question_min`
                  )}
                  onChange={(value) => {
                    field.onChange(Number(value));
                    setQuestionMin(Number(value));
                  }}
                  min={1}
                  max={questionMax - 1}
                />
              )}
            />

            <Controller
              name={`sections.${sectionIndex}.question_table.${questionIndex}.question_max`}
              control={control}
              render={({ field }) => (
                <NumberInput
                  {...field}
                  label="Max"
                  maw={92}
                  {...register(
                    `sections.${sectionIndex}.question_table.${questionIndex}.question_max`
                  )}
                  onChange={(value) => {
                    field.onChange(Number(value));
                    setQuestionMax(Number(value));
                  }}
                  min={questionMin + 1}
                  max={999999999999}
                />
              )}
            />
          </Group>

          {formType === "REVIEW" && (
            <Checkbox
              label="Question is positive"
              mt={24}
              {...register(
                `sections.${sectionIndex}.question_table.${questionIndex}.question_is_positive`,
                {
                  onChange: (e) => setIsQuestionPositive(e.target.checked),
                }
              )}
              className={classes.checkboxCursor}
            />
          )}
        </Container>
      )}

      {questionType === "BOOLEAN" && (
        <Container fluid p={24}>
          <QuestionTypeDropdown
            sectionIndex={sectionIndex}
            questionIndex={questionIndex}
            data={typeOptions}
            onDropdownOpen={() => setIsSelectingQuestionType(true)}
            onDropdownClose={() => {
              setTimeout(() => setIsSelectingQuestionType(false), 100);
            }}
          />
          <TextInput
            label="Question"
            mt={16}
            {...register(
              `sections.${sectionIndex}.question_table.${questionIndex}.question_prompt`,
              {
                onChange: (e) => setQuestionPrompt(e.target.value),
              }
            )}
          />

          <TextInput
            label="Description"
            mt={16}
            {...register(
              `sections.${sectionIndex}.question_table.${questionIndex}.question_description`,
              {
                onChange: (e) => setQuestionDescription(e.target.value),
              }
            )}
          />

          <Checkbox
            label="Question is positive"
            mt={24}
            {...register(
              `sections.${sectionIndex}.question_table.${questionIndex}.question_is_positive`,
              {
                onChange: (e) => setIsQuestionPositive(e.target.checked),
              }
            )}
            className={classes.checkboxCursor}
          />
        </Container>
      )}
    </Paper>
  );
};

export default Question;

type QuestionTypeDropdownProp = {
  sectionIndex: number;
  questionIndex: number;
} & SelectProps;

export function QuestionTypeDropdown({
  sectionIndex,
  questionIndex,
  onDropdownOpen,
  onDropdownClose,
  ...prop
}: QuestionTypeDropdownProp) {
  const { control } = useFormContext();

  return (
    <Controller
      name={`sections.${sectionIndex}.question_table.${questionIndex}.question_type`}
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

type QuestionLabelProps = {
  questionPrompt: string;
  isQuestionPositive: boolean;
  questionDescription: string;
  formType: AppId;
  questionType: QuestionType;
};

export const QuestionLabel = ({
  questionPrompt,
  isQuestionPositive,
  questionDescription,
  questionType,
  formType,
}: QuestionLabelProps) => {
  return (
    <Flex align="flex-start" gap="xs">
      {questionPrompt}

      <Group spacing={5} mt={3}>
        {isQuestionPositive ? (
          <IconArrowBigUpLine
            height={16}
            color="#40C057"
            display={
              formType === "REVIEW" && questionType !== "TEXTAREA"
                ? "block"
                : "none"
            }
          />
        ) : (
          <IconArrowBigDownLine
            height={16}
            color="#FA5252"
            display={
              formType === "REVIEW" && questionType !== "TEXTAREA"
                ? "block"
                : "none"
            }
          />
        )}

        {questionDescription.length > 0 && (
          <Tooltip label={questionDescription} withArrow multiline miw={250}>
            <Box>
              <IconInfoCircle
                height={16}
                color="#495057"
                display={questionDescription.length > 0 ? "block" : "none"}
              />
            </Box>
          </Tooltip>
        )}
      </Group>
    </Flex>
  );
};
