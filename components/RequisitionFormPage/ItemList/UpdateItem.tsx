import { checkItemName, getItemDivisionOption } from "@/backend/api/get";
import { updateItem } from "@/backend/api/post";
import { useActiveTeam } from "@/stores/useTeamStore";
import { GL_ACCOUNT_CHOICES, ITEM_UNIT_CHOICES } from "@/utils/constant";
import { Database } from "@/utils/database";
import {
  ItemDescriptionTableUpdate,
  ItemForm,
  ItemWithDescriptionType,
} from "@/utils/types";
import {
  ActionIcon,
  Button,
  Checkbox,
  Container,
  Divider,
  Flex,
  LoadingOverlay,
  MultiSelect,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import InputAddRemove from "../InputAddRemove";

type Props = {
  setItemList: Dispatch<SetStateAction<ItemWithDescriptionType[]>>;
  setEditItem: Dispatch<SetStateAction<ItemWithDescriptionType | null>>;
  editItem: ItemWithDescriptionType;
};

const UpdateItem = ({ setItemList, setEditItem, editItem }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();
  const formId = router.query.formId as string;
  const [toRemoveDescription, setToRemoveDescription] = useState<
    { descriptionId: string; fieldId: string }[]
  >([]);

  const activeTeam = useActiveTeam();

  const [divisionIdOption, setDivisionIdOption] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    const fetchDivisionOption = async () => {
      try {
        const option = await getItemDivisionOption(supabaseClient);

        option &&
          setDivisionIdOption(
            option.map((divisionId) => {
              return {
                label: `${divisionId.csi_code_division_description}`,
                value: `${divisionId.csi_code_division_id}`,
              };
            })
          );
      } catch {
        notifications.show({
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
      }
    };
    fetchDivisionOption();
  }, []);

  const { register, getValues, formState, handleSubmit, control } =
    useForm<ItemForm>({
      defaultValues: {
        descriptions: editItem.item_description.map((description) => {
          return {
            description: description.item_description_label,
            withUoM: description.item_description_is_with_uom,
            descriptionId: description.item_description_id,
            fieldId: description.item_description_field_id,
          };
        }),
        generalName: editItem.item_general_name,
        unit: editItem.item_unit,
        isAvailable: true,
        glAccount: editItem.item_gl_account,
        division: editItem.item_division_id_list,
      },
    });

  const { append, remove, fields } = useFieldArray<ItemForm>({
    control,
    name: "descriptions",
    rules: { minLength: 1, maxLength: 20 },
  });

  const onAddInput = () => append({ description: "", withUoM: false });

  const onSubmit = async (data: ItemForm) => {
    try {
      const toUpdate: ItemDescriptionTableUpdate[] = [];
      const toAdd: ItemForm["descriptions"] = [];

      data.descriptions.forEach((description) => {
        if (description.descriptionId) {
          toUpdate.push({
            item_description_id: description.descriptionId,
            item_description_is_with_uom: description.withUoM,
            item_description_label: description.description.toUpperCase(),
            item_description_field_id: description.fieldId,
          });
        } else {
          toAdd.push({
            description: description.description.toUpperCase(),
            withUoM: description.withUoM,
          });
        }
      });

      const newItem = await updateItem(supabaseClient, {
        toAdd,
        toUpdate,
        toRemove: toRemoveDescription,
        itemData: {
          item_id: editItem.item_id,
          item_general_name: data.generalName.toUpperCase(),
          item_is_available: data.isAvailable,
          item_unit: data.unit,
          item_gl_account: data.glAccount,
          item_team_id: activeTeam.team_id,
          item_division_id_list: data.division.map((id) => `'${id}'`),
        },
        formId: formId,
      });

      setItemList((prev) => {
        return prev.map((item) => {
          if (item.item_id === editItem.item_id) {
            return newItem;
          } else {
            return item;
          }
        });
      });
      notifications.show({
        message: "Item updated.",
        color: "green",
      });
      setEditItem(null);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
    return;
  };

  return (
    <Container p={0} fluid sx={{ position: "relative" }}>
      <LoadingOverlay visible={formState.isSubmitting} />
      <Stack spacing={16}>
        <Title m={0} p={0} order={3}>
          Add Item
        </Title>
        <Divider mb="xl" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={16}>
            <TextInput
              {...register("generalName", {
                required: { message: "General Name is required", value: true },
                minLength: {
                  message: "General Name must have atleast 3 characters",
                  value: 3,
                },
                maxLength: {
                  message: "General Name must be shorter than 500 characters",
                  value: 500,
                },
                validate: {
                  duplicate: async (value) => {
                    if (value === editItem.item_general_name) return true;

                    const isExisting = await checkItemName(supabaseClient, {
                      itemName: value.toUpperCase(),
                      teamId: activeTeam.team_id,
                    });
                    return isExisting ? "Item already exists" : true;
                  },
                  validCharacters: (value) =>
                    value.match(/^[a-zA-Z ]*$/)
                      ? true
                      : "General name must not include invalid character/s",
                },
              })}
              withAsterisk
              w="100%"
              label="General Name"
              sx={{
                input: {
                  textTransform: "uppercase",
                },
              }}
              error={formState.errors.generalName?.message}
            />
            <Controller
              control={control}
              name="unit"
              render={({ field: { value, onChange } }) => (
                <Select
                  value={value as string}
                  onChange={onChange}
                  data={ITEM_UNIT_CHOICES}
                  withAsterisk
                  error={formState.errors.unit?.message}
                  searchable
                  clearable
                  label="Base Unit of Measurement"
                />
              )}
              rules={{
                required: {
                  message: "Base Unit of Measurement is required",
                  value: true,
                },
              }}
            />
            <Controller
              control={control}
              name="glAccount"
              render={({ field: { value, onChange } }) => (
                <Select
                  value={value as string}
                  onChange={onChange}
                  data={GL_ACCOUNT_CHOICES}
                  withAsterisk
                  error={formState.errors.glAccount?.message}
                  searchable
                  clearable
                  label="GL Account"
                />
              )}
              rules={{
                required: {
                  message: "GL Account is required",
                  value: true,
                },
              }}
            />
            <Controller
              control={control}
              name="division"
              render={({ field: { value, onChange } }) => (
                <MultiSelect
                  value={value as string[]}
                  onChange={onChange}
                  data={divisionIdOption}
                  withAsterisk
                  error={formState.errors.division?.message}
                  searchable
                  clearable
                  label="Division"
                />
              )}
              rules={{
                required: {
                  message: "Division is required",
                  value: true,
                },
              }}
            />
            {fields.map((field, index) => {
              return (
                <Flex key={field.id} gap="xs">
                  <TextInput
                    withAsterisk
                    label={`Description #${index + 1}`}
                    {...register(`descriptions.${index}.description`, {
                      required: `Description #${index + 1} is required`,
                      minLength: {
                        message: "Description must be at least 3 characters",
                        value: 3,
                      },
                      validate: {
                        isDuplicate: (value) => {
                          let count = 0;
                          getValues("descriptions").map(
                            ({ description }: { description: string }) => {
                              if (description === value) {
                                count += 1;
                              }
                            }
                          );
                          if (count > 1) {
                            return "Invalid Duplicate Description";
                          } else {
                            return true;
                          }
                        },
                      },
                    })}
                    sx={{
                      input: {
                        textTransform: "uppercase",
                      },
                      flex: 1,
                    }}
                    error={
                      formState.errors.descriptions !== undefined &&
                      formState.errors.descriptions[index]?.description?.message
                    }
                  />
                  <Controller
                    control={control}
                    name={`descriptions.${index}.withUoM`}
                    render={({ field: { value, onChange } }) => (
                      <Checkbox
                        sx={{
                          input: {
                            cursor: "pointer",
                          },
                        }}
                        mt={32}
                        label={"with UoM?"}
                        checked={value}
                        onChange={onChange}
                      />
                    )}
                  />

                  {fields.length > 1 && (
                    <ActionIcon
                      onClick={() => {
                        remove(index);
                        if (field.descriptionId && field.fieldId) {
                          setToRemoveDescription((prev) => [
                            ...prev,
                            {
                              descriptionId: `${field.descriptionId}`,
                              fieldId: `${field.fieldId}`,
                            },
                          ]);
                        }
                      }}
                      size="md"
                      radius={100}
                      variant="light"
                      color="blue"
                      mt={28}
                      ml={10}
                    >
                      <Text size="lg" fw={700}>
                        -
                      </Text>
                    </ActionIcon>
                  )}
                </Flex>
              );
            })}
            <InputAddRemove
              canAdd={fields.length < 20}
              onAdd={onAddInput}
              canRemove={false}
              onRemove={() => remove(fields.length - 1)}
            />
            <Checkbox
              label="Available"
              {...register("isAvailable")}
              sx={{ input: { cursor: "pointer" } }}
            />
          </Flex>

          <Button type="submit" miw={100} mt={30} mr={14}>
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            miw={100}
            mt={30}
            mr={14}
            onClick={() => setEditItem(null)}
          >
            Cancel
          </Button>
        </form>
      </Stack>
    </Container>
  );
};

export default UpdateItem;
