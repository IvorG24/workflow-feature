import { JiraItemCategoryUserTableInsert } from "@/utils/types";
import { Button, LoadingOverlay, Modal, Select, Stack } from "@mantine/core";
import { Controller, useFormContext } from "react-hook-form";

type Props = {
  opened: boolean;
  close: () => void;
  onSubmit: (data: JiraItemCategoryUserTableInsert) => void;
  isLoading?: boolean;
  selectOptionList: { value: string; label: string }[];
};

const JiraFormslyItemCategoryUserForm = ({
  opened,
  close,
  onSubmit,
  isLoading,
  selectOptionList,
}: Props) => {
  const { control, handleSubmit } =
    useFormContext<JiraItemCategoryUserTableInsert>();
  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Assign User"
      centered
      pos="relative"
    >
      <LoadingOverlay overlayBlur={2} visible={Boolean(isLoading)} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack h="auto">
          <Controller
            name={"jira_item_user_account_id"}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select
                label="Select Jira User"
                placeholder="John Doe"
                searchable
                data={selectOptionList}
                withinPortal={true}
                value={value}
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

export default JiraFormslyItemCategoryUserForm;
