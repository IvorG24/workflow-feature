import { getAllItems, getItem } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Select,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

type FormValues = {
  items: {
    item_general_name: string;
    item_description_list:
      | {
          item_description_label: string;
          item_description_field_option: string[];
          item_description_field_value: string;
        }[]
      | null;
  }[];
};

const OTPSearch = () => {
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const defaultFormValues = [
    { item_general_name: "", item_description_list: null },
  ];
  const [generalNameList, setGeneralNameList] = useState<string[]>([]);
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      items: defaultFormValues,
    },
  });
  const { fields, append, update, remove } = useFieldArray({
    control,
    name: "items",
  });

  const handleGeneralNameChange = async (value: string, fieldIndex: number) => {
    const item = await getItem(supabaseClient, {
      teamId: activeTeam.team_id,
      itemName: value,
    });

    const itemWithDescription = {
      item_general_name: item.item_general_name,
      item_description_list: item.item_description.map((description) => ({
        item_description_label: description.item_description_label,
        item_description_field_value: "",
        item_description_field_option: description.item_description_field.map(
          (fieldDescription) => fieldDescription.item_description_field_value
        ),
      })),
    };

    update(fieldIndex, itemWithDescription);
  };

  const handleAddItem = () => {
    append(defaultFormValues);
  };

  const handleRemoveItem = (index: number) => {
    remove(index);
  };

  const handleSearchItemQuery = (data: FormValues) => {
    if (data.items[0].item_general_name === "") {
      return notifications.show({
        message: "Please select an item and add item properties.",
        color: "orange",
      });
    }
    console.log(data);
  };

  useEffect(() => {
    const fetchTeamItemList = async () => {
      const data = await getAllItems(supabaseClient, {
        teamId: activeTeam.team_id,
      });

      const itemGeneralNameList = data.map((d) => d.item_general_name);
      setGeneralNameList(itemGeneralNameList);
    };
    fetchTeamItemList();
  }, []);

  return (
    <Box>
      <form onSubmit={handleSubmit(handleSearchItemQuery)}>
        {fields.map((field, fieldIndex) => (
          <Box key={field.id}>
            <Flex align="flex-end" wrap="wrap" gap="sm">
              <Controller
                control={control}
                name={`items.${fieldIndex}.item_general_name`}
                render={({ field: { value, onChange } }) => (
                  <Select
                    value={value}
                    label="General Name"
                    data={generalNameList}
                    onChange={(value: string) => {
                      onChange(value);
                      handleGeneralNameChange(value, fieldIndex);
                    }}
                  />
                )}
              />
              {field.item_description_list &&
                field.item_description_list.map(
                  (description, descriptionIndex) => {
                    const descriptionOptions =
                      description.item_description_field_option;

                    return (
                      <Controller
                        key={descriptionIndex}
                        control={control}
                        name={`items.${fieldIndex}.item_description_list.${descriptionIndex}.item_description_field_value`}
                        render={({ field: { value, onChange } }) => (
                          <Select
                            label={description.item_description_label}
                            value={value}
                            onChange={(value) => onChange(value)}
                            data={descriptionOptions}
                          />
                        )}
                      />
                    );
                  }
                )}
              {fieldIndex !== 0 ? (
                <ActionIcon
                  w={36}
                  h={36}
                  color="red"
                  onClick={() => handleRemoveItem(fieldIndex)}
                >
                  <IconTrash size={20} />
                </ActionIcon>
              ) : null}
            </Flex>
            <Divider my="md" />
          </Box>
        ))}

        <Group mt="md" position="center">
          <Button
            px={0}
            variant="subtle"
            leftIcon={<IconPlus size={14} />}
            onClick={() => handleAddItem()}
          >
            Add another item
          </Button>
          <Button type="submit">Analyze Data</Button>
        </Group>
      </form>
    </Box>
  );
};

export default OTPSearch;
