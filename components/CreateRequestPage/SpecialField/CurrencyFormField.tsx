import { MAX_INT } from "@/utils/constant";
import {
  Box,
  Flex,
  NumberInput,
  NumberInputProps,
  Select,
  SelectProps,
  Stack,
  Text,
} from "@mantine/core";

type Props = {
  className?: string;
  numberInputProps: NumberInputProps;
  selectInputProps: SelectProps;
  label: string;
  description?: string;
};

const CurrencyFormField = ({
  className,
  numberInputProps,
  selectInputProps,
  label,
  description,
}: Props) => {
  return (
    <Stack spacing={4}>
      <Box>
        <Text size={14} fw={500}>
          {label}
        </Text>
        <Text size={12} c="dimmed">
          {description}
        </Text>
      </Box>
      <Flex
        align="center"
        gap={0}
        wrap="wrap"
        sx={{ border: "0.0625rem solid #ced4da", borderRadius: "0.25rem" }}
      >
        <Select
          w={85}
          {...selectInputProps}
          styles={{ input: { border: "none" } }}
          searchable
          required
        />
        <NumberInput
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
          max={MAX_INT}
        />
      </Flex>
    </Stack>
  );
};

export default CurrencyFormField;
