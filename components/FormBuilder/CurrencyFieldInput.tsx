import { FieldWithFieldArrayId } from "@/utils/react-hook-form";
import {
  Flex,
  NumberInput,
  NumberInputProps,
  Select,
  SelectProps,
  Stack,
  Text,
} from "@mantine/core";

type Props = {
  field: FieldWithFieldArrayId;
  className?: string;
  numberInputProps: NumberInputProps;
  selectInputProps: SelectProps;
};

const CurrencyFieldInput = ({
  field,
  className,
  numberInputProps,
  selectInputProps,
}: Props) => {
  return (
    <Stack spacing={4}>
      <Text size={14} fw={500}>
        {field.field_name}
      </Text>
      <Flex
        align="center"
        gap={0}
        wrap="wrap"
        sx={{ border: "0.0625rem solid #ced4da", borderRadius: "0.25rem" }}
      >
        <Select
          w={80}
          {...selectInputProps}
          styles={{ input: { border: "none" } }}
          searchable
        />
        <NumberInput
          {...field}
          {...numberInputProps}
          className={className}
          styles={{
            input: {
              border: "none",
              borderLeft: "0.0625rem solid #ced4da",
              borderRadius: 0,
            },
          }}
          sx={{ flex: 1 }}
          hideControls
        />
      </Flex>
    </Stack>
  );
};

export default CurrencyFieldInput;
