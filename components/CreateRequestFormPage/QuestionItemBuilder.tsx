import { EXPECTED_RESPONSE_TYPE_VALUE } from "@/components/CreateRequestFormPage/constant";
import QuestionOptionsBuilder from "@/components/CreateRequestFormPage/QuestionOptionsBuilder";
import { FormRequest } from "@/components/CreateRequestFormPage/type";
import {
  Center,
  CloseButton,
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
  UseFormRegister,
  useFormState,
  useWatch,
} from "react-hook-form";

type Props = {
  questionIndex: number;
  register: UseFormRegister<FormRequest>;
  control: Control<FormRequest>;
  handleRemoveQuestion: (index: number) => void;
};

const QuestionItemBuilder: FC<Props> = (props) => {
  const { register, control, questionIndex, handleRemoveQuestion } = props;

  const { errors } = useFormState({ control });

  const uniqueDragable = `question-${questionIndex}`;
  const watchExpectResponseType = useWatch({ control }).questions?.[
    questionIndex
  ]?.data?.expected_response_type;

  const isMultiOrSelect =
    watchExpectResponseType === "multiple" ||
    watchExpectResponseType === "select";

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
          <Center aria-details="draggable-area" {...provided.dragHandleProps}>
            <Tooltip label="Drag Vertically">
              <Text size="lg" weight={600} aria-label="draggable-three-dots">
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
                  />
                )}
              />
              {isMultiOrSelect && (
                <QuestionOptionsBuilder
                  control={control}
                  questionIndex={questionIndex}
                />
              )}
            </Stack>
            <CloseButton
              aria-label="Delete Question"
              role="button"
              size="sm"
              variant="filled"
              color="red"
              onClick={() => handleRemoveQuestion(questionIndex)}
            />
          </Group>
        </Paper>
      )}
    </Draggable>
  );
};

export default memo(QuestionItemBuilder);
