import { checkItemCategory, getItemFormApprover } from "@/backend/api/get";
import { updateItemCategory } from "@/backend/api/update";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { ItemCategoryForm, ItemCategoryWithSigner } from "@/utils/types";
import {
  Button,
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
import { Controller, useForm } from "react-hook-form";

type Props = {
  formId: string;
  setEditItemCategory: Dispatch<SetStateAction<ItemCategoryWithSigner | null>>;
  editItemCategory: ItemCategoryWithSigner;
};

const UpdateItemCategory = ({
  formId,
  setEditItemCategory,
  editItemCategory,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();
  const team = useActiveTeam();

  const [signerOption, setSignerOption] = useState<
    { label: string; value: string }[]
  >([]);
  const [isFetchingOptions, setIsFetchingOptions] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsFetchingOptions(true);
        const signerOption = await getItemFormApprover(supabaseClient, {
          teamId: team.team_id,
        });
        setSignerOption(signerOption);
      } catch (e) {
        notifications.show({
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
      } finally {
        setIsFetchingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  const { formState, handleSubmit, register, control } =
    useForm<ItemCategoryForm>({
      defaultValues: {
        category: editItemCategory.item_category,
        signer:
          editItemCategory.item_category_signer.signer_team_member
            .team_member_id ?? "",
      },
    });

  const onSubmit = async (data: ItemCategoryForm) => {
    try {
      if (!teamMember) throw new Error("Team member not found");
      await updateItemCategory(supabaseClient, {
        formId: formId,
        categoryId: editItemCategory.item_category_id,
        category: data.category.trim(),
        teamMemberId: data.signer,
      });
      notifications.show({
        message: "Item Category created.",
        color: "green",
      });
      setEditItemCategory(null);
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
      <LoadingOverlay visible={formState.isSubmitting || isFetchingOptions} />
      <Stack spacing={16}>
        <Title m={0} p={0} order={3}>
          Update Item Category
        </Title>
        <Divider mb="xl" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={16}>
            <TextInput
              {...register("category", {
                required: { message: "Category is required", value: true },
                minLength: {
                  message: "Category must have atleast 3 characters",
                  value: 3,
                },
                maxLength: {
                  message: "Category must be shorter than 500 characters",
                  value: 500,
                },
                validate: {
                  duplicate: async (value) => {
                    const trimmedValue = value.trim();
                    if (trimmedValue === editItemCategory.item_category) return;
                    const isExisting = await checkItemCategory(supabaseClient, {
                      category: value.trim(),
                    });
                    return isExisting ? "Category already exists" : true;
                  },
                  validCharacters: (value) =>
                    value.match(/^[a-zA-Z0-9 ]*$/)
                      ? true
                      : "Category must not include invalid character/s",
                },
              })}
              withAsterisk
              w="100%"
              label="Category"
              error={formState.errors.category?.message}
            />
            <Controller
              control={control}
              name="signer"
              render={({ field: { value, onChange } }) => (
                <Select
                  value={value as string}
                  onChange={onChange}
                  data={signerOption}
                  withAsterisk
                  error={formState.errors.signer?.message}
                  searchable
                  clearable
                  label="Signer"
                />
              )}
              rules={{
                required: {
                  message: "Signer is required",
                  value: true,
                },
              }}
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
            onClick={() => setEditItemCategory(null)}
          >
            Cancel
          </Button>
        </form>
      </Stack>
    </Container>
  );
};

export default UpdateItemCategory;
