import { checkIfTeamProjectExists } from "@/backend/api/get";
import { createAttachment, createTeamProject } from "@/backend/api/post";
import { useActiveTeam } from "@/stores/useTeamStore";
import { MAX_FILE_SIZE, MAX_FILE_SIZE_IN_MB } from "@/utils/constant";
import { Database } from "@/utils/database";
import { TeamProjectWithAddressType } from "@/utils/types";
import {
  Button,
  Container,
  Divider,
  FileInput,
  LoadingOverlay,
  Select,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconFile } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  barangays,
  cities,
  provinces,
  regions,
} from "select-philippines-address";
import { v4 as uuidv4 } from "uuid";

type ProjectForm = {
  projectName: string;
  site_map: File;
  boq: File;
  region: string;
  province: string;
  city: string;
  barangay: string;
  street: string;
};

type OptionType = {
  label: string;
  value: string;
};

type Props = {
  setIsCreatingProject: Dispatch<SetStateAction<boolean>>;
  setProjectList: Dispatch<SetStateAction<TeamProjectWithAddressType[]>>;
  setProjectCount: Dispatch<SetStateAction<number>>;
};

const CreateProject = ({
  setIsCreatingProject,
  setProjectList,
  setProjectCount,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const activeTeam = useActiveTeam();

  const [isFetchingOptions, setIsFetchingOptions] = useState(true);
  const [regionOptions, setRegionOptions] = useState<OptionType[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<OptionType[]>([]);
  const [cityOptions, setCityOptions] = useState<OptionType[]>([]);
  const [barangayOptions, setBarangayOptions] = useState<OptionType[]>([]);

  const { register, formState, handleSubmit, control, setValue, watch } =
    useForm<ProjectForm>({
      defaultValues: {
        projectName: "",
      },
    });

  const generateProjectInitials = (projectName: string) => {
    const words = projectName.split(" ");
    let initials = "";

    if (words.length === 1) {
      const firstTwoLetters = words[0].slice(0, 2);
      initials = firstTwoLetters.toUpperCase();
    } else {
      for (const word of words) {
        if (word.length > 0) {
          initials += word[0].toUpperCase();
          if (initials.length >= 2) {
            break;
          }
        }
      }
    }

    return initials;
  };

  const onSubmit = async (data: ProjectForm) => {
    try {
      const projectName = data.projectName.trim().toUpperCase();
      const projectInitials = generateProjectInitials(projectName);
      if (
        await checkIfTeamProjectExists(supabaseClient, {
          teamId: activeTeam.team_id,
          projectName: projectName,
        })
      ) {
        notifications.show({
          message: `Team project ${projectName} already exists`,
          color: "orange",
        });
        return;
      }

      const { data: boqData } = await createAttachment(supabaseClient, {
        file: data.boq,
        attachmentData: {
          attachment_bucket: "TEAM_PROJECT_ATTACHMENTS",
          attachment_name: data.boq.name,
          attachment_value: uuidv4(),
        },
      });

      const { data: siteMapData } = await createAttachment(supabaseClient, {
        file: data.site_map,
        attachmentData: {
          attachment_bucket: "TEAM_PROJECT_ATTACHMENTS",
          attachment_name: data.site_map.name,
          attachment_value: uuidv4(),
        },
      });

      const region = regionOptions.find(
        (options) => options.value === data.region
      )?.label;
      const province = provinceOptions.find(
        (options) => options.value === data.province
      )?.label;
      const city = cityOptions.find(
        (options) => options.value === data.city
      )?.label;
      const barangay = barangayOptions.find(
        (options) => options.value === data.barangay
      )?.label;

      if (!region || !province || !city || !barangay) throw new Error();

      const newProject = await createTeamProject(supabaseClient, {
        teamProjectName: projectName,
        teamProjectInitials: projectInitials,
        teamProjectTeamId: activeTeam.team_id,
        siteMapId: siteMapData.attachment_id,
        boqId: boqData.attachment_id,
        region,
        province,
        city,
        barangay,
        street: data.street,
        zipCode: "0000",
      });

      setProjectList((prev) => {
        prev.unshift({
          ...newProject,
          team_project_site_map_attachment_id: siteMapData.attachment_value,
          team_project_boq_attachment_id: boqData.attachment_value,
        });
        return prev;
      });
      setProjectCount((prev) => Number(prev) + 1);
      notifications.show({
        message: "Team project created.",
        color: "green",
      });
      setIsCreatingProject(false);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
    return;
  };

  const watchBarangay = watch("barangay");

  useEffect(() => {
    try {
      setIsFetchingOptions(true);
      handleFetchRegionOptions();
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingOptions(false);
    }
  }, [setIsCreatingProject]);

  const handleFetchRegionOptions = async () => {
    const data: {
      region_code: string;
      region_name: string;
    }[] = await regions();
    setRegionOptions(
      data.map((region) => {
        return {
          label: region.region_name,
          value: region.region_code,
        };
      })
    );
  };

  const handleFetchProvinceOptions = async (value: string | null) => {
    try {
      setProvinceOptions([]);
      setCityOptions([]);
      setBarangayOptions([]);
      setValue("province", "");
      setValue("city", "");
      setValue("barangay", "");
      setValue("street", "");
      if (!value) {
        return;
      } else if (Number(value) === 13) {
        const data: {
          province_code: string;
          province_name: string;
        }[] = await provinces(value);
        setProvinceOptions(
          data
            .filter((province) => province.province_name !== "City Of Manila")
            .map((province) => {
              return {
                label: province.province_name,
                value: province.province_code,
              };
            })
        );
      } else {
        const data: {
          province_code: string;
          province_name: string;
        }[] = await provinces(value);
        setProvinceOptions(
          data.map((province) => {
            return {
              label: province.province_name,
              value: province.province_code,
            };
          })
        );
      }
    } catch (e) {
      setValue("region", "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleFetchCityOptions = async (value: string | null) => {
    try {
      setCityOptions([]);
      setBarangayOptions([]);
      setValue("city", "");
      setValue("barangay", "");
      setValue("street", "");
      if (!value) return;

      const data: {
        city_code: string;
        city_name: string;
      }[] = await cities(value);
      setCityOptions(
        data.map((city) => {
          return {
            label: city.city_name,
            value: city.city_code,
          };
        })
      );
    } catch (e) {
      setValue("province", "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleFetchBarangayOptions = async (value: string | null) => {
    try {
      setBarangayOptions([]);
      setValue("barangay", "");
      setValue("street", "");
      if (!value) return;

      const data: {
        brgy_code: string;
        brgy_name: string;
      }[] = await barangays(value);
      setBarangayOptions(
        data.map((barangay) => {
          return {
            label: barangay.brgy_name,
            value: barangay.brgy_code,
          };
        })
      );
    } catch (e) {
      setValue("city", "");
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
          Add Project
        </Title>
        <Divider mb="xl" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing="xl">
            <Stack>
              <TextInput
                {...register("projectName", {
                  validate: {
                    required: (value) =>
                      value.trim() ? true : "Project Name is required",
                    minLength: (value) =>
                      value.trim().length > 2
                        ? true
                        : "Project Name must have atleast 3 characters",
                    maxLength: (value) =>
                      value.trim().length < 500
                        ? true
                        : "Project Name must be shorter than 500 characters",
                  },
                })}
                withAsterisk
                w="100%"
                label="Project Name"
                sx={{
                  input: {
                    textTransform: "uppercase",
                  },
                }}
                error={formState.errors.projectName?.message}
              />
              <Controller
                control={control}
                name="site_map"
                render={({ field }) => (
                  <FileInput
                    label="Site Map"
                    required
                    icon={<IconFile size={16} />}
                    clearable
                    multiple={false}
                    onChange={field.onChange}
                    error={formState.errors.site_map?.message}
                  />
                )}
                rules={{
                  required: {
                    value: true,
                    message: "Site map is required",
                  },
                  validate: {
                    fileSize: (value) => {
                      if (!value) return true;
                      const formattedValue = value as File;
                      return formattedValue.size <= MAX_FILE_SIZE
                        ? true
                        : `File exceeds ${MAX_FILE_SIZE_IN_MB}mb`;
                    },
                  },
                }}
              />
              <Controller
                control={control}
                name="boq"
                render={({ field }) => (
                  <FileInput
                    label="BOQ"
                    required
                    icon={<IconFile size={16} />}
                    clearable
                    multiple={false}
                    onChange={field.onChange}
                    error={formState.errors.boq?.message}
                  />
                )}
                rules={{
                  required: {
                    value: true,
                    message: "BOQ is required",
                  },
                  validate: {
                    fileSize: (value) => {
                      if (!value) return true;
                      const formattedValue = value as File;
                      return formattedValue.size <= MAX_FILE_SIZE
                        ? true
                        : `File exceeds ${MAX_FILE_SIZE_IN_MB}mb`;
                    },
                  },
                }}
              />
            </Stack>

            <Stack>
              <Title order={4}>Address</Title>
              <Controller
                control={control}
                name="region"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label="Region"
                    data={regionOptions}
                    required
                    clearable
                    searchable
                    onChange={async (value) => {
                      await handleFetchProvinceOptions(value);
                      onChange(value);
                    }}
                    value={value}
                    error={formState.errors.region?.message}
                  />
                )}
                rules={{
                  required: {
                    value: true,
                    message: "Region is required",
                  },
                }}
              />
              <Controller
                control={control}
                name="province"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label="Province"
                    data={provinceOptions}
                    required
                    clearable
                    searchable
                    onChange={async (value) => {
                      await handleFetchCityOptions(value);
                      onChange(value);
                    }}
                    value={value}
                    error={formState.errors.province?.message}
                    disabled={provinceOptions.length === 0}
                  />
                )}
                rules={{
                  required: {
                    value: true,
                    message: "Province is required",
                  },
                }}
              />
              <Controller
                control={control}
                name="city"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label="City"
                    data={cityOptions}
                    required
                    clearable
                    searchable
                    onChange={async (value) => {
                      await handleFetchBarangayOptions(value);
                      onChange(value);
                    }}
                    value={value}
                    error={formState.errors.city?.message}
                    disabled={cityOptions.length === 0}
                  />
                )}
                rules={{
                  required: {
                    value: true,
                    message: "City is required",
                  },
                }}
              />
              <Controller
                control={control}
                name="barangay"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label="Barangay"
                    data={barangayOptions}
                    required
                    clearable
                    searchable
                    onChange={(value) => {
                      setValue("street", "");
                      onChange(value);
                    }}
                    value={value}
                    error={formState.errors.barangay?.message}
                    disabled={barangayOptions.length === 0}
                  />
                )}
                rules={{
                  required: {
                    value: true,
                    message: "Barangay is required",
                  },
                }}
              />
              <TextInput
                {...register("street", {
                  validate: {
                    required: (value) =>
                      value.trim() ? true : "Street is required",
                    minLength: (value) =>
                      value.trim().length > 2
                        ? true
                        : "Street must have atleast 3 characters",
                    maxLength: (value) =>
                      value.trim().length < 500
                        ? true
                        : "Street must be shorter than 500 characters",
                  },
                })}
                withAsterisk
                w="100%"
                label="Street"
                error={formState.errors.street?.message}
                disabled={!watchBarangay}
              />
            </Stack>
          </Stack>

          <Button type="submit" miw={100} mt={30} mr={14}>
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            miw={100}
            mt={30}
            mr={14}
            onClick={() => setIsCreatingProject(false)}
          >
            Cancel
          </Button>
        </form>
      </Stack>
    </Container>
  );
};

export default CreateProject;
