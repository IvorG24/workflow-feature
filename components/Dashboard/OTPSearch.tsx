import { getAllItems, getItem } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { ActionIcon, Box, Button, Flex, Select } from "@mantine/core";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconCircleMinus } from "@tabler/icons-react";
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
      <form>
        {fields.map((field, fieldIndex) => (
          <Flex key={field.id} align="flex-end" wrap="wrap" gap="sm">
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
            {/* don't show if item is index === 0 */}
            {fieldIndex !== fields.length - 1 ? (
              <ActionIcon
                w={36}
                h={36}
                color="red"
                onClick={() => handleRemoveItem(fieldIndex)}
              >
                <IconCircleMinus size="24px" />
              </ActionIcon>
            ) : null}
          </Flex>
        ))}

        <Button mt="sm" onClick={() => handleAddItem()}>
          Add Item
        </Button>
      </form>
    </Box>
  );
};

export default OTPSearch;
