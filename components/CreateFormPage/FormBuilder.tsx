import { AddCircle } from "@/components/Icon";
import { Box, Button, Stack } from "@mantine/core";
import { FC, memo, useCallback } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import {
  Control,
  useFieldArray,
  UseFormRegister,
  useFormState,
} from "react-hook-form";
import QuestionItemBuilder from "./QuestionItemBuilder";
import { FormRequestData } from "./type";

type Props = {
  control: Control<FormRequestData>;
  register: UseFormRegister<FormRequestData>;
};

const FormBuilder: FC<Props> = (props) => {
  const { register, control } = props;

  const { isSubmitting } = useFormState({ control });
  const {
    fields: questionList,
    append: appendQuestion,
    remove: removeQuestion,
    move: moveQuestion,
  } = useFieldArray({
    control,
    name: "questions",
  });

  const handleAppendQuestion = () => {
    appendQuestion({
      data: {
        question: "",
        expected_response_type: "text",
      },
      option: [],
    });
  };

  const handleRemoveQuestion = useCallback(
    async (questionIndex: number) => {
      removeQuestion(questionIndex);
    },
    [removeQuestion]
  );

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const source = result.source.index;
    const destination = result.destination?.index;
    moveQuestion(source, destination);
  };

  /** For referencing saving on database
  const handleSaveFormRequest = async () => {
    try {
      const { title, questions } = getValues();

      const options = questions.map((item) => item.option);

      const formNameRecord = await supabase
        .from("form_name_table")
        .insert({ form_name: title })
        .select();

      const questionRecord = await supabase
        .from("question_table")
        .insert([...(questions.map((item) => item.data) as Question[])])
        .select();

      if (!formNameRecord.data) return;

      const priority = questionRecord.data?.map(
        (item) => item.question_id
      ) as number[];

      const [{ form_name_id }] = formNameRecord.data;

      await supabase
        .from("form_priority_table")
        .insert({ form_name_id: form_name_id, priority });

      const userCreatedOption = alignQuestionOption(
        questionRecord.data as QuestionRow[],
        options as unknown as QuestionOption[][]
      );
      await supabase
        .from("user_created_select_option_table")
        .insert(userCreatedOption);
    } catch (e) {
      console.error(e);
    }
  }; **/

  return (
    <Stack mt="lg">
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable
          droppableId="questions"
          type="questionDroppable"
          isDropDisabled={isSubmitting}
        >
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {questionList.map((item, index) => (
                <QuestionItemBuilder
                  key={item.id}
                  register={register}
                  control={control}
                  questionIndex={index}
                  handleRemoveQuestion={handleRemoveQuestion}
                />
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
      <Button
        role="button"
        aria-label="Add Question"
        variant="light"
        disabled={isSubmitting ? true : false}
        onClick={handleAppendQuestion}
      >
        <AddCircle />
        &nbsp;Add Question
      </Button>
    </Stack>
  );
};

export default memo(FormBuilder);
