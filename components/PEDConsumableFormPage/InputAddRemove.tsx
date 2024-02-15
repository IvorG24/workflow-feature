import { ActionIcon, Flex, Text } from "@mantine/core";
import { MouseEventHandler } from "react";

type Props = {
  canAdd: boolean;
  canRemove: boolean;
  onAdd: MouseEventHandler<HTMLButtonElement>;
  onRemove: MouseEventHandler<HTMLButtonElement>;
};

const InputAddRemove = ({ canAdd, canRemove, onAdd, onRemove }: Props) => {
  return (
    <Flex justify="center" align="center" gap="xl" mt="xl">
      {canRemove && (
        <ActionIcon
          onClick={onRemove}
          size="lg"
          radius={100}
          variant="light"
          color="blue"
        >
          <Text size="lg" fw={700}>
            -
          </Text>
        </ActionIcon>
      )}
      {canAdd && (
        <ActionIcon
          onClick={onAdd}
          size="lg"
          radius={100}
          variant="light"
          color="blue"
        >
          <Text size="lg" fw={700}>
            +
          </Text>
        </ActionIcon>
      )}
    </Flex>
  );
};

export default InputAddRemove;
