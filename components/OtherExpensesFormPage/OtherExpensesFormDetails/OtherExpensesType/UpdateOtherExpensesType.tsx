import { useActiveTeam } from "@/stores/useTeamStore";
import { Database } from "@/utils/database";
import { OtherExpensesTypeWithCategoryType } from "@/utils/types";

import {
  checkOtherExpenesesTypeTable,
  getOtherExpensesCategoryOptions,
} from "@/backend/api/get";
import { updateOtherExpensesType } from "@/backend/api/update";
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
import { Controller, useForm } from "react-hook-form";
import { TypeForm } from "./OtherExpensesType";

type Props = {
  setTypeList: Dispatch<SetStateAction<OtherExpensesTypeWithCategoryType[]>>;
  setEditType: Dispatch<
    SetStateAction<OtherExpensesTypeWithCategoryType | null>
  >;
  editType: OtherExpensesTypeWithCategoryType;
};

const UpdateOtherExpensesType = ({
  setTypeList,
  setEditType,
  editType,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const team = useActiveTeam();

  const [categoryOption, setCategoryOption] = useState<
    { label: string; value: string }[]
  >([
    {
      label: editType.other_expenses_type,
      value: `${editType.other_expenses_type_category_id}`,
    },
  ]);
  const [isFetchingOptions, setIsFetchingOptions] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsFetchingOptions(true);
        const data = await getOtherExpensesCategoryOptions(supabaseClient, {
          teamId: team.team_id,
        });
        setCategoryOption(
          data.map((category) => {
            return {
              label: category.other_expenses_category,
              value: category.other_expenses_category_id,
            };
          })
        );
        setValue("category", `${editType.other_expenses_type_category_id}`);
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

  const { register, formState, handleSubmit, getValues, control, setValue } =
    useForm<TypeForm>({
      defaultValues: {
        type: editType.other_expenses_type,
        isAvailable: editType.other_expenses_type_is_available,
        category: editType.other_expenses_type_category_id as string,
      },
    });

  const onSubmit = async (data: TypeForm) => {
    try {
      const newType = await updateOtherExpensesType(supabaseClient, {
        updateData: {
          other_expenses_type: data.type.toUpperCase().trim(),
          other_expenses_type_category_id: data.category,
          other_expenses_type_is_available: data.isAvailable,
        },
        otherExpensesTypeId: editType.other_expenses_type_id,
      });

      const categoryLabel = categoryOption.find(
        (value) => value.value === data.category
      )?.label;

      setTypeList((prev) => {
        return prev.map((type) => {
          if (type.other_expenses_type_id === editType.other_expenses_type_id) {
            return {
              ...newType,
              other_expenses_category: `${categoryLabel}`,
            };
          } else {
            return type;
          }
        });
      });
      notifications.show({
        message: "Type updated.",
        color: "green",
      });
      setEditType(null);
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
          Update Type
        </Title>
        <Divider mb="xl" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={16}>
            <TextInput
              {...register("type", {
                required: {
                  message: `Type is required`,
                  value: true,
                },
                validate: {
                  duplicate: async (value) => {
                    const category = getValues("category");
                    if (!category) return true;
                    const isExisting = await checkOtherExpenesesTypeTable(
                      supabaseClient,
                      {
                        value: value.toUpperCase(),
                        categoryId: category,
                      }
                    );
                    return isExisting ? "Type already exists" : true;
                  },
                },
              })}
              withAsterisk
              w="100%"
              label={"Type"}
              error={formState.errors.type?.message}
              sx={{
                input: {
                  textTransform: "uppercase",
                },
              }}
            />

            <Controller
              control={control}
              name="category"
              render={({ field: { value, onChange } }) => (
                <Select
                  value={value}
                  onChange={onChange}
                  data={categoryOption}
                  withAsterisk
                  error={formState.errors.category?.message}
                  searchable
                  clearable
                  label="Category"
                />
              )}
              rules={{
                required: {
                  message: "Category is required",
                  value: true,
                },
              }}
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
            onClick={() => setEditType(null)}
          >
            Cancel
          </Button>
        </form>
      </Stack>
    </Container>
  );
};

export default UpdateOtherExpensesType;
