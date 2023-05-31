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
          variant="light"
          size="lg"
          radius={100}
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === "dark" ? theme.colors.dark[5] : "#FFFFFF",
          })}
        >
          <Text size="lg" fw={700}>
            -
          </Text>
        </ActionIcon>
      )}
      {canAdd && (
        <ActionIcon
          onClick={onAdd}
          variant="light"
          size="lg"
          radius={100}
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === "dark" ? theme.colors.dark[5] : "#FFFFFF",
          })}
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
