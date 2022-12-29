import { EXPECTED_RESPONSE_TYPE_VALUE } from "@/utils/constants";
import { FormRequest } from "@/utils/types";
import {
  Center,
  Checkbox,
  CloseButton,
  Flex,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { FC, memo } from "react";
import { Draggable } from "react-beautiful-dnd";
import {
  Control,
  Controller,
  UseFormGetValues,
  UseFormRegister,
  useFormState,
  useWatch,
} from "react-hook-form";
import QuestionOptionsBuilder from "./QuestionOptionsBuilder";

type Props = {
  questionIndex: number;
  register: UseFormRegister<FormRequest>;
  control: Control<FormRequest>;
  handleRemoveQuestion: (index: number) => void;
  getValues: UseFormGetValues<FormRequest>;
};

const QuestionItemBuilder: FC<Props> = (props) => {
  const { register, control, questionIndex, handleRemoveQuestion, getValues } =
    props;
  const isInEditmode = getValues().form_id ? true : false;

  const { errors } = useFormState({ control });

  const uniqueDragable = `question-${questionIndex}`;
  const watchExpectResponseType = useWatch({ control }).questions?.[
    questionIndex
  ]?.data?.expected_response_type;

  const isMultiOrSelect =
    watchExpectResponseType === "multiple" ||
    watchExpectResponseType === "select";

  const isSection =
    useWatch({ control }).questions?.[questionIndex]?.data
      ?.expected_response_type === "section";

  return (
    <Draggable
      key={uniqueDragable}
      draggableId={uniqueDragable}
      index={questionIndex}
    >
      {(provided) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          withBorder
          shadow="sm"
          mb="md"
        >
          {!isSection ? (
            <>
              <Center
                aria-details="draggable-area"
                {...provided.dragHandleProps}
              >
                <Tooltip label="Drag Vertically">
                  <Text
                    size="lg"
                    weight={600}
                    aria-label="draggable-three-dots"
                  >
                    ...
                  </Text>
                </Tooltip>
              </Center>
              <Group align="baseline" p="md">
                <Stack style={{ flex: 1 }} spacing="sm">
                  <TextInput
                    aria-label="Question"
                    role="textbox"
                    label="Question"
                    withAsterisk
                    placeholder="Enter Question Here"
                    {...register(`questions.${questionIndex}.data.question`, {
                      required: "Question is required",
                      maxLength: {
                        value: 100,
                        message: "Label must not exceed to 100 characters",
                      },
                    })}
                    error={
                      errors.questions?.[questionIndex]?.data?.question?.message
                    }
                    disabled={isInEditmode}
                    data-cy="formBuilder-question"
                  />
                  <Controller
                    control={control}
                    name={`questions.${questionIndex}.data.expected_response_type`}
                    rules={{ required: "Input type is required." }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        role="option"
                        label="Response Type"
                        withAsterisk
                        placeholder="Select Response Type"
                        data={EXPECTED_RESPONSE_TYPE_VALUE.map((item) => ({
                          ...item,
                          label: item.value.toUpperCase(),
                        }))}
                        error={
                          errors.questions?.[questionIndex]?.data
                            ?.expected_response_type?.message
                        }
                        disabled={isInEditmode}
                      />
                    )}
                  />
                  {/* // TODO: Add this to editable. */}
                  <Flex wrap="wrap" align="center" gap="md">
                    <TextInput
                      aria-label="Tooltip"
                      role="textbox"
                      label="Tooltip"
                      placeholder="Enter Tooltip Here"
                      {...register(`questions.${questionIndex}.fieldTooltip`, {
                        maxLength: {
                          value: 100,
                          message: "Tooltip must not exceed to 100 characters",
                        },
                      })}
                      error={
                        errors.questions?.[questionIndex]?.fieldTooltip?.message
                      }
                      miw={100}
                      style={{ flex: 1 }}
                    />
                    <Checkbox
                      aria-label="Required"
                      label="Required"
                      {...register(`questions.${questionIndex}.isRequired`)}
                      pt={30}
                    />
                  </Flex>
                  {isMultiOrSelect && (
                    <QuestionOptionsBuilder
                      control={control}
                      questionIndex={questionIndex}
                      getValues={getValues}
                    />
                  )}
                </Stack>
                {!isInEditmode && (
                  <CloseButton
                    aria-label="Delete Question"
                    role="button"
                    size="sm"
                    variant="filled"
                    color="red"
                    onClick={() => handleRemoveQuestion(questionIndex)}
                  />
                )}
              </Group>
            </>
          ) : null}
          {isSection ? (
            <>
              <Center
                aria-details="draggable-area"
                {...provided.dragHandleProps}
              >
                <Tooltip label="Drag Vertically">
                  <Text
                    size="lg"
                    weight={600}
                    aria-label="draggable-three-dots"
                  >
                    ...
                  </Text>
                </Tooltip>
              </Center>
              <Group align="baseline" p="md">
                <Stack style={{ flex: 1 }} spacing="sm">
                  <TextInput
                    aria-label="Section"
                    role="textbox"
                    label="Section"
                    withAsterisk
                    placeholder="Enter Section Label Here"
                    {...register(`questions.${questionIndex}.data.question`, {
                      required: "Section Label is required",
                      maxLength: {
                        value: 100,
                        message: "Label must not exceed to 100 characters",
                      },
                    })}
                    error={
                      errors.questions?.[questionIndex]?.data?.question?.message
                    }
                    disabled={isInEditmode}
                    data-cy="formBuilder-sectionLabel"
                  />
                </Stack>
                {!isInEditmode && (
                  <CloseButton
                    aria-label="Delete Question"
                    role="button"
                    size="sm"
                    variant="filled"
                    color="red"
                    onClick={() => handleRemoveQuestion(questionIndex)}
                  />
                )}
              </Group>
            </>
          ) : null}
        </Paper>
      )}
    </Draggable>
  );
};

export default memo(QuestionItemBuilder);
