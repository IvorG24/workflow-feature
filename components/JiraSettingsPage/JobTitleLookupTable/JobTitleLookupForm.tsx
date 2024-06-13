import { JobTitleTableInsert, JobTitleTableUpdate } from "@/utils/types";
import { Button, LoadingOverlay, Modal, Stack, TextInput } from "@mantine/core";
import { useFormContext } from "react-hook-form";

type Props = {
  opened: boolean;
  close: () => void;
  onSubmit: (data: JobTitleTableInsert | JobTitleTableUpdate) => void;
  isLoading?: boolean;
  isUpdate?: boolean;
};

const JobTitleLookupForm = ({
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
  } = useFormContext<JobTitleTableInsert | JobTitleTableUpdate>();
  return (
    <Modal
      opened={opened}
      onClose={close}
      title={`${isUpdate ? "Update" : "Create"} Job Title`}
      centered
      pos="relative"
      id="Job Title Lookup Form"
    >
      <LoadingOverlay overlayBlur={2} visible={Boolean(isLoading)} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack h="auto">
          <TextInput
            label="Job Title"
            {...register("employee_job_title_label", {
              required: "Job title is required.",
            })}
            required
            error={errors.employee_job_title_label?.message}
            sx={{
              input: {
                textTransform: "uppercase",
              },
            }}
          />

          <Button type="submit" disabled={isLoading}>
            Submit
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default JobTitleLookupForm;
