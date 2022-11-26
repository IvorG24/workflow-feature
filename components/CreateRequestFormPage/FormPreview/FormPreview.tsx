import QuestionPreview from "@/components/CreateRequestFormPage/FormPreview/QuestionPreview";
import FormRequest from "@/components/CreateRequestFormPage/type/FormModel";
import { Divider, Paper, Stack, Title } from "@mantine/core";
import { FC, memo } from "react";

type Props = {
  formRequest: FormRequest;
};

const FormPreview: FC<Props> = (props) => {
  const { formRequest } = props;
  const { form_name, questions } = formRequest;

  return (
    <Stack spacing="sm">
      <Title size="h5">Preview</Title>
      <Paper withBorder shadow="sm" p="md">
        <Title size="h5" aria-label="Form Title">
          {form_name}
        </Title>
        <Divider my="sm" label="Questions" labelPosition="center" />
        <Stack spacing="sm">
          {questions.map((item, index) => (
            <QuestionPreview key={index} question={item} />
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default memo(FormPreview);
