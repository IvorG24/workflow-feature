import { Avatar, Group, Text } from "@mantine/core";
import { forwardRef } from "react";

// ref: https://mantine.dev/core/select/#custom-item-component
//  need to use interface to use extend
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  image: string;
  label: string;
  description: string;
}

// eslint-disable-next-line react/display-name
const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, description, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar src={image} size="sm" radius="xl" />
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
  )
);

export default SelectItem;
