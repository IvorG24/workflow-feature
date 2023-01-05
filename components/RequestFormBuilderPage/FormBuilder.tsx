import { AddCircle } from "@/components/Icon";
import { Database } from "@/utils/database.types";
import { buildFormTemplate, updateFormTemplate } from "@/utils/queries-new";
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
  const isInEditMode = getValues().form_id ? true : false;
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
      isRequired: false,
      fieldTooltip: "",
      data: {
        question: "",
        expected_response_type: "text",
      },
      option: [],
    });
  };

  const handleAppendSection = () => {
    appendQuestion({
      isRequired: false,
      fieldTooltip: "",
      data: {
        question: "",
        expected_response_type: "section",
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

  const verify = (list: boolean[]) => {
    for (let i = 0; i < list.length; i++) {
      if (list[i] === true && list[i + 1] === true) {
        return false;
      }
    }
    return true;
  };

  const sectionConditions = () => {
    const isSectionList = getValues().questions.map(
      (question) => question.data.expected_response_type === "section"
    );

    if (!isSectionList) return false;
    if (isSectionList.length === 0) return false;

    if (!isSectionList[0]) {
      showNotification({
        title: "Invalid",
        message: "A question field must be under a section",
        color: "orange",
      });
      return false;
    } else if (isSectionList[isSectionList.length - 1]) {
      showNotification({
        title: "Invalid",
        message: "All sections must have at least one question",
        color: "orange",
      });
      return false;
    } else if (!verify(isSectionList as unknown as boolean[])) {
      showNotification({
        title: "Invalid",
        message: "All sections must have at least one question",
        color: "orange",
      });
      return false;
    }

    return true;
  };

  const handleSaveFormRequest = async () => {
    if (!sectionConditions()) return;

    try {
      // const { form_name, questions } = getValues();

      // await saveReactDndRequestForm(
      //   supabaseClient,
      //   getValues(),
      //   user?.id as string,
      //   router.query.tid as string,
      //   "request"
      // );

      await buildFormTemplate(
        supabaseClient,
        getValues(),
        user?.id as string,
        router.query.tid as string
      );

      showNotification({
        title: "Form built",
        message: "You can now create requests with this form!",
      });
      router.push(`/t/${router.query.tid}/forms`);
    } catch (e) {
      console.log("ERROR", e);
      setNotification("Error saving the form");
    }
  };

  const handleUpdateForm = async () => {
    if (!sectionConditions()) return;
    try {
      const { form_id, questions } = getValues();

      console.log(questions, JSON.stringify(questions, null, 2));

      await updateFormTemplate(supabaseClient, Number(form_id), questions);

      showNotification({
        title: "Form order updated",
        message: "Questions will now be displayed using the new order!",
      });
    } catch (e) {
      setNotification("Error updating form priority");
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
          data-cy="form-error-notification"
        >
          {notification}
        </Notification>
      )}
      <form
        role="form"
        aria-label="Create or Edit Request Form"
        onSubmit={handleSubmit(
          isInEditMode ? handleUpdateForm : handleSaveFormRequest
        )}
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
              disabled={isInEditMode}
              data-cy="form-name"
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
                      getValues={getValues}
                    />
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>

          {!isInEditMode && (
            <>
              <Button
                role="button"
                aria-label="Add Section"
                variant="outline"
                disabled={isSubmitting ? true : false}
                onClick={handleAppendSection}
                data-cy="add-section"
              >
                <AddCircle />
                &nbsp;Add Section
              </Button>
              <Button
                role="button"
                aria-label="Add Question"
                variant="outline"
                disabled={isSubmitting ? true : false}
                onClick={handleAppendQuestion}
                data-cy="add-question"
              >
                <AddCircle />
                &nbsp;Add Question
              </Button>
            </>
          )}

          <Button
            aria-label="Save"
            role="button"
            type="submit"
            loading={isSubmitting}
            data-cy="form-submit"
          >
            {`${isInEditMode ? "Update" : "Save"}`}
          </Button>
        </Stack>
      </form>
    </>
  );
};

export default memo(FormBuilder);
