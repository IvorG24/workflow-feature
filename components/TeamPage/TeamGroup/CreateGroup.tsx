import { checkIfTeamGroupExists } from "@/backend/api/get";
import { createTeamGroup } from "@/backend/api/post";
import { useActiveTeam } from "@/stores/useTeamStore";
import { Database } from "@/utils/database";
import { TeamGroupTableRow } from "@/utils/types";
import {
  Button,
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

type GroupForm = {
  groupName: string;
};

type Props = {
  setIsCreatingGroup: Dispatch<SetStateAction<boolean>>;
  setGroupList: Dispatch<SetStateAction<TeamGroupTableRow[]>>;
  setGroupCount: Dispatch<SetStateAction<number>>;
};

const CreateGroup = ({
  setIsCreatingGroup,
  setGroupList,
  setGroupCount,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const activeTeam = useActiveTeam();

  const { register, formState, handleSubmit } = useForm<GroupForm>({
    defaultValues: {
      groupName: "",
    },
  });

  const onSubmit = async (data: GroupForm) => {
    try {
      const groupName = data.groupName.trim().toUpperCase();
      if (
        await checkIfTeamGroupExists(supabaseClient, {
          teamId: activeTeam.team_id,
          groupName: groupName,
        })
      ) {
        notifications.show({
          message: `Team group ${groupName} already exists`,
          color: "orange",
        });
        return;
      }

      const newGroup = await createTeamGroup(supabaseClient, {
        team_group_name: groupName,
        team_group_team_id: activeTeam.team_id,
      });
      setGroupList((prev) => {
        prev.unshift(newGroup);
        return prev;
      });
      setGroupCount((prev) => prev + 1);
      notifications.show({
        message: "Team group created.",
        color: "green",
      });
      setIsCreatingGroup(false);
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
          Add Group
        </Title>
        <Divider mb="xl" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={16}>
            <TextInput
              {...register("groupName", {
                validate: {
                  required: (value) =>
                    value.trim() ? true : "Group Name is required",
                  minLength: (value) =>
                    value.trim().length > 2
                      ? true
                      : "Group Name must have atleast 3 characters",
                  maxLength: (value) =>
                    value.trim().length < 500
                      ? true
                      : "Group Name must be shorter than 500 characters",
                },
              })}
              withAsterisk
              w="100%"
              label="Group Name"
              sx={{
                input: {
                  textTransform: "uppercase",
                },
              }}
              error={formState.errors.groupName?.message}
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
            onClick={() => setIsCreatingGroup(false)}
          >
            Cancel
          </Button>
        </form>
      </Stack>
    </Container>
  );
};

export default CreateGroup;
