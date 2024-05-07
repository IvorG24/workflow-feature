import {
  JiraOrganizationTableInsert,
  JiraOrganizationTableUpdate,
} from "@/utils/types";
import { Button, LoadingOverlay, Modal, Stack, TextInput } from "@mantine/core";
import { useFormContext } from "react-hook-form";

type Props = {
  opened: boolean;
  close: () => void;
  onSubmit: (
    data: JiraOrganizationTableInsert | JiraOrganizationTableUpdate
  ) => void;
  isLoading?: boolean;
  isUpdate?: boolean;
};

const JiraOrganizationLookupForm = ({
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
  } = useFormContext<
    JiraOrganizationTableInsert | JiraOrganizationTableUpdate
  >();
  return (
    <Modal
      opened={opened}
      onClose={close}
      title={`${isUpdate ? "Update" : "Create"} Organization User`}
      centered
      pos="relative"
      id="Jira Organization Lookup Form"
    >
      <LoadingOverlay overlayBlur={2} visible={Boolean(isLoading)} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack h="auto">
          <TextInput
            label="Jira Id"
            {...register("jira_organization_jira_id", {
              required: "Jira id is required.",
            })}
            required
            error={errors.jira_organization_jira_id?.message}
          />

          <TextInput
            label="Jira label"
            {...register("jira_organization_jira_label", {
              required: "Jira label is required.",
            })}
            required
            error={errors.jira_organization_jira_label?.message}
          />

          <Button type="submit" disabled={isLoading}>
            Submit
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default JiraOrganizationLookupForm;
