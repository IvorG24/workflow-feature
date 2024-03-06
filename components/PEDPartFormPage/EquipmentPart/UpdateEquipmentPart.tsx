import {
  checkPEDPart,
  getEquipmentBrandAndModelOption,
  getEquipmentNameOption,
  getEquipmentUOMAndCategoryOption,
} from "@/backend/api/get";
import { updateEquipmentPart } from "@/backend/api/update";
import { useUserTeamMember } from "@/stores/useUserStore";

import { Database } from "@/utils/database";
import {
  EquipmentPartForm,
  EquipmentPartType,
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
  setEquipmentPartList: Dispatch<SetStateAction<EquipmentPartType[]>>;
  setEditEquipmentPart: Dispatch<SetStateAction<EquipmentPartType | null>>;
  editEquipmentPart: EquipmentPartType;
};

const UpdateEquipmentPart = ({
  selectedEquipment,
  setEquipmentPartList,
  setEditEquipmentPart,
  editEquipmentPart,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();

  const [isFetchingOptions, setIsFetchingOptions] = useState(true);

  const [nameOption, setNameOption] = useState<
    { label: string; value: string }[]
  >([]);
  const [brandOption, setBrandOption] = useState<
    { label: string; value: string }[]
  >([]);
  const [modelOption, setModelOption] = useState<
    { label: string; value: string }[]
  >([]);
  const [uomOption, setUomOption] = useState<
    { label: string; value: string }[]
  >([]);
  const [categoryOption, setCategoryOption] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        if (!teamMember?.team_member_team_id) return;
        setIsFetchingOptions(true);
        const allNameList = [];
        let index = 0;
        while (1) {
          const { nameList } = await getEquipmentNameOption(supabaseClient, {
            index,
            teamId: teamMember.team_member_team_id,
          });
          if (nameList.length === 0) break;
          allNameList.push(...nameList);
          if (nameList.length < 1000) break;
          index += 1000;
        }
        const { brandList, modelList } = await getEquipmentBrandAndModelOption(
          supabaseClient,
          { teamId: teamMember.team_member_team_id }
        );
        const { uomList, categoryList } =
          await getEquipmentUOMAndCategoryOption(supabaseClient, {
            teamId: teamMember.team_member_team_id,
          });
        allNameList &&
          setNameOption(
            allNameList.map((name) => {
              return {
                label: `${name.equipment_general_name}`,
                value: `${name.equipment_general_name_id}`,
              };
            })
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
        uomList &&
          setUomOption(
            uomList.map((uom) => {
              return {
                label: `${uom.equipment_unit_of_measurement}`,
                value: `${uom.equipment_unit_of_measurement_id}`,
              };
            })
          );
        categoryList &&
          setCategoryOption(
            categoryList.map((category) => {
              return {
                label: `${category.equipment_component_category}`,
                value: `${category.equipment_component_category_id}`,
              };
            })
          );
      } catch {
        notifications.show({
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
      } finally {
        setIsFetchingOptions(false);
      }
    };
    fetchOptions();
  }, [teamMember?.team_member_team_id]);

  const { register, formState, handleSubmit, control } =
    useForm<EquipmentPartForm>({
      defaultValues: {
        name: editEquipmentPart.equipment_part_general_name_id,
        partNumber: editEquipmentPart.equipment_part_number,
        brand: editEquipmentPart.equipment_part_brand_id,
        model: editEquipmentPart.equipment_part_model_id,
        uom: editEquipmentPart.equipment_part_unit_of_measurement_id,
        category: editEquipmentPart.equipment_part_component_category_id,
        isAvailable: editEquipmentPart.equipment_part_is_available,
      },
    });

  const onSubmit = async (data: EquipmentPartForm) => {
    try {
      const params = {
        equipment_part_id: editEquipmentPart.equipment_part_id,
        equipment_part_general_name_id: data.name,
        equipment_part_number: data.partNumber
          .trim()
          .toUpperCase()
          .replace(/[^a-zA-Z0-9]/g, ""),
        equipment_part_brand_id: data.brand,
        equipment_part_model_id: data.model,
        equipment_part_unit_of_measurement_id: data.uom,
        equipment_part_component_category_id: data.category,
        equipment_part_equipment_id: selectedEquipment.equipment_id,
        equipment_part_is_available: data.isAvailable,
      };

      if (
        await checkPEDPart(supabaseClient, {
          equipmentPartData: params,
        })
      ) {
        notifications.show({
          message: "Equipment Part already exists.",
          color: "orange",
        });
        return;
      }

      const newEquipmentPart: EquipmentPartType = await updateEquipmentPart(
        supabaseClient,
        {
          equipmentPartData: params,
          name: nameOption.find((name) => name.value === data.name)
            ?.label as string,
          brand: brandOption.find((brand) => brand.value === data.brand)
            ?.label as string,
          model: modelOption.find((model) => model.value === data.model)
            ?.label as string,
          uom: uomOption.find((uom) => uom.value === data.uom)?.label as string,
          category: categoryOption.find(
            (category) => category.value === data.category
          )?.label as string,
        }
      );

      setEquipmentPartList((prev) => {
        return prev.map((equipment) => {
          if (
            equipment.equipment_part_id === editEquipmentPart.equipment_part_id
          ) {
            return newEquipmentPart;
          } else {
            return equipment;
          }
        });
      });
      notifications.show({
        message: "Equipment Part updated.",
        color: "green",
      });
      setEditEquipmentPart(null);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  return (
    <Container p={0} fluid sx={{ position: "relative" }}>
      <LoadingOverlay visible={formState.isSubmitting || isFetchingOptions} />
      <Stack spacing={16}>
        <Title m={0} p={0} order={3}>
          Update Equipment Part
        </Title>
        <Divider mb="xl" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={16}>
            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange } }) => (
                <Select
                  value={value}
                  onChange={onChange}
                  data={
                    nameOption.length
                      ? nameOption
                      : [
                          {
                            label:
                              editEquipmentPart.equipment_part_general_name,
                            value:
                              editEquipmentPart.equipment_part_general_name_id,
                          },
                        ]
                  }
                  withAsterisk
                  error={formState.errors.name?.message}
                  searchable
                  clearable
                  label="Name"
                  limit={1000}
                />
              )}
              rules={{
                required: {
                  message: "Name is required",
                  value: true,
                },
              }}
            />
            <TextInput
              {...register("partNumber", {
                required: {
                  message: "Part Number is required",
                  value: true,
                },
              })}
              withAsterisk
              w="100%"
              label="Part Number"
              error={formState.errors.partNumber?.message}
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
                            label: editEquipmentPart.equipment_part_brand,
                            value: editEquipmentPart.equipment_part_brand_id,
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
                            label: editEquipmentPart.equipment_part_model,
                            value: editEquipmentPart.equipment_part_model_id,
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
            <Controller
              control={control}
              name="uom"
              render={({ field: { value, onChange } }) => (
                <Select
                  value={value}
                  onChange={onChange}
                  data={
                    uomOption.length
                      ? uomOption
                      : [
                          {
                            label:
                              editEquipmentPart.equipment_part_unit_of_measurement,
                            value:
                              editEquipmentPart.equipment_part_unit_of_measurement_id,
                          },
                        ]
                  }
                  withAsterisk
                  error={formState.errors.uom?.message}
                  searchable
                  clearable
                  label="Unit of Measurement"
                />
              )}
              rules={{
                required: {
                  message: "Unit of measurement is required",
                  value: true,
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
                  data={
                    categoryOption.length
                      ? categoryOption
                      : [
                          {
                            label:
                              editEquipmentPart.equipment_part_component_category,
                            value:
                              editEquipmentPart.equipment_part_component_category_id,
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
            onClick={() => setEditEquipmentPart(null)}
          >
            Cancel
          </Button>
        </form>
      </Stack>
    </Container>
  );
};

export default UpdateEquipmentPart;
