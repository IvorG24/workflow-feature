import { ActionIcon, Flex, FlexProps } from "@mantine/core";
import { IconCircleMinus } from "@tabler/icons-react";
import { MouseEventHandler } from "react";

type Props = {
  onDelete: MouseEventHandler<HTMLButtonElement>;
} & FlexProps;

const OptionContainer = ({ onDelete, children, ...props }: Props) => {
  return (
    <Flex gap="sm" align="center" justify="center" {...props}>
      {children}
      <ActionIcon color="red" onClick={onDelete} mt={40}>
        <IconCircleMinus height={16} />
      </ActionIcon>
    </Flex>
  );
};

export default OptionContainer;
