import {
  checkEquipmentName,
  getEquipmentCategoryOption,
} from "@/backend/api/get";
import { updateEquipment } from "@/backend/api/update";

import { useActiveTeam } from "@/stores/useTeamStore";
import { Database } from "@/utils/database";
import { EquipmentForm, EquipmentWithCategoryType } from "@/utils/types";
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

type Props = {
  setEquipmentList: Dispatch<SetStateAction<EquipmentWithCategoryType[]>>;
  setEditEquipment: Dispatch<SetStateAction<EquipmentWithCategoryType | null>>;
  editEquipment: EquipmentWithCategoryType;
};

const UpdateEquipment = ({
  setEquipmentList,
  setEditEquipment,
  editEquipment,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const activeTeam = useActiveTeam();

  const [categoryOption, setCategoryOption] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    const fetchDivisionOption = async () => {
      try {
        const option = await getEquipmentCategoryOption(supabaseClient, {
          teamId: `${activeTeam.team_id}`,
        });

        option &&
          setCategoryOption(
            option.map((category) => {
              return {
                label: `${category.equipment_category}`,
                value: `${category.equipment_category_id}`,
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

  const { register, formState, handleSubmit, control } = useForm<EquipmentForm>(
    {
      defaultValues: {
        name: editEquipment.equipment_name,
        category: editEquipment.equipment_equipment_category_id,
        isAvailable: editEquipment.equipment_is_available,
      },
    }
  );

  const onSubmit = async (data: EquipmentForm) => {
    try {
      const newEquipment: EquipmentWithCategoryType = await updateEquipment(
        supabaseClient,
        {
          equipmentData: {
            equipment_name: data.name.toUpperCase(),
            equipment_is_available: data.isAvailable,
            equipment_equipment_category_id: data.category,
            equipment_team_id: activeTeam.team_id,
            equipment_id: editEquipment.equipment_id,
          },
          category: categoryOption.find(
            (value) => value.value === data.category
          )?.label as string,
        }
      );

      setEquipmentList((prev) => {
        return prev.map((equipment) => {
          if (equipment.equipment_id === editEquipment.equipment_id) {
            return newEquipment;
          } else {
            return equipment;
          }
        });
      });
      notifications.show({
        message: "Equipment updated.",
        color: "green",
      });
      setEditEquipment(null);
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
          Update Equipment
        </Title>
        <Divider mb="xl" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={16}>
            <TextInput
              {...register("name", {
                required: { message: "Name is required", value: true },
                minLength: {
                  message: "Name must have atleast 3 characters",
                  value: 3,
                },
                maxLength: {
                  message: "Name must be shorter than 500 characters",
                  value: 500,
                },
                validate: {
                  duplicate: async (value) => {
                    if (value === editEquipment.equipment_name) return true;

                    const isExisting = await checkEquipmentName(
                      supabaseClient,
                      {
                        equipmentName: value.toUpperCase(),
                        teamId: activeTeam.team_id,
                      }
                    );
                    return isExisting ? "Equipment already exists" : true;
                  },
                  validCharacters: (value) =>
                    value.match(/^[a-zA-Z ]*$/)
                      ? true
                      : "Name must not include invalid character/s",
                },
              })}
              withAsterisk
              w="100%"
              label="Name"
              sx={{
                input: {
                  textTransform: "uppercase",
                },
              }}
              error={formState.errors.name?.message}
            />
            <Controller
              control={control}
              name="category"
              render={({ field: { value, onChange } }) => (
                <Select
                  value={value as string}
                  onChange={onChange}
                  data={
                    categoryOption.length
                      ? categoryOption
                      : [
                          {
                            label: editEquipment.equipment_category,
                            value:
                              editEquipment.equipment_equipment_category_id,
                          },
                        ]
                  }
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
            onClick={() => setEditEquipment(null)}
          >
            Cancel
          </Button>
        </form>
      </Stack>
    </Container>
  );
};

export default UpdateEquipment;
