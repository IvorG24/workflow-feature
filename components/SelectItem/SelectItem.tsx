import { Avatar, Group, Text } from "@mantine/core";
import { forwardRef } from "react";
import { AddCircle } from "../Icon";
import IconWrapper from "../IconWrapper/IconWrapper";

// ref: https://mantine.dev/core/select/#custom-item-component
//  need to use interface to use extend
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  image: string;
  label: string;
  description: string;
  value: string;
}

// eslint-disable-next-line react/display-name
const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, description, value, ...others }: ItemProps, ref) => {
    return (
      <div ref={ref} {...others}>
        <Group noWrap>
          {value !== "create" ? (
            <Avatar src={image} size="sm" radius="xl" />
          ) : (
            <IconWrapper pl={5}>
              <AddCircle />
            </IconWrapper>
          )}
          <div>
            <Text size="sm">{label}</Text>
            {description && (
              <Text size="xs" color="dimmed">
                {description}
              </Text>
            )}
          </div>
        </Group>
      </div>
    );
  }
);

export default SelectItem;
