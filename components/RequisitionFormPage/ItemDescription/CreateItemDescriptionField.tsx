import { checkItemDescription } from "@/backend/api/get";
import { createItemDescriptionField } from "@/backend/api/post";
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
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";

type Props = {
  setIsCreating: Dispatch<SetStateAction<boolean>>;
  setItemDescriptionFieldList: Dispatch<
    SetStateAction<ItemDescriptionFieldTableRow[]>
  >;
  setsetItemDescriptionFieldCount: Dispatch<SetStateAction<number>>;
  label: string;
  descriptionId: string;
};

const CreateItemDescriptionField = ({
  setIsCreating,
  setItemDescriptionFieldList,
  setsetItemDescriptionFieldCount,
  label,
  descriptionId,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();

  const { register, formState, handleSubmit } =
    useForm<ItemDescriptionFieldForm>({
      defaultValues: {
        value: "",
        isAvailable: true,
      },
    });

  const onSubmit = async (data: ItemDescriptionFieldForm) => {
    try {
      const newItem = await createItemDescriptionField(supabaseClient, {
        item_description_field_value: data.value,
        item_description_field_is_available: data.isAvailable,
        item_description_field_item_description_id: descriptionId,
      });
      setItemDescriptionFieldList((prev) => {
        prev.unshift(newItem);
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

  return (
    <Container p={0} fluid sx={{ position: "relative" }} mt="xl">
      <LoadingOverlay visible={formState.isSubmitting} />

      <Stack spacing={16}>
        <Title m={0} p={0} order={3}>
          Add {label}
        </Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={16}>
            <TextInput
              {...register("value", {
                required: { message: "Value required", value: true },
                maxLength: {
                  message: "Value must be shorter than 500 characters",
                  value: 500,
                },
                validate: {
                  duplicate: async (value) => {
                    const isExisting = await checkItemDescription(
                      supabaseClient,
                      {
                        itemDescription: value,
                        descriptionId: descriptionId,
                      }
                    );
                    return isExisting ? "Value already exists" : true;
                  },
                },
              })}
              withAsterisk
              w="100%"
              label="Value"
              error={formState.errors.value?.message}
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
