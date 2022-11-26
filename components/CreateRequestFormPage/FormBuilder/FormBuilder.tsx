import QuestionItem from "@/components/CreateRequestFormPage/FormBuilder/components/QuestionItem";
import FormRequest, {
  Question,
  QuestionOption,
  QuestionRow,
} from "@/components/CreateRequestFormPage/type/FormModel";
import alignQuestionOption from "@/components/CreateRequestFormPage/utils/alignQuestionOption";
import { AddCircle } from "@/components/Icon";
import { Database } from "@/utils/database.types";
import {
  Box,
  Button,
  Notification,
  Paper,
  Stack,
  TextInput,
} from "@mantine/core";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { FC, memo, useCallback, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import {
  Control,
  useFieldArray,
  UseFormGetValues,
  UseFormHandleSubmit,
  UseFormRegister,
  useFormState,
} from "react-hook-form";

type Props = {
  control: Control<FormRequest>;
  register: UseFormRegister<FormRequest>;
  handleSubmit: UseFormHandleSubmit<FormRequest>;
  getValues: UseFormGetValues<FormRequest>;
};

const FormBuilder: FC<Props> = (props) => {
  const supabase = useSupabaseClient<Database>();

  const { register, control, handleSubmit, getValues } = props;
  const [notification, setNotification] = useState("");

  const { errors, isSubmitting } = useFormState({ control });
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

  const handleSaveFormRequest = async () => {
    try {
      const { form_name, questions } = getValues();

      const options = questions.map((item) => item.option);

      const formNameRecord = await supabase
        .from("form_name_table")
        .insert({ form_name })
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
      setNotification("Error saving the form");
    }
  };

  return (
    <>
      {notification && (
        <Notification
          title="Something went wrong"
          color="red"
          onClose={() => setNotification("")}
          mb="md"
        >
          {notification}
        </Notification>
      )}
      <form
        role="form"
        aria-label="Create Request Form"
        onSubmit={handleSubmit(handleSaveFormRequest)}
      >
        <Stack>
          <Paper withBorder shadow="sm" p="md">
            <TextInput
              role="textbox"
              aria-label="Form Name"
              label="Form Name"
              size="md"
              variant="filled"
              placeholder="Name"
              withAsterisk
              mb="sm"
              {...register("form_name", {
                required: "Form name is required",
              })}
              error={errors.form_name?.message}
            />
          </Paper>
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable
              droppableId="questions"
              type="questionDroppable"
              isDropDisabled={isSubmitting}
            >
              {(provided) => (
                <Box ref={provided.innerRef} {...provided.droppableProps}>
                  {questionList.map((item, index) => (
                    <QuestionItem
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
            variant="outline"
            disabled={isSubmitting ? true : false}
            onClick={handleAppendQuestion}
          >
            <AddCircle />
            &nbsp;Add Question
          </Button>
          <Button
            aria-label="Save"
            role="button"
            type="submit"
            loading={isSubmitting}
          >
            Save
          </Button>
        </Stack>
      </form>
    </>
  );
};

export default memo(FormBuilder);
