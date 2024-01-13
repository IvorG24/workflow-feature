import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { OtherExpensesTypeTableRow } from "@/utils/types";

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
  setIsCreatingType: Dispatch<SetStateAction<boolean>>;
  setTypeList: Dispatch<SetStateAction<OtherExpensesTypeTableRow[]>>;
  setTypeCount: Dispatch<SetStateAction<number>>;
};

const CreateOtherExpensesType = ({
  setIsCreatingType,
  setTypeList,
  setTypeCount,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const activeTeam = useActiveTeam();
  const teamMember = useUserTeamMember();

  const { register, formState, handleSubmit } = useForm<TypeForm>({
    defaultValues: {
      type: "",
      isAvailable: true,
      category: "",
    },
  });

  const onSubmit = async (data: TypeForm) => {
    try {
      // setTypeList((prev) => {
      //   prev.unshift(newType);
      //   return prev;
      // });
      // setTypeCount((prev) => prev + 1);
      // notifications.show({
      //   message: `${.label} created.`,
      //   color: "green",
      // });
      setIsCreatingType(false);
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
          Add Type
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
                    return value;
                    // const isExisting = await checkTable(supabaseClient, {
                    //   TableName: .table,
                    //   value:
                    //     .label === "Unit of Measurement"
                    //       ? value
                    //       : value.toUpperCase(),
                    //   teamId: activeTeam.team_id,
                    // });
                    // return isExisting ? `${.label} already exists` : true;
                  },
                },
              })}
              withAsterisk
              w="100%"
              label={"Type"}
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
            onClick={() => setIsCreatingType(false)}
          >
            Cancel
          </Button>
        </form>
      </Stack>
    </Container>
  );
};

export default CreateOtherExpensesType;
