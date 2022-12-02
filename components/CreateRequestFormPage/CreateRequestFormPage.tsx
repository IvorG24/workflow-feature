// todo: create unit tests for create form page
import FormBuilder from "@/components/CreateRequestFormPage/FormBuilder";
import { FormRequest } from "@/components/CreateRequestFormPage/type";
import { FC } from "react";
import { useForm } from "react-hook-form";

const CreateRequestFormPage: FC = () => {
  /* @fetchQuestion will set as default value on useForm whenever the user click on existing form,
   dummy fetched Data for reusablity of component and to simulate the flow,
    this comment will be remove once approved on preview, Will set this component if state for action is creation or edit
  */

  /** 
  Simulation: fetch from database
  fetchQuestion will populate the useForm provided defaultValues

  const fetchedQuestion = reorderByPriority(
    dummyRequestData.questions as QuestionRow[],
    dummyDataPriorityIndex
  );
   **/

  const { control, register, handleSubmit, getValues } = useForm<FormRequest>({
    defaultValues: { form_name: "", questions: [] },
  });

  return (
    <FormBuilder
      control={control}
      register={register}
      handleSubmit={handleSubmit}
      getValues={getValues}
    />
  );
};

export default CreateRequestFormPage;
