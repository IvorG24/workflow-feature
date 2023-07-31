import { checkName } from "@/backend/api/get";
import { createSupplier } from "@/backend/api/post";
import { useActiveTeam } from "@/stores/useTeamStore";
import { Database } from "@/utils/database";
import { SupplierTableRow } from "@/utils/types";
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
  setIsCreatingSupplier: Dispatch<SetStateAction<boolean>>;
  setSupplierList: Dispatch<SetStateAction<SupplierTableRow[]>>;
  setSupplierCount: Dispatch<SetStateAction<number>>;
};

const CreateSupplier = ({
  setIsCreatingSupplier,
  setSupplierList,
  setSupplierCount,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const activeTeam = useActiveTeam();

  const { register, formState, handleSubmit } = useForm<{
    name: string;
    isAvailable: boolean;
  }>({
    defaultValues: {
      name: "",
      isAvailable: true,
    },
  });

  const onSubmit = async (data: { name: string; isAvailable: boolean }) => {
    try {
      const newSupplier = await createSupplier(supabaseClient, {
        supplierData: {
          supplier_name: data.name,
          supplier_is_available: data.isAvailable,
          supplier_team_id: activeTeam.team_id,
        },
      });
      setSupplierList((prev) => {
        prev.unshift(newSupplier);
        return prev;
      });
      setSupplierCount((prev) => prev + 1);
      notifications.show({
        message: "Supplier created.",
        color: "green",
      });
      setIsCreatingSupplier(false);
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
          Add Supplier
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
                    const isExisting = await checkName(supabaseClient, {
                      table: "supplier",
                      name: value,
                      teamId: activeTeam.team_id,
                    });
                    return isExisting ? "Supplier already exists" : true;
                  },
                },
              })}
              withAsterisk
              w="100%"
              label="Name"
              error={formState.errors.name?.message}
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
            onClick={() => setIsCreatingSupplier(false)}
          >
            Cancel
          </Button>
        </form>
      </Stack>
    </Container>
  );
};

export default CreateSupplier;
