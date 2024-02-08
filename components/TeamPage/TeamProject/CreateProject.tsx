import { checkIfTeamProjectExists } from "@/backend/api/get";
import { createAttachment, createTeamProject } from "@/backend/api/post";
import { useActiveTeam } from "@/stores/useTeamStore";
import { MAX_FILE_SIZE, MAX_FILE_SIZE_IN_MB } from "@/utils/constant";
import { Database } from "@/utils/database";
import { TeamProjectTableRow } from "@/utils/types";
import {
  Button,
  Container,
  Divider,
  FileInput,
  Flex,
  LoadingOverlay,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconFile } from "@tabler/icons-react";
import { Dispatch, SetStateAction } from "react";
import { Controller, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

type ProjectForm = {
  projectName: string;
  site_map: File;
  boq: File;
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

  const { register, formState, handleSubmit, control } = useForm<ProjectForm>({
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

      const newProject = await createTeamProject(supabaseClient, {
        teamProjectName: projectName,
        teamProjectInitials: projectInitials,
        teamProjectTeamId: activeTeam.team_id,
        siteMapId: siteMapData.attachment_id,
        boqId: boqData.attachment_id,
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
