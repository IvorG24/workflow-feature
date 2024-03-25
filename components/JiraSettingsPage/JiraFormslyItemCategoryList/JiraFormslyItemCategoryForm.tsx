import { JiraItemCategoryTableUpdate } from "@/utils/types";
import { Button, LoadingOverlay, Modal, Stack, TextInput } from "@mantine/core";
import { useFormContext } from "react-hook-form";

type Props = {
  opened: boolean;
  close: () => void;
  onSubmit: (data: JiraItemCategoryTableUpdate) => void;
  isLoading?: boolean;
};

const JiraFormslyItemCategoryForm = ({
  opened,
  close,
  onSubmit,
  isLoading,
}: Props) => {
  const { register, handleSubmit } =
    useFormContext<JiraItemCategoryTableUpdate>();
  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Update Item Category"
      centered
      pos="relative"
    >
      <LoadingOverlay overlayBlur={2} visible={Boolean(isLoading)} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack h="auto">
          <TextInput
            placeholder="Formsly Label"
            label="Formsly Label"
            required
            {...register("jira_item_category_formsly_label", {
              required: "This field is required.",
            })}
            readOnly
            variant="filled"
          />
          <TextInput
            placeholder="Jira ID"
            label="Jira ID"
            required
            {...register("jira_item_category_jira_id", {
              required: "This field is required.",
            })}
          />
          <TextInput
            placeholder="Jira Label"
            label="Jira Label"
            required
            {...register("jira_item_category_jira_label", {
              required: "This field is required.",
            })}
          />
          <Button type="submit">Submit</Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default JiraFormslyItemCategoryForm;
