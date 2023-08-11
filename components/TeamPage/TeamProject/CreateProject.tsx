import { checkIfTeamProjectExists } from "@/backend/api/get";
import { createTeamProject } from "@/backend/api/post";
import { useActiveTeam } from "@/stores/useTeamStore";
import { Database } from "@/utils/database";
import { TeamProjectTableRow } from "@/utils/types";
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
import { toUpper } from "lodash";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";

type ProjectForm = {
  projectName: string;
};

type Props = {
  setIsCreatingProject: Dispatch<SetStateAction<boolean>>;
  setProjectList: Dispatch<SetStateAction<TeamProjectTableRow[]>>;
  setProjectCount: Dispatch<SetStateAction<number>>;
};

const CreateProject = ({
  setIsCreatingProject,
  setProjectList,
  setProjectCount,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();

  const activeTeam = useActiveTeam();

  const { register, formState, handleSubmit } = useForm<ProjectForm>({
    defaultValues: {
      projectName: "",
    },
  });

  const generateProjectInitials = (projectName: string) => {
    const words = projectName.split(" ");

    if (words.length === 0) {
      return "";
    }

    let initials = "";

    words.forEach((word) => {
      if (word.length > 0) {
        initials += word[0].toUpperCase();
      }
    });

    return initials;
  };

  const onSubmit = async (data: ProjectForm) => {
    try {
      const projectName = toUpper(data.projectName.trim());
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

      const newProject = await createTeamProject(supabaseClient, {
        team_project_name: projectName,
        team_project_initials: projectInitials,
        team_project_team_id: activeTeam.team_id,
      });
      setProjectList((prev) => {
        prev.unshift(newProject);
        return prev;
      });
      setProjectCount((prev) => prev + 1);
      notifications.show({
        message: "Team project created.",
        color: "green",
      });
      setIsCreatingProject(false);
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
          Add Project
        </Title>
        <Divider mb="xl" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={16}>
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
