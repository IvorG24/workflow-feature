import {
  ActionIcon,
  Center,
  Checkbox,
  Flex,
  MultiSelect,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { MouseEventHandler, useState } from "react";
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
  const [tooltipChecked, setTooltipChecked] = useState(
    item.tooltip.length ? true : false
  );
  const [requiredChecked, setRequiredChecked] = useState(item.required);
  const [responseType, setResponseType] = useState<string | null>(
    item.reponse_type
  );
  const [toolTip, setToolTip] = useState(item.tooltip);
  const [selectionArray, setSelectionArray] = useState<
    { value: string; label: string }[] | []
  >([]);
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
        <Stack spacing="xs">
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
            value={responseType}
            onChange={setResponseType}
          />
          {(responseType === "select" || responseType === "multiple") && (
            <MultiSelect
              label="Options"
              data={selectionArray}
              placeholder="Select items"
              searchable
              creatable
              getCreateLabel={(query) => `+ Create ${query}`}
              onCreate={(query) => {
                const item = { value: query, label: query };
                setSelectionArray((current) => [...current, item]);
                return item;
              }}
            />
          )}
          <Flex gap="xl">
            <Checkbox
              label="Required"
              checked={requiredChecked}
              onChange={() => setRequiredChecked((v) => !v)}
            />
            <Checkbox
              label="Tooltip"
              checked={tooltipChecked}
              onChange={() => setTooltipChecked((v) => !v)}
            />
          </Flex>
          {tooltipChecked && (
            <TextInput
              label="Tooltip"
              value={toolTip}
              onChange={(e) => setToolTip(e.target.value)}
            />
          )}
        </Stack>
      </form>
    </Paper>
  );
};

export default Item;
