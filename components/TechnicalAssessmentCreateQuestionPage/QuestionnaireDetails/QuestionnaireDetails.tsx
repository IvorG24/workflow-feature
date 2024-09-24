import { Paper, Stack, TextInput } from "@mantine/core";

type QuestionnaireData = {
  questionnaire_name: string;
  questionnaire_date_created: string;
};

type Props = {
  questionnaireData: QuestionnaireData;
};

const QuestionnaireDetails = ({ questionnaireData }: Props) => {
  return (
    <Paper shadow="sm" p={20}>
      <Stack spacing="md">
        <TextInput
          variant="filled"
          label="Questionnaire Name"
          value={"ivor"}
          readOnly
        />
        <TextInput
          variant="filled"
          label="Date Created"
          value={"2022-01-01"}
          readOnly
        />
      </Stack>
    </Paper>
  );
};

export default QuestionnaireDetails;
