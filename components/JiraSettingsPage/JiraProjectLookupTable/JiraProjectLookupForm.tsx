import { JiraProjectTableInsert, JiraProjectTableUpdate } from "@/utils/types";
import { Button, LoadingOverlay, Modal, Stack, TextInput } from "@mantine/core";
import { useFormContext } from "react-hook-form";

type Props = {
  opened: boolean;
  close: () => void;
  onSubmit: (data: JiraProjectTableUpdate | JiraProjectTableInsert) => void;
  isLoading?: boolean;
  isUpdate?: boolean;
};

const JiraProjectLookupForm = ({
  opened,
  close,
  onSubmit,
  isLoading,
  isUpdate,
}: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useFormContext<JiraProjectTableUpdate | JiraProjectTableInsert>();
  return (
    <Modal
      opened={opened}
      onClose={close}
      title={`${isUpdate ? "Update" : "Create"} Jira Project`}
      centered
      pos="relative"
    >
      <LoadingOverlay overlayBlur={2} visible={Boolean(isLoading)} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack h="auto">
          <TextInput
            label="Jira Id"
            {...register("jira_project_jira_id", {
              required: "Jira Id is required.",
            })}
            error={errors.jira_project_jira_id?.message}
            required
          />

          <TextInput
            label="Jira Label"
            {...register("jira_project_jira_label", {
              required: "Jira Label is required.",
            })}
            error={errors.jira_project_jira_label?.message}
            required
          />

          <Button type="submit">Submit</Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default JiraProjectLookupForm;
