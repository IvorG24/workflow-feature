import {
  checkItemDescription,
  getItemUnitOfMeasurementOption,
} from "@/backend/api/get";
import { createItemDescriptionField } from "@/backend/api/post";
import InputAddRemove from "@/components/ItemFormPage/InputAddRemove";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import {
  ItemDescriptionFieldForm,
  ItemDescriptionFieldTableRow,
} from "@/utils/types";
import {
  Button,
  Checkbox,
  Container,
  Divider,
  Flex,
  LoadingOverlay,
  Select,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

type Props = {
  setIsCreating: Dispatch<SetStateAction<boolean>>;
  setItemDescriptionFieldList: Dispatch<
    SetStateAction<ItemDescriptionFieldTableRow[]>
  >;
  setsetItemDescriptionFieldCount: Dispatch<SetStateAction<number>>;
  label: string;
  descriptionId: string;
  isWithUoM: boolean;
};

const CreateItemDescriptionField = ({
  setIsCreating,
  setItemDescriptionFieldList,
  setsetItemDescriptionFieldCount,
  label,
  descriptionId,
  isWithUoM,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();
  const activeTeam = useActiveTeam();

  const [isFetchingOptions, setIsFetchingOptions] = useState(true);
  const [unitOfMeasurementOption, setUnitOfMeasurementOption] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    const fetchItemUnitOfMeasurement = async () => {
      try {
        setIsFetchingOptions(true);
        const unitOfMeasurementOption = await getItemUnitOfMeasurementOption(
          supabaseClient,
          { teamId: activeTeam.team_id }
        );

        unitOfMeasurementOption &&
          setUnitOfMeasurementOption(
            unitOfMeasurementOption.map((uom) => {
              return {
                label: `${uom.item_unit_of_measurement}`,
                value: `${uom.item_unit_of_measurement}`,
              };
            })
          );
      } catch (e) {
        notifications.show({
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
      } finally {
        setIsFetchingOptions(false);
      }
    };
    fetchItemUnitOfMeasurement();
  }, []);

  const { register, formState, handleSubmit, control, getValues } = useForm<{
    descriptions: ItemDescriptionFieldForm[];
  }>({
    defaultValues: {
      descriptions: [
        {
          value: "",
          unitOfMeasurement: "",
          isAvailable: true,
        },
      ],
    },
  });

  const { append, remove, fields } = useFieldArray<{
    descriptions: ItemDescriptionFieldForm[];
  }>({
    control,
    name: "descriptions",
    rules: { minLength: 1, maxLength: 20 },
  });

  const onAddInput = () =>
    append({
      value: "",
      unitOfMeasurement: "",
      isAvailable: true,
    });

  const onSubmit = async (data: {
    descriptions: ItemDescriptionFieldForm[];
  }) => {
    try {
      if (!teamMember) throw new Error("Team member not found");

      const newItem = await createItemDescriptionField(
        supabaseClient,
        data.descriptions.map((descriptionField) => {
          return {
            item_description_field_value: descriptionField.value.trim(),
            item_description_field_is_available: descriptionField.isAvailable,
            item_description_field_item_description_id: descriptionId,
            item_description_field_uom: descriptionField.unitOfMeasurement,
          };
        })
      );
      setItemDescriptionFieldList((prev) => {
        prev.unshift(...newItem);
        return prev;
      });
      setsetItemDescriptionFieldCount((prev) => prev + 1);
      notifications.show({
        message: "Field created.",
        color: "green",
      });
      setIsCreating(false);
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
    return;
  };

  const includesTwoTimes = (arr: string[], element: string) => {
    const count = arr.reduce((acc, currentValue) => {
      if (currentValue === element) {
        return acc + 1;
      }
      return acc;
    }, 0);

    return count === 2;
  };

  return (
    <Container p={0} fluid sx={{ position: "relative" }} mt="xl">
      <LoadingOverlay visible={formState.isSubmitting || isFetchingOptions} />

      <Stack spacing={16}>
        <Title m={0} p={0} order={3}>
          Add {label}
        </Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack>
            {fields.map((_, index) => {
              return (
                <Flex gap="md" key={index}>
                  <TextInput
                    {...register(`descriptions.${index}.value`, {
                      required: {
                        message: "Value is required",
                        value: true,
                      },
                      maxLength: {
                        message: "Value must be shorter than 500 characters",
                        value: 500,
                      },
                      validate: {
                        duplicate: async (value) => {
                          const trimmedValue = value.trim();
                          const data = getValues("descriptions");
                          const values = data.map(
                            (value) =>
                              `${value.value.trim()}${
                                value.unitOfMeasurement ?? ""
                              }`
                          );

                          if (includesTwoTimes(values, trimmedValue))
                            return "Value already exists";

                          const uom = getValues(
                            `descriptions.${index}.unitOfMeasurement`
                          );
                          const isExisting = await checkItemDescription(
                            supabaseClient,
                            {
                              itemDescription: trimmedValue,
                              itemDescriptionUom: uom,
                              descriptionId: descriptionId,
                            }
                          );
                          return isExisting ? "Value already exists" : true;
                        },
                      },
                    })}
                    withAsterisk
                    w="100%"
                    label={`Value #${index + 1}`}
                    error={
                      formState.errors.descriptions !== undefined &&
                      formState.errors.descriptions[index]?.value?.message
                    }
                  />
                  {isWithUoM && (
                    <Controller
                      control={control}
                      name={`descriptions.${index}.unitOfMeasurement`}
                      rules={{
                        required: {
                          message: "Base unit of Measurement is required",
                          value: true,
                        },
                      }}
                      render={({ field: { value, onChange } }) => (
                        <Select
                          value={value as string}
                          data={unitOfMeasurementOption}
                          withAsterisk={isWithUoM}
                          clearable
                          error={
                            formState.errors.descriptions !== undefined &&
                            formState.errors.descriptions[index]
                              ?.unitOfMeasurement?.message
                          }
                          searchable
                          nothingFound="Nothing found. Try a different keyword"
                          label={`Base UoM #${index + 1}`}
                          onChange={onChange}
                        />
                      )}
                    />
                  )}

                  <Checkbox
                    label="Available"
                    {...register(`descriptions.${index}.isAvailable`)}
                    sx={{ input: { cursor: "pointer" } }}
                    mt={32}
                  />
                </Flex>
              );
            })}
          </Stack>
          <InputAddRemove
            canAdd={fields.length < 20}
            onAdd={onAddInput}
            canRemove={fields.length > 1}
            onRemove={() => remove(fields.length - 1)}
          />

          <Button type="submit" miw={100} mt={30} mr={14}>
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            miw={100}
            mt={30}
            mr={14}
            onClick={() => setIsCreating(false)}
          >
            Cancel
          </Button>
        </form>
      </Stack>
      <Divider my="xl" />
    </Container>
  );
};

export default CreateItemDescriptionField;
