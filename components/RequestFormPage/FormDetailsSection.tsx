import { FormType } from "@/utils/types";
import { Paper, Text, Title } from "@mantine/core";

type Props = {
  form: FormType;
};

const FormDetailsSection = ({ form }: Props) => {
  return (
    <Paper p="xl" shadow="xs">
      <Title order={2}>{form.form_name}</Title>
      <Text mt="xs">{form.form_description}</Text>
    </Paper>
  );
};

export default FormDetailsSection;
