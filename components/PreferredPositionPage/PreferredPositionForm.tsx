import {
  OptionType,
  PreferredPositionFormType,
  PreferredPositionType,
} from "@/utils/types";
import {
  ActionIcon,
  Button,
  Group,
  ScrollArea,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Controller, useFormContext } from "react-hook-form";

type Props = {
  member: PreferredPositionType;
  positionOptions: OptionType[];
  positionList: { [key: string]: string[] };
  handleAddPosition: (memberId: string, value: string) => void;
  handleDeletePosition: (memberId: string, position: string) => void;
  handleSubmitPosition: (
    data: PreferredPositionFormType,
    memberId: string
  ) => void;
};

const PreferredPositionForm = ({
  member,
  positionOptions,
  positionList,
  handleAddPosition,
  handleDeletePosition,
  handleSubmitPosition,
}: Props) => {
  const { control, handleSubmit } = useFormContext<PreferredPositionFormType>();
  const hasPositions = positionList[member.group_member_id]?.length > 0;
  return (
    <form
      onSubmit={handleSubmit((data) =>
        handleSubmitPosition(data, member.group_member_id)
      )}
    >
      <Stack spacing="sm">
        <Controller
          control={control}
          name={`selectedPositions.${member.group_member_id}`}
          render={() => (
            <Select
              placeholder="Select positions"
              data={positionOptions}
              value={positionList[member.group_member_id]?.[0] || ""}
              onChange={(value) => {
                if (value) {
                  handleAddPosition(member.group_member_id, value);
                }
              }}
              searchable
              clearable
            />
          )}
        />

        {hasPositions && (
          <ScrollArea h={400} mah={300}>
            <Stack>
              <Text>List of Positions</Text>
              {positionList[member.group_member_id].map((position, idx) => (
                <Group
                  key={idx}
                  spacing="xs"
                  mx="sm"
                  position="apart"
                  align="center"
                >
                  <Group>
                    <IconPlus size={16} />
                    <Text ml="xs">{position}</Text>
                  </Group>

                  <ActionIcon
                    color="red"
                    onClick={() =>
                      handleDeletePosition(member.group_member_id, position)
                    }
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
          </ScrollArea>
        )}
        <Button disabled={!hasPositions} type="submit">
          Save
        </Button>
      </Stack>
    </form>
  );
};

export default PreferredPositionForm;
