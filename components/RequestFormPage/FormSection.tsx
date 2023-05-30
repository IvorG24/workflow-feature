import { FormType } from "@/utils/types";
import { Box, Paper, Space, Stack, Title } from "@mantine/core";
import FormField from "./FormField";

type Props = {
  section: FormType["form_section"][0];
};

const FormSection = ({ section }: Props) => {
  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        {section.section_name}
      </Title>
      <Space h="xl" />
      <Stack spacing="sm">
        {section.section_field.map((field) => (
          <Box key={field.field_id}>
            <FormField field={field} />
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default FormSection;
