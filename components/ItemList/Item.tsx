import {
  ActionIcon,
  Center,
  Checkbox,
  Flex,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { MouseEventHandler } from "react";
import { DraggableProvided } from "react-beautiful-dnd";
import { Close } from "../Icon";
import IconWrapper from "../IconWrapper/IconWrapper";
import { ItemData } from "./ItemList";

type Props = {
  item: ItemData;
  onDelete: MouseEventHandler<HTMLButtonElement>;
  isDelete: boolean;
  provided: DraggableProvided;
};

const Item = ({ item, onDelete, isDelete, provided }: Props) => {
  return (
    <Paper withBorder shadow="sm" p="lg" radius="md" mt="xl" pt={0}>
      <Center aria-details="draggable-area" {...provided.dragHandleProps}>
        <Text size="lg" weight={600} aria-label="draggable-three-dots">
          ...
        </Text>
      </Center>
      <Flex justify="flex-end">
        {isDelete && (
          <ActionIcon onClick={onDelete}>
            <IconWrapper color="red">
              <Close />
            </IconWrapper>
          </ActionIcon>
        )}
      </Flex>
      <form>
        <Stack>
          <TextInput label="Question" value={item.question} />
          <Select
            label="Response Type"
            placeholder="Choose Type"
            data={[
              { value: "text", label: "TEXT" },
              { value: "number", label: "NUMBER" },
              { value: "date", label: "DATE" },
              { value: "date range", label: "DATE RANGE" },
              { value: "email", label: "EMAIL" },
              { value: "multiple", label: "MULTIPLE" },
              { value: "slider", label: "SLIDER" },
              { value: "select", label: "SELECT" },
              { value: "time", label: "TIME" },
            ]}
          />
          <TextInput label="Tooltip" />
          <Checkbox label="Required" />
        </Stack>
      </form>
    </Paper>
  );
};

export default Item;
