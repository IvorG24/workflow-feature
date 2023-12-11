import { checkEquipmentLookupTable } from "@/backend/api/get";
import { updateEquipmentLookup } from "@/backend/api/update";
import { useActiveTeam } from "@/stores/useTeamStore";
import { Database } from "@/utils/database";
import {
  EquipmentLookupChoices,
  EquipmentLookupTable,
  EquipmentLookupTableUpdate,
  LookupForm,
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
  lookup: {
    table: EquipmentLookupChoices;
    label: string;
  };
  setEquipmentLookupList: Dispatch<SetStateAction<EquipmentLookupTable[]>>;
  setEditEquipmentLookup: Dispatch<SetStateAction<EquipmentLookupTable | null>>;
  editEquipmentLookup: EquipmentLookupTable;
};

const UpdateEquipmentLookup = ({
  lookup,
  setEquipmentLookupList,
  setEditEquipmentLookup,
  editEquipmentLookup,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const activeTeam = useActiveTeam();

  const { register, formState, handleSubmit } = useForm<LookupForm>({
    defaultValues: {
      value: editEquipmentLookup.value,
      isAvailable: editEquipmentLookup.status,
    },
  });

  const onSubmit = async (data: LookupForm) => {
    try {
      const lookupValue = lookup.table;
      const isAvailable = `${lookup.table}_is_available`;
      const team = `${lookup.table}_team_id`;

      const newEquipmentLookup: EquipmentLookupTable =
        await updateEquipmentLookup(supabaseClient, {
          equipmentLookupData: {
            [lookupValue]: data.value.toUpperCase(),
            [isAvailable]: data.isAvailable,
            [team]: activeTeam.team_id,
          } as EquipmentLookupTableUpdate,
          tableName: lookup.table,
          lookupId: editEquipmentLookup.id,
        });

      setEquipmentLookupList((prev) => {
        return prev.map((equipment) => {
          if (equipment.id === editEquipmentLookup.id) {
            return newEquipmentLookup;
          } else {
            return equipment;
          }
        });
      });
      notifications.show({
        message: "Equipment Lookup updated.",
        color: "green",
      });
      setEditEquipmentLookup(null);
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
          Update {lookup.label}
        </Title>
        <Divider mb="xl" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={16}>
            <TextInput
              {...register("value", {
                required: {
                  message: `${lookup.label} is required`,
                  value: true,
                },
                validate: {
                  duplicate: async (value) => {
                    const isExisting = await checkEquipmentLookupTable(
                      supabaseClient,
                      {
                        lookupTableName: lookup.table,
                        value: value.toUpperCase(),
                        teamId: activeTeam.team_id,
                      }
                    );
                    return isExisting ? `${lookup.label} already exists` : true;
                  },
                },
              })}
              withAsterisk
              w="100%"
              label={lookup.label}
              error={formState.errors.value?.message}
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
            onClick={() => setEditEquipmentLookup(null)}
          >
            Cancel
          </Button>
        </form>
      </Stack>
    </Container>
  );
};

export default UpdateEquipmentLookup;
