import { createItem } from "@/backend/api/post";
import { useActiveTeam } from "@/stores/useTeamStore";
import { Database } from "@/utils/database";
import { ItemForm, ItemWithDescriptionType } from "@/utils/types";
import {
  Button,
  Checkbox,
  Container,
  Divider,
  Flex,
  LoadingOverlay,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Dispatch, SetStateAction } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import InputAddRemove from "../InputAddRemove";

type Props = {
  setIsCreatingItem: Dispatch<SetStateAction<boolean>>;
  setItemList: Dispatch<SetStateAction<ItemWithDescriptionType[]>>;
  setItemCount: Dispatch<SetStateAction<number>>;
};

const CreateItem = ({
  setIsCreatingItem,
  setItemList,
  setItemCount,
}: Props) => {
  const supabaseClient = createBrowserSupabaseClient<Database>();

  const activeTeam = useActiveTeam();

  const { register, getValues, formState, handleSubmit, control } =
    useForm<ItemForm>({
      defaultValues: {
        descriptions: [{ description: "" }],
        generalName: "",
        unit: "",
        isAvailable: true,
      },
    });

  const { append, remove, fields } = useFieldArray<ItemForm>({
    control,
    name: "descriptions",
    rules: { minLength: 1, maxLength: 10 },
  });

  const onAddInput = () => append({ description: "" });

  const onSubmit = async (data: ItemForm) => {
    try {
      const newItem = await createItem(supabaseClient, {
        itemDescription: data.descriptions.map(
          (decription) => decription.description
        ),
        itemData: {
          item_general_name: data.generalName,
          item_is_available: data.isAvailable,
          item_unit: data.unit,
          item_team_id: activeTeam.team_id,
        },
      });
      setItemList((prev) => {
        prev.unshift(newItem);
        return prev;
      });
      setItemCount((prev) => prev + 1);
      notifications.show({
        title: "Success!",
        message: "Item created successfully",
        color: "green",
      });
      setIsCreatingItem(false);
    } catch {
      notifications.show({
        title: "Error!",
        message: "There was an error on creating item",
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
              })}
              withAsterisk
              w="100%"
              label="General Name"
              error={formState.errors.generalName?.message}
            />
            <TextInput
              {...register("unit", {
                required: { message: "Unit is required", value: true },
                maxLength: {
                  message: "Unmit must be shorter than 500 characters",
                  value: 500,
                },
              })}
              withAsterisk
              w="100%"
              label="Unit"
              error={formState.errors.unit?.message}
            />
            {fields.map((field, index) => {
              return (
                <TextInput
                  key={field.id}
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
                  error={
                    formState.errors.descriptions !== undefined &&
                    formState.errors.descriptions[index]?.description?.message
                  }
                />
              );
            })}
            <InputAddRemove
              canAdd={fields.length < 10}
              onAdd={onAddInput}
              canRemove={fields.length > 1}
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
            onClick={() => setIsCreatingItem(false)}
          >
            Cancel
          </Button>
        </form>
      </Stack>
    </Container>
  );
};

export default CreateItem;
