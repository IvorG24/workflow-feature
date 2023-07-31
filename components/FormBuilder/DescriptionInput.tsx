import { TextInput, TextInputProps } from "@mantine/core";
import { useFormContext } from "react-hook-form";

const DescriptionInput = ({ ...props }: TextInputProps) => {
  const { register } = useFormContext();

  return (
    <TextInput
      label="Description"
      {...props}
      {...register("formDescription", {
        required: "Form description is required",
      })}
      withAsterisk
    />
  );
};

export default DescriptionInput;
