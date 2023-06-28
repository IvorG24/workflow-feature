import { checkItemName } from "@/backend/api/get";
import { createItem } from "@/backend/api/post";
import { useActiveTeam } from "@/stores/useTeamStore";
import { ITEM_PURPOSE_CHOICES } from "@/utils/constant";
import { Database } from "@/utils/database";
import { ItemForm, ItemWithDescriptionType } from "@/utils/types";
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
import { useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import wordExists from "word-exists";
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
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();
  const formId = router.query.formId as string;

  const activeTeam = useActiveTeam();

  const { register, getValues, formState, handleSubmit, control } =
    useForm<ItemForm>({
      defaultValues: {
        descriptions: [{ description: "" }],
        generalName: "",
        unit: "",
        purpose: "",
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
        formId: formId,
      });
      setItemList((prev) => {
        prev.unshift(newItem);
        return prev;
      });
      setItemCount((prev) => prev + 1);
      notifications.show({
        message: "Item created.",
        color: "green",
      });
      setIsCreatingItem(false);
    } catch {
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
                    const isExisting = await checkItemName(supabaseClient, {
                      itemName: value,
                      teamId: activeTeam.team_id,
                    });
                    return isExisting ? "Item already exists" : true;
                  },
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
                  message: "Unit must be shorter than 500 characters",
                  value: 500,
                },
                validate: {
                  isWordExists: (value) =>
                    wordExists(value) ? true : "Not a valid word",
                },
              })}
              withAsterisk
              w="100%"
              label="Unit"
              error={formState.errors.unit?.message}
            />
            <Controller
              control={control}
              name="purpose"
              render={({ field: { value, onChange } }) => (
                <Select
                  value={value as string}
                  onChange={onChange}
                  data={ITEM_PURPOSE_CHOICES}
                  withAsterisk
                  error={formState.errors.purpose?.message}
                  searchable
                  clearable
                  label="Purpose"
                />
              )}
              rules={{
                required: {
                  value: true,
                  message: "Purpose is required",
                },
              }}
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
