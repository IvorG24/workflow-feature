import { SignerTableInsert, SignerTableUpdate } from "@/utils/types";
import {
  Autocomplete,
  Button,
  Checkbox,
  LoadingOverlay,
  Modal,
  Select,
  Stack,
} from "@mantine/core";
import { Controller, useFormContext } from "react-hook-form";

type Props = {
  opened: boolean;
  close: () => void;
  onSubmit: (data: SignerTableInsert | SignerTableUpdate) => void;
  isLoading?: boolean;
  isUpdate?: boolean;
  departmentOptionList: { value: string; label: string }[];
  signerOptionList: { value: string; label: string }[];
};

const FormDepartmentSignerForm = ({
  opened,
  close,
  onSubmit,
  isLoading,
  isUpdate,
  departmentOptionList,
  signerOptionList,
}: Props) => {
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useFormContext<SignerTableInsert | SignerTableUpdate>();
  return (
    <Modal
      opened={opened}
      onClose={close}
      title={`${isUpdate ? "Update" : "Create"} Department Signer`}
      centered
      pos="relative"
      id="Department Signer Form"
    >
      <LoadingOverlay overlayBlur={2} visible={Boolean(isLoading)} />
      <Stack>
        <Controller
          name={"signer_team_department_id"}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Select
              label="Select Department"
              searchable
              data={departmentOptionList}
              withinPortal={true}
              value={value}
              error={errors.signer_team_department_id?.message}
              onChange={onChange}
            />
          )}
          rules={{ required: "This field is required." }}
        />
        <Controller
          name={"signer_team_member_id"}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Select
              label="Select Signer"
              searchable
              data={signerOptionList}
              withinPortal={true}
              value={value}
              error={errors.signer_team_member_id?.message}
              onChange={onChange}
            />
          )}
          rules={{ required: "This field is required." }}
        />
        <Controller
          name={"signer_action"}
          control={control}
          render={({ field: { onChange, value } }) => (
            <Autocomplete
              label="Select Action"
              data={["APPROVED", "NOTED", "PURCHASED"]}
              withinPortal={true}
              value={value}
              error={errors.signer_action?.message}
              onChange={onChange}
            />
          )}
          rules={{ required: "This field is required." }}
        />
        <Checkbox
          label="Make primary signer"
          {...register("signer_is_primary_signer")}
          sx={{ input: { cursor: "pointer" } }}
        />
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack h="auto">
            <Button type="submit" disabled={isLoading}>
              Submit
            </Button>
          </Stack>
        </form>
      </Stack>
    </Modal>
  );
};

export default FormDepartmentSignerForm;
