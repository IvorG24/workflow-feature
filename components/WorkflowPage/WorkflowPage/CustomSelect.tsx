import { ActionIcon, Flex, SelectItemProps, Text } from "@mantine/core";
import { forwardRef } from "react";

type ItemProps = SelectItemProps & {
  label: string;
  icon?: JSX.Element;
};

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ label, icon, ...others }: ItemProps, ref) => (
    <Flex
      gap={4}
      align={"center"}
      ref={ref}
      {...others}
      sx={() => ({
        "&:hover": {
          backgroundColor: "inherit", // Maintain the original background color on hover
        },
        "&[data-active]": {
          backgroundColor: "inherit", // Maintain the original background color when active
        },
      })}
    >
      {icon && <ActionIcon color="white">{icon}</ActionIcon>}
      {icon ? <Text weight={500}>{label}</Text> : <Text>{label}</Text>}
    </Flex>
  )
);

SelectItem.displayName = "SelectItem";

export default SelectItem;
