import { Button, LoadingOverlay, Modal, Select, Stack } from "@mantine/core";
import { Controller, useFormContext } from "react-hook-form";
import { AssignFormslyProjectForm } from "../JiraSettingsPage";

type Props = {
  opened: boolean;
  close: () => void;
  selectOptionList: { value: string; label: string }[];
  onSubmit: (data: AssignFormslyProjectForm) => void;
  isLoading?: boolean;
};

const JiraProjectForm = ({
  opened,
  close,
  selectOptionList,
  onSubmit,
  isLoading,
}: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useFormContext<AssignFormslyProjectForm>();
  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Assign to Jira Project"
      centered
      pos="relative"
    >
      <LoadingOverlay overlayBlur={2} visible={Boolean(isLoading)} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack h="auto">
          <Controller
            name={"jiraProjectId"}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select
                label="Select a Jira Project"
                searchable
                data={selectOptionList}
                withinPortal={true}
                value={value}
                error={errors.jiraProjectId?.message}
                onChange={onChange}
              />
            )}
            rules={{ required: "This field is required." }}
          />

          <Button type="submit">Submit</Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default JiraProjectForm;
