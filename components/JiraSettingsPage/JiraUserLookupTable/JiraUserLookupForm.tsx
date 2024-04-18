import {
  JiraUserAccountTableInsert,
  JiraUserAccountTableUpdate,
} from "@/utils/types";
import { Button, LoadingOverlay, Modal, Stack, TextInput } from "@mantine/core";
import { useFormContext } from "react-hook-form";
import validator from "validator";

type Props = {
  opened: boolean;
  close: () => void;
  onSubmit: (
    data: JiraUserAccountTableInsert | JiraUserAccountTableUpdate
  ) => void;
  isLoading?: boolean;
  isUpdate?: boolean;
};

const JiraUserLookupForm = ({
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
  } = useFormContext<JiraUserAccountTableUpdate | JiraUserAccountTableInsert>();
  return (
    <Modal
      opened={opened}
      onClose={close}
      title={`${isUpdate ? "Update" : "Create"} Jira User`}
      centered
      pos="relative"
      id="Jira User Lookup Form"
    >
      <LoadingOverlay overlayBlur={2} visible={Boolean(isLoading)} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack h="auto">
          <TextInput
            label="Jira Id"
            {...register("jira_user_account_jira_id", {
              required: "Jira id is required.",
            })}
            required
            error={errors.jira_user_account_jira_id?.message}
          />

          <TextInput
            label="Display Name"
            {...register("jira_user_account_display_name", {
              required: "Display name is required.",
            })}
            required
            error={errors.jira_user_account_display_name?.message}
          />

          <TextInput
            label="Email"
            {...register("jira_user_account_email_address", {
              required: "Email is required.",
              validate: {
                isEmail: (v) =>
                  validator.isEmail(`${v}`) || "Email is invalid.",
              },
            })}
            error={errors.jira_user_account_email_address?.message}
            required
          />

          <Button type="submit">Submit</Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default JiraUserLookupForm;
