import { useActiveTeam } from "@/stores/useTeamStore";
import { Database } from "@/utils/database";
import { Form, OtherExpensesTypeTableRow, Table } from "@/utils/types";

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
import { TypeForm } from "./OtherExpensesType";

type Props = {
  setTypeList: Dispatch<SetStateAction<Table[]>>;
  setEditType: Dispatch<SetStateAction<Table | null>>;
  editType: OtherExpensesTypeTableRow;
};

const UpdateOtherExpensesType = ({
  setTypeList,
  setEditType,
  editType,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const activeTeam = useActiveTeam();

  const { register, formState, handleSubmit } = useForm<TypeForm>({
    defaultValues: {
      type: editType.other_expenses_type,
      isAvailable: editType.other_expenses_type_is_available,
      category: editType.other_expenses_type_category_id as string,
    },
  });

  const onSubmit = async (data: Form) => {
    try {
      console.log(data);
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
          Update Type
        </Title>
        <Divider mb="xl" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={16}>
            <TextInput
              {...register("type", {
                required: {
                  message: `Type is required`,
                  value: true,
                },
                validate: {
                  duplicate: async (value) => {
                    if (value === editType.other_expenses_type) return;

                    // const isExisting = await checkTable(supabaseClient, {
                    //   TableName: .table,
                    //   value:

                    //      value.toUpperCase(),
                    //   teamId: activeTeam.team_id,
                    // });
                    return `Type already exists`;
                  },
                },
              })}
              withAsterisk
              w="100%"
              label="Type"
              error={formState.errors.type?.message}
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
            onClick={() => setEditType(null)}
          >
            Cancel
          </Button>
        </form>
      </Stack>
    </Container>
  );
};

export default UpdateOtherExpensesType;
