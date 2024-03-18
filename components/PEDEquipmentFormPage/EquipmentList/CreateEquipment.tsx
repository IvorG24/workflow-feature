import {
  checkEquipmentName,
  getEquipmentCategoryOption,
} from "@/backend/api/get";
import { createEquipment } from "@/backend/api/post";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
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
  setIsCreatingEquipment: Dispatch<SetStateAction<boolean>>;
  setEquipmentList: Dispatch<SetStateAction<EquipmentWithCategoryType[]>>;
  setEquipmentCount: Dispatch<SetStateAction<number>>;
};

const CreateEquipment = ({
  setIsCreatingEquipment,
  setEquipmentList,
  setEquipmentCount,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();

  const activeTeam = useActiveTeam();
  const teamMember = useUserTeamMember();

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
        name: "",
        category: "",
        shorthand: "",
        isAvailable: true,
      },
    }
  );

  const onSubmit = async (data: EquipmentForm) => {
    try {
      const newEquipment = await createEquipment(supabaseClient, {
        equipmentData: {
          equipment_name: data.name.toUpperCase().trim(),
          equipment_is_available: data.isAvailable,
          equipment_equipment_category_id: data.category,
          equipment_team_id: activeTeam.team_id,
          equipment_encoder_team_member_id: teamMember?.team_member_id,
          equipment_name_shorthand: data.shorthand.toUpperCase().trim(),
        },
        category: categoryOption.find((value) => value.value === data.category)
          ?.label as string,
      });
      setEquipmentList((prev) => {
        prev.unshift(newEquipment);
        return prev;
      });
      setEquipmentCount((prev) => prev + 1);
      notifications.show({
        message: "Equipment created.",
        color: "green",
      });
      setIsCreatingEquipment(false);
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
          Add Equipment
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
                    const isExisting = await checkEquipmentName(
                      supabaseClient,
                      {
                        equipmentName: value.toUpperCase().trim(),
                        teamId: activeTeam.team_id,
                      }
                    );
                    return isExisting ? "Equipment already exists" : true;
                  },
                  validCharacters: (value) =>
                    value.match(/^[a-zA-Z0-9 ]*$/)
                      ? true
                      : "Name must not include invalid character/s",
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
              error={formState.errors.name?.message}
            />
            <TextInput
              {...register("shorthand", {
                required: { message: "Shorthand is required", value: true },
                maxLength: {
                  message: "Shorthand must be shorter than 10 characters",
                  value: 10,
                },
                validate: {
                  validCharacters: (value) =>
                    value.match(/^[a-zA-Z0-9 ]*$/)
                      ? true
                      : "Shorthand must not include invalid character/s",
                },
              })}
              withAsterisk
              w="100%"
              label="Shorthand"
              sx={{
                input: {
                  textTransform: "uppercase",
                },
              }}
              error={formState.errors.shorthand?.message}
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
            onClick={() => setIsCreatingEquipment(false)}
          >
            Cancel
          </Button>
        </form>
      </Stack>
    </Container>
  );
};

export default CreateEquipment;
