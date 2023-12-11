import {
  checkPEDPart,
  getEquipmentBrandAndModelOption,
  getEquipmentUOMAndCategoryOption,
} from "@/backend/api/get";
import { createEquipmentPart } from "@/backend/api/post";
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
  setIsCreatingEquipmentPart: Dispatch<SetStateAction<boolean>>;
  setEquipmentPartList: Dispatch<SetStateAction<EquipmentPartType[]>>;
  setEquipmentPartCount: Dispatch<SetStateAction<number>>;
};

const CreateEquipmentPart = ({
  selectedEquipment,
  setIsCreatingEquipmentPart,
  setEquipmentPartList,
  setEquipmentPartCount,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();

  const teamMember = useUserTeamMember();

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
    const fetchBrandAndModelOption = async () => {
      try {
        const { brandList, modelList } = await getEquipmentBrandAndModelOption(
          supabaseClient
        );
        const { uomList, categoryList } =
          await getEquipmentUOMAndCategoryOption(supabaseClient);
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
      }
    };
    fetchBrandAndModelOption();
  }, []);

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
        equipment_part_name: data.name.toUpperCase(),
        equipment_part_number: data.partNumber,
        equipment_part_brand_id: data.brand,
        equipment_part_model_id: data.model,
        equipment_part_unit_of_measurement_id: data.uom,
        equipment_part_component_category_id: data.category,
        equipment_part_equipment_id: selectedEquipment.equipment_id,
        equipment_part_encoder_team_member_id: teamMember?.team_member_id,
        equipment_part_is_available: data.isAvailable,
      };

      if (await checkPEDPart(supabaseClient, { equipmentPartData: params })) {
        notifications.show({
          message: "Equipment Part already exists.",
          color: "orange",
        });
        return;
      }

      const newEquipmentPart = await createEquipmentPart(supabaseClient, {
        equipmentPartData: params,
        brand: brandOption.find((brand) => brand.value === data.brand)
          ?.label as string,
        model: modelOption.find((model) => model.value === data.model)
          ?.label as string,
        uom: uomOption.find((uom) => uom.value === data.uom)?.label as string,
        category: categoryOption.find(
          (category) => category.value === data.category
        )?.label as string,
      });
      setEquipmentPartList((prev) => {
        prev.unshift(newEquipmentPart);
        return prev;
      });
      setEquipmentPartCount((prev) => prev + 1);
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
    return;
  };

  return (
    <Container p={0} fluid sx={{ position: "relative" }}>
      <LoadingOverlay visible={formState.isSubmitting} />
      <Stack spacing={16}>
        <Title m={0} p={0} order={3}>
          Add Equipment Part
        </Title>
        <Divider mb="xl" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={16}>
            <TextInput
              {...register("name", {
                required: {
                  message: "Name is required",
                  value: true,
                },
              })}
              withAsterisk
              w="100%"
              label="Name"
              error={formState.errors.name?.message}
              sx={{
                input: {
                  textTransform: "uppercase",
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
