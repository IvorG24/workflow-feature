import { ActionIcon, Flex, SelectItemProps, Text } from "@mantine/core";
import { forwardRef } from "react";

type ItemProps = SelectItemProps & {
  label: string;
  icon?: JSX.Element;
};
const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ label, icon, ...others }: ItemProps, ref) => (
    <Flex gap={4} align={"center"} ref={ref} {...others}>
      {icon && <ActionIcon color="blue">{icon}</ActionIcon>}
      {icon ? (
        <Text color="blue" weight={500}>
          {label}
        </Text>
      ) : (
        <Text>{label}</Text>
      )}
    </Flex>
  )
);

SelectItem.displayName = "SelectItem";

export default SelectItem;
