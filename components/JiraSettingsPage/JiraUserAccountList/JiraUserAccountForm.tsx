import { Button, LoadingOverlay, Modal, Select, Stack } from "@mantine/core";
import { Controller, useFormContext } from "react-hook-form";
import { AddProjectJiraUserForm } from "./JiraUserAccountList";

type Props = {
  opened: boolean;
  close: () => void;
  userSelectOptionList: { value: string; label: string }[];
  roleSelectOptionList: { value: string; label: string }[];
  onSubmit: (data: AddProjectJiraUserForm) => void;
  isLoading?: boolean;
};

const JiraUserAccountForm = ({
  opened,
  close,
  userSelectOptionList,
  roleSelectOptionList,
  onSubmit,
  isLoading,
}: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useFormContext<AddProjectJiraUserForm>();
  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Add Jira User to Project"
      centered
      pos="relative"
    >
      <LoadingOverlay overlayBlur={2} visible={Boolean(isLoading)} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack h="auto">
          <Controller
            name={"userAccountId"}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select
                label="Select User"
                searchable
                data={userSelectOptionList}
                withinPortal={true}
                value={value}
                onChange={onChange}
                error={errors.userAccountId?.message}
              />
            )}
            rules={{ required: "This field is required." }}
          />
          <Controller
            name={"userRoleId"}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select
                label="Select Role"
                data={roleSelectOptionList}
                withinPortal={true}
                value={value}
                onChange={onChange}
                error={errors.userRoleId?.message}
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

export default JiraUserAccountForm;
