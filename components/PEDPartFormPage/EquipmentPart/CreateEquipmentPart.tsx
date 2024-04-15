import {
  checkPEDPart,
  getEquipmentBrandAndModelOption,
  getEquipmentNameOption,
  getEquipmentUOMAndCategoryOption,
} from "@/backend/api/get";
import { createEquipmentPart } from "@/backend/api/post";
import { useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { EquipmentPartForm, EquipmentWithCategoryType } from "@/utils/types";
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
  setIsCreatingEquipmentPart: Dispatch<SetStateAction<boolean>>;
};

const CreateEquipmentPart = ({
  selectedEquipment,
  setIsCreatingEquipmentPart,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const [isFetchingOptions, setIsFetchingOptions] = useState(true);

  const teamMember = useUserTeamMember();
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
      if (!teamMember?.team_member_team_id) return;
      try {
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
          {
            teamId: teamMember.team_member_team_id,
          }
        );
        const { uomList, categoryList } =
          await getEquipmentUOMAndCategoryOption(supabaseClient, {
            teamId: teamMember.team_member_team_id,
          });
        brandList &&
          setBrandOption(
            brandList.map((brand) => {
              return {
                label: `${brand.equipment_brand}`,
                value: `${brand.equipment_brand_id}`,
              };
            })
          );
        allNameList &&
          setNameOption(
            allNameList.map((name) => {
              return {
                label: `${name.equipment_general_name}`,
                value: `${name.equipment_general_name_id}`,
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
        name: "",
        partNumber: "",
        brand: "",
        model: "",
        uom: "",
        category: "",
        isAvailable: true,
      },
    });

  const onSubmit = async (data: EquipmentPartForm) => {
    try {
      const params = {
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
        equipment_part_encoder_team_member_id: teamMember?.team_member_id,
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

      await createEquipmentPart(supabaseClient, {
        equipmentPartData: {
          ...params,
          equipment_part_number: data.partNumber.trim().toUpperCase(),
        },
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
      });

      notifications.show({
        message: "Equipment Part created.",
        color: "green",
      });
      setIsCreatingEquipmentPart(false);
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
          Add Equipment Part
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
                  data={nameOption}
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
              sx={{
                input: {
                  textTransform: "uppercase",
                },
              }}
            />
            <Controller
              control={control}
              name="brand"
              render={({ field: { value, onChange } }) => (
                <Select
                  value={value}
                  onChange={onChange}
                  data={brandOption}
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
                  data={modelOption}
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
                  data={uomOption}
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
            onClick={() => setIsCreatingEquipmentPart(false)}
          >
            Cancel
          </Button>
        </form>
      </Stack>
    </Container>
  );
};

export default CreateEquipmentPart;
