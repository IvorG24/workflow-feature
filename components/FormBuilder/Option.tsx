import { Box, TextInput, TextInputProps } from "@mantine/core";
import { ComponentPropsWithoutRef, forwardRef } from "react";

type OptionProps = {
  label: string;
} & TextInputProps &
  ComponentPropsWithoutRef<"div">;

// eslint-disable-next-line react/display-name
const Option = forwardRef<HTMLDivElement, OptionProps>(
  ({ label, ...props }: OptionProps, ref) => {
    return (
      <Box ref={ref} w="90%">
        <TextInput label={label} mt={16} {...props} />
      </Box>
    );
  }
);

export default Option;
