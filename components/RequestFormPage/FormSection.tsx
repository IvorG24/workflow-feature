import { FormType } from "@/utils/types";
import { Box, Paper, Space, Stack, Text, Title } from "@mantine/core";
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
      <Text color="dimmed" size={12}>
        {section.section_is_duplicatable ? "(Duplicatable)" : ""}
      </Text>
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
