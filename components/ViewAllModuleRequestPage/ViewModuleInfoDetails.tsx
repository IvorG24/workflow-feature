import { formatDate } from "@/utils/constant";
import { ModuleData, ModuleFormItem } from "@/utils/types";
import { Paper, Space, Stack, TextInput, Title } from "@mantine/core";

type Props = {
  moduleData: ModuleData;
  moduleRequestId: string;
  formCollection: ModuleFormItem[];
};

const ViewModuleInfoDetails = ({
  moduleData,
  formCollection,
  moduleRequestId,
}: Props) => {
  const matchedForm =
    formCollection.find((form) => form.form_id === moduleData.module_form)
      ?.form_name || "No Form Available"; // Provide a default value

  return (
    <Paper p="xl" shadow="xs">
      <Title order={4} color="dimmed">
        Metadata
      </Title>
      <Space h="xl" />
      <Stack spacing="xs">
        <TextInput
          label="Module Name"
          value={moduleData.module_name || ""} // Provide a default value
          readOnly
          variant="filled"
        />
        <TextInput
          label="Module Request ID"
          value={moduleRequestId || ""} // Provide a default value
          readOnly
          variant="filled"
        />
        <TextInput
          label="Module request Date Created"
          value={formatDate(new Date(moduleData.module_date_created)) || ""} // Provide a default value
          readOnly
          variant="filled"
        />
        <TextInput
          label="Module Requested by"
          value={`${moduleData.requestor.user_first_name || ""} ${moduleData.requestor.user_last_name || ""}`} // Provide a default value
          readOnly
          variant="filled"
        />
        <TextInput
          label="Module Latest Form"
          value={matchedForm}
          readOnly
          variant="filled"
        />

        <TextInput
          label="Module Latest Status"
          value={moduleData.module_status || ""} // Provide a default value
          readOnly
          variant="filled"
        />
      </Stack>
    </Paper>
  );
};

export default ViewModuleInfoDetails;
