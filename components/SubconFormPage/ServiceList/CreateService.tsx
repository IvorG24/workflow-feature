import { checkServiceName } from "@/backend/api/get";
import { createService } from "@/backend/api/post";
import InputAddRemove from "@/components/RequisitionFormPage/InputAddRemove";
import { useActiveTeam } from "@/stores/useTeamStore";
import { Database } from "@/utils/database";
import { ServiceForm, ServiceWithScopeType } from "@/utils/types";
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
import { useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

const serviceTypeOptions = [
  { value: "TEXT", label: "Text" },
  { value: "DROPDOWN", label: "Dropdown" },
  { value: "MULTISELECT", label: "Multiselect" },
];

type Props = {
  setIsCreatingService: Dispatch<SetStateAction<boolean>>;
  setServiceList: Dispatch<SetStateAction<ServiceWithScopeType[]>>;
  setServiceCount: Dispatch<SetStateAction<number>>;
};

const CreateService = ({
  setIsCreatingService,
  setServiceList,
  setServiceCount,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();
  const formId = router.query.formId as string;

  const activeTeam = useActiveTeam();

  const { register, getValues, formState, handleSubmit, control } =
    useForm<ServiceForm>({
      defaultValues: {
        scope: [{ name: "", type: "TEXT", isWithOther: false }],
        name: "",
        isAvailable: true,
      },
    });

  const { append, remove, fields } = useFieldArray<ServiceForm>({
    control,
    name: "scope",
    rules: { minLength: 1, maxLength: 10 },
  });

  const onAddInput = () =>
    append({ name: "", type: "TEXT", isWithOther: false });

  const onSubmit = async (data: ServiceForm) => {
    try {
      const newService = await createService(supabaseClient, {
        serviceData: {
          service_name: data.name,
          service_is_available: data.isAvailable,
          service_team_id: activeTeam.team_id,
        },
        scope: data.scope,
        formId: formId,
      });
      setServiceList((prev) => {
        prev.unshift(newService);
        return prev;
      });
      setServiceCount((prev) => prev + 1);
      notifications.show({
        message: "Service created.",
        color: "green",
      });
      setIsCreatingService(false);
    } catch {
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
          Add Service
        </Title>
        <Divider mb="xl" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={16}>
            <TextInput
              {...register("name", {
                required: { message: "Service name is required", value: true },
                minLength: {
                  message: "Service name must have atleast 3 characters",
                  value: 3,
                },
                maxLength: {
                  message: "Service name must be shorter than 500 characters",
                  value: 500,
                },
                validate: {
                  duplicate: async (value) => {
                    const isExisting = await checkServiceName(supabaseClient, {
                      serviceName: value,
                      teamId: activeTeam.team_id,
                    });
                    return isExisting ? "Service name already exists" : true;
                  },
                  validCharacters: (value) =>
                    value.match(/^[a-zA-Z ]*$/)
                      ? true
                      : "Service name must not include invalid character/s",
                },
              })}
              withAsterisk
              w="100%"
              label="Name"
              error={formState.errors.name?.message}
            />
            {fields.map((field, index) => {
              return (
                <Flex key={field.id} gap="xs">
                  <TextInput
                    withAsterisk
                    label={`Scope #${index + 1}`}
                    {...register(`scope.${index}.name`, {
                      required: `Scope #${index + 1} is required`,
                      minLength: {
                        message: "Scope must be at least 3 characters",
                        value: 3,
                      },
                      validate: {
                        isDuplicate: (value) => {
                          let count = 0;
                          getValues("scope").map(
                            ({ name }: { name: string }) => {
                              if (name === value) {
                                count += 1;
                              }
                            }
                          );
                          if (count > 1) {
                            return "Invalid Duplicate Scope";
                          } else {
                            return true;
                          }
                        },
                      },
                    })}
                    sx={{
                      flex: 1,
                    }}
                    error={
                      formState.errors.scope !== undefined &&
                      formState.errors.scope[index]?.name?.message
                    }
                  />
                  <Controller
                    control={control}
                    name={`scope.${index}.type`}
                    render={({ field: { value, onChange } }) => (
                      <Select
                        value={value}
                        label="Type"
                        data={serviceTypeOptions}
                        onChange={onChange}
                      />
                    )}
                  />
                  <Checkbox
                    {...register(`scope.${index}.isWithOther`)}
                    sx={{
                      input: {
                        cursor: "pointer",
                      },
                    }}
                    mt={32}
                    label={"with other?"}
                  />
                </Flex>
              );
            })}
            <InputAddRemove
              canAdd={fields.length < 10}
              onAdd={onAddInput}
              canRemove={fields.length > 1}
              onRemove={() => remove(fields.length - 1)}
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
            onClick={() => setIsCreatingService(false)}
          >
            Cancel
          </Button>
        </form>
      </Stack>
    </Container>
  );
};

export default CreateService;
