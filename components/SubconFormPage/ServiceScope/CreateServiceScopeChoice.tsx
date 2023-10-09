import { checkServiceScope } from "@/backend/api/get";
import { createServiceScopeChoice } from "@/backend/api/post";
import { Database } from "@/utils/database";
import {
  ServiceScopeChoiceForm,
  ServiceScopeChoiceTableRow,
} from "@/utils/types";
import {
  Button,
  Checkbox,
  Container,
  Divider,
  Flex,
  LoadingOverlay,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";

type Props = {
  setIsCreating: Dispatch<SetStateAction<boolean>>;
  setServiceScopeChoiceList: Dispatch<
    SetStateAction<ServiceScopeChoiceTableRow[]>
  >;
  setsetServiceScopeChoiceCount: Dispatch<SetStateAction<number>>;
  name: string;
  scopeId: string;
};

const CreateServiceScopeChoice = ({
  setIsCreating,
  setServiceScopeChoiceList,
  setsetServiceScopeChoiceCount,
  name,
  scopeId,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();

  const { register, formState, handleSubmit } = useForm<ServiceScopeChoiceForm>(
    {
      defaultValues: {
        name: "",
        isAvailable: true,
      },
    }
  );

  const onSubmit = async (data: ServiceScopeChoiceForm) => {
    try {
      const newService = await createServiceScopeChoice(supabaseClient, {
        service_scope_choice_name: data.name,
        service_scope_choice_is_available: data.isAvailable,
        service_scope_choice_service_scope_id: scopeId,
      });
      setServiceScopeChoiceList((prev) => {
        prev.unshift(newService);
        return prev;
      });
      setsetServiceScopeChoiceCount((prev) => prev + 1);
      notifications.show({
        message: "Choice created.",
        color: "green",
      });
      setIsCreating(false);
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
    return;
  };

  return (
    <Container p={0} fluid sx={{ position: "relative" }} mt="xl">
      <LoadingOverlay visible={formState.isSubmitting} />

      <Stack spacing={16}>
        <Title m={0} p={0} order={3}>
          Add {name}
        </Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={16}>
            <Flex align="center" justify="center" gap="xs">
              <TextInput
                {...register("name", {
                  required: { message: "Value required", value: true },
                  maxLength: {
                    message: "Value must be shorter than 500 characters",
                    value: 500,
                  },
                  validate: {
                    duplicate: async (value) => {
                      const isExisting = await checkServiceScope(
                        supabaseClient,
                        {
                          serviceScope: value,
                          scopeId: scopeId,
                        }
                      );
                      return isExisting ? "Value already exists" : true;
                    },
                  },
                })}
                withAsterisk
                w="100%"
                label="Value"
                error={formState.errors.name?.message}
              />
            </Flex>
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
            onClick={() => setIsCreating(false)}
          >
            Cancel
          </Button>
        </form>
      </Stack>
      <Divider my="xl" />
    </Container>
  );
};

export default CreateServiceScopeChoice;
