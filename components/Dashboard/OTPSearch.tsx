import { getAllItems, getItem } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Flex,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  IconAlertCircle,
  IconCircleMinus,
  IconPlus,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";

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
  const [defaultItemList, setDefaultItemList] =
    useState<FormValues["items"]>(defaultFormValues);

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      items: defaultFormValues,
    },
  });

  const {
    fields: itemList,
    append: addItem,
    update: updateItem,
    remove: removeItem,
  } = useFieldArray({
    control,
    name: "items",
  });

  const currentItemList = useWatch({ name: "items", control });

  const handleGeneralNameChange = async (
    itemName: string,
    fieldIndex: number
  ) => {
    const duplicateItem = defaultItemList.find(
      (item) => item.item_general_name === itemName
    );
    if (duplicateItem && duplicateItem.item_description_list) {
      const itemDescriptionListWithEmptyValue =
        duplicateItem.item_description_list.map((description) => ({
          ...description,
          item_description_field_value: "",
        }));

      updateItem(fieldIndex, {
        ...duplicateItem,
        item_description_list: itemDescriptionListWithEmptyValue,
      });
    } else {
      const item = await getItem(supabaseClient, {
        teamId: activeTeam.team_id,
        itemName,
      });

      const newItem = {
        item_general_name: item.item_general_name,
        item_description_list: item.item_description.map((description) => ({
          item_description_label: description.item_description_label,
          item_description_field_value: "",
          item_description_field_option: description.item_description_field.map(
            (fieldDescription) => fieldDescription.item_description_field_value
          ),
        })),
      };
      setDefaultItemList((prev) => [...prev, newItem]);
      updateItem(fieldIndex, newItem);
    }
  };

  const handleAnalyzeData = (data: FormValues) => {
    const { items } = data;

    if (items[0].item_general_name === "") {
      return notifications.show({
        message: "Please select an item and add item properties.",
        color: "orange",
      });
    }
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

  // validation: check if each item is unique
  useEffect(() => {
    const duplicateItemsMap = new Map();

    currentItemList.forEach((currentItem, currentIndex) => {
      const duplicateItemIndex = duplicateItemsMap.get(
        currentItem.item_general_name
      );

      if (duplicateItemIndex === undefined) {
        clearErrors(`items.${currentIndex}`);
      } else {
        const duplicateItem = currentItemList[duplicateItemIndex];

        const isDuplicate = currentItem.item_description_list?.every(
          (currentDescription) => {
            const duplicateDescription =
              duplicateItem.item_description_list?.find(
                (d) =>
                  d.item_description_label ===
                  currentDescription.item_description_label
              );
            return (
              duplicateDescription?.item_description_field_value ===
              currentDescription.item_description_field_value
            );
          }
        );

        if (isDuplicate) {
          setError(`items.${currentIndex}`, {
            type: "hasDuplicate",
            message: "This item already exists.",
          });
        } else {
          clearErrors(`items.${currentIndex}`);
        }
      }

      // Store the index of the first occurrence of a duplicate item
      if (!duplicateItemsMap.has(currentItem.item_general_name)) {
        duplicateItemsMap.set(currentItem.item_general_name, currentIndex);
      }
    });
  }, [setError, currentItemList, clearErrors]);

  return (
    <Box p="md">
      <Title mb="md" order={4}>
        Get Data By Item Specs
      </Title>
      <form onSubmit={handleSubmit(handleAnalyzeData)}>
        <Stack>
          {itemList.map((item, itemIndex) => (
            <Paper key={item.id} p="md" withBorder>
              <Group position="apart">
                <Text weight={600} c="dimmed">
                  {`Item ${itemIndex + 1}`}
                </Text>
                {itemIndex !== 0 && (
                  <ActionIcon
                    size="sm"
                    color="red"
                    onClick={() => removeItem(itemIndex)}
                  >
                    <IconCircleMinus />
                  </ActionIcon>
                )}
              </Group>
              <Flex align="flex-end" wrap="wrap" gap="sm">
                <Controller
                  control={control}
                  name={`items.${itemIndex}.item_general_name`}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      value={value}
                      label="General Name"
                      data={generalNameList}
                      onChange={(value: string) => {
                        onChange(value);
                        handleGeneralNameChange(value, itemIndex);
                      }}
                    />
                  )}
                />
                {item.item_description_list &&
                  item.item_description_list.map(
                    (description, descriptionIndex) => {
                      const descriptionOptions =
                        description.item_description_field_option;

                      return (
                        <Controller
                          key={descriptionIndex}
                          control={control}
                          name={`items.${itemIndex}.item_description_list.${descriptionIndex}.item_description_field_value`}
                          render={({ field: { value, onChange } }) => (
                            <Select
                              w={150}
                              label={description.item_description_label}
                              value={value}
                              onChange={(value) => onChange(value)}
                              data={descriptionOptions}
                              error={
                                errors.items?.[itemIndex]
                                  ?.item_description_list?.[descriptionIndex]
                                  ?.item_description_field_value?.message !==
                                undefined
                                  ? true
                                  : false
                              }
                            />
                          )}
                          rules={{ required: true }}
                        />
                      );
                    }
                  )}
              </Flex>

              {errors.items?.[itemIndex]?.message && (
                <Alert
                  mt="sm"
                  p="xs"
                  variant="filled"
                  color="red"
                  icon={<IconAlertCircle size="1rem" />}
                >
                  {errors.items[itemIndex]?.message}
                </Alert>
              )}
            </Paper>
          ))}
        </Stack>

        <Group mt="xl" position="center">
          <Button
            variant="subtle"
            leftIcon={<IconPlus size={14} />}
            onClick={() => addItem(defaultFormValues)}
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
