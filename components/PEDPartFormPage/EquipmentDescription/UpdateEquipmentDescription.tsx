import {
  checkSerialNumber,
  getEquipmentBrandAndModelOption,
} from "@/backend/api/get";
import { updateEquipmentDescription } from "@/backend/api/update";

import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import {
  EquipmentDescriptionForm,
  EquipmentDescriptionType,
  EquipmentWithCategoryType,
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
import { Controller, useForm } from "react-hook-form";

type Props = {
  selectedEquipment: EquipmentWithCategoryType;
  setEquipmentDescriptionList: Dispatch<
    SetStateAction<EquipmentDescriptionType[]>
  >;
  setEditEquipmentDescription: Dispatch<
    SetStateAction<EquipmentDescriptionType | null>
  >;
  editEquipmentDescription: EquipmentDescriptionType;
};

const UpdateEquipmentDescription = ({
  selectedEquipment,
  setEquipmentDescriptionList,
  setEditEquipmentDescription,
  editEquipmentDescription,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const activeTeam = useActiveTeam();
  const teamMember = useUserTeamMember();

  const [brandOption, setBrandOption] = useState<
    { label: string; value: string }[]
  >([]);
  const [modelOption, setModelOption] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    const fetchBrandAndModelOption = async () => {
      if (!teamMember?.team_member_team_id) return;
      try {
        const { brandList, modelList } = await getEquipmentBrandAndModelOption(
          supabaseClient,
          {
            teamId: teamMember.team_member_team_id,
          }
        );
        brandList &&
          setBrandOption(
            brandList.map((brand) => {
              return {
                label: `${brand.equipment_brand}`,
                value: `${brand.equipment_brand_id}`,
              };
            })
          );
        modelList &&
          setModelOption(
            modelList.map((model) => {
              return {
                label: `${model.equipment_model}`,
                value: `${model.equipment_model_id}`,
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
    fetchBrandAndModelOption();
  }, [teamMember?.team_member_team_id]);

  const { register, formState, handleSubmit, control } =
    useForm<EquipmentDescriptionForm>({
      defaultValues: {
        propertyNumber: `${selectedEquipment.equipment_name_shorthand}-${editEquipmentDescription.equipment_description_property_number}`,
        serialNumber:
          editEquipmentDescription.equipment_description_serial_number,
        brand: editEquipmentDescription.equipment_description_brand_id,
        model: editEquipmentDescription.equipment_description_model_id,
        isAvailable:
          editEquipmentDescription.equipment_description_is_available,
      },
    });

  const onSubmit = async (data: EquipmentDescriptionForm) => {
    try {
      const newEquipmentDescription: EquipmentDescriptionType =
        await updateEquipmentDescription(supabaseClient, {
          equipmentDescriptionData: {
            equipment_description_id:
              editEquipmentDescription.equipment_description_id,
            equipment_description_serial_number:
              data.serialNumber.toUpperCase(),
            equipment_description_brand_id: data.brand,
            equipment_description_model_id: data.model,
            equipment_description_equipment_id: selectedEquipment.equipment_id,
            equipment_description_is_available: data.isAvailable,
          },
          brand: brandOption.find((brand) => brand.value === data.brand)
            ?.label as string,
          model: modelOption.find((model) => model.value === data.model)
            ?.label as string,
        });

      setEquipmentDescriptionList((prev) => {
        return prev.map((equipment) => {
          if (
            equipment.equipment_description_id ===
            editEquipmentDescription.equipment_description_id
          ) {
            return newEquipmentDescription;
          } else {
            return equipment;
          }
        });
      });
      notifications.show({
        message: "Equipment Description updated.",
        color: "green",
      });
      setEditEquipmentDescription(null);
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
          Update Equipment Description
        </Title>
        <Divider mb="xl" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={16}>
            <TextInput
              {...register("propertyNumber", {
                required: {
                  message: "Property number is required",
                  value: true,
                },
              })}
              withAsterisk
              w="100%"
              label="Property Number"
              error={formState.errors.propertyNumber?.message}
              sx={{
                input: {
                  textTransform: "uppercase",
                },
              }}
              disabled
            />
            <Controller
              control={control}
              name="brand"
              render={({ field: { value, onChange } }) => (
                <Select
                  value={value}
                  onChange={onChange}
                  data={
                    brandOption.length
                      ? brandOption
                      : [
                          {
                            label:
                              editEquipmentDescription.equipment_description_brand,
                            value:
                              editEquipmentDescription.equipment_description_brand_id,
                          },
                        ]
                  }
                  withAsterisk
                  error={formState.errors.brand?.message}
                  searchable
                  clearable
                  label="Brand"
                />
              )}
              rules={{
                required: {
                  message: "Brand is required",
                  value: true,
                },
              }}
            />
            <Controller
              control={control}
              name="model"
              render={({ field: { value, onChange } }) => (
                <Select
                  value={value}
                  onChange={onChange}
                  data={
                    modelOption.length
                      ? modelOption
                      : [
                          {
                            label:
                              editEquipmentDescription.equipment_description_model,
                            value:
                              editEquipmentDescription.equipment_description_model_id,
                          },
                        ]
                  }
                  withAsterisk
                  error={formState.errors.model?.message}
                  searchable
                  clearable
                  label="Model"
                />
              )}
              rules={{
                required: {
                  message: "Model is required",
                  value: true,
                },
              }}
            />
            <TextInput
              {...register("serialNumber", {
                required: {
                  message: "Serial number is required",
                  value: true,
                },
              })}
              withAsterisk
              w="100%"
              label="Serial Number"
              error={formState.errors.serialNumber?.message}
              sx={{
                input: {
                  textTransform: "uppercase",
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
            onClick={() => setEditEquipmentDescription(null)}
          >
            Cancel
          </Button>
        </form>
      </Stack>
    </Container>
  );
};

export default UpdateEquipmentDescription;
