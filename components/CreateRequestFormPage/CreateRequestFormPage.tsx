// todo: create unit tests for create form page
import FormBuilder from "@/components/CreateRequestFormPage/FormBuilder";
import FormPreview from "@/components/CreateRequestFormPage/FormPreview";
import FormRequest from "@/components/CreateRequestFormPage/type/FormModel";
import { Box, Container, Grid, Title } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { FC } from "react";
import { useForm, useWatch } from "react-hook-form";

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

  const watchForm = useWatch({ control });

  const [debounceFormRequest] = useDebouncedValue(
    watchForm as FormRequest,
    400
  );

  return (
    <Container fluid>
      <Title size="h2" mb="lg">
        Create Request
      </Title>
      <Grid>
        <Grid.Col span={12} lg={6}>
          <FormBuilder
            control={control}
            register={register}
            handleSubmit={handleSubmit}
            getValues={getValues}
          />
        </Grid.Col>
        <Grid.Col span={12} lg={6}>
          <Box style={{ position: "sticky", top: "1rem" }}>
            <FormPreview formRequest={debounceFormRequest} />
          </Box>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default CreateRequestFormPage;
