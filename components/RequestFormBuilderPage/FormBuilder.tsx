import { AddCircle } from "@/components/Icon";
import { Database } from "@/utils/database.types";
import { saveReactDndRequestForm } from "@/utils/queries";
import { FormRequest } from "@/utils/types";
import {
  Box,
  Button,
  Notification,
  Paper,
  Stack,
  TextInput,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
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
import QuestionItemBuilder from "./QuestionItemBuilder";

type Props = {
  control: Control<FormRequest>;
  register: UseFormRegister<FormRequest>;
  handleSubmit: UseFormHandleSubmit<FormRequest>;
  getValues: UseFormGetValues<FormRequest>;
};

const FormBuilder: FC<Props> = (props) => {
  const supabaseClient = useSupabaseClient<Database>();
  const user = useUser();
  const router = useRouter();

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

      console.log("form_name", JSON.stringify(form_name));
      console.log("questions", JSON.stringify(questions));

      await saveReactDndRequestForm(
        supabaseClient,
        getValues(),
        user?.id as string,
        router.query.tid as string,
        "request"
      );

      showNotification({
        title: "Form built",
        message: "You can now create requests with this form!",
      });
      router.push(`/t/${router.query.tid}/forms`);
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
