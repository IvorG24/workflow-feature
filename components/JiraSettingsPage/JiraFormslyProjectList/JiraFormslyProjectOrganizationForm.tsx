import { Button, LoadingOverlay, Modal, Select, Stack } from "@mantine/core";
import { Controller, useFormContext } from "react-hook-form";
import { AssignJiraOrganizationForm } from "./JiraFormslyProjectList";

type Props = {
  opened: boolean;
  close: () => void;
  selectOptionList: { value: string; label: string }[];
  onSubmit: (data: AssignJiraOrganizationForm) => void;
  isLoading?: boolean;
};

const JiraFormslyProjectOrganizationForm = ({
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
  } = useFormContext<AssignJiraOrganizationForm>();
  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Assign to Jira Organization"
      centered
      pos="relative"
    >
      <LoadingOverlay overlayBlur={2} visible={Boolean(isLoading)} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack h="auto">
          <Controller
            name={"jiraOrganizationId"}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select
                label="Select a Jira Organization"
                searchable
                data={selectOptionList}
                withinPortal={true}
                value={value}
                error={errors.jiraOrganizationId?.message}
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

export default JiraFormslyProjectOrganizationForm;
