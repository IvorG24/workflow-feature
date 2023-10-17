import { useUserTeamMember } from "@/stores/useUserStore";
import {
  Box,
  Button,
  Group,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";

type Props = {
  title: string;
  description: string;
  ticketStatus: string;
  setShowTicketActionSection: Dispatch<SetStateAction<boolean>>;
  isApprover: boolean;
};

type TicketResponseFormValues = {
  title: string;
  description: string;
};

const TicketResponseSection = ({
  title,
  description,
  ticketStatus,
  setShowTicketActionSection,
  isApprover,
}: Props) => {
  const currentUser = useUserTeamMember();
  const canUserEditResponse =
    ["ADMIN", "OWNER"].includes(currentUser?.team_member_role || "") &&
    isApprover;
  const [allowFormEdit, setAllowFormEdit] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<TicketResponseFormValues>({
    defaultValues: { title, description },
  });

  const handleEditResponse = (data: TicketResponseFormValues) => {
    try {
      // 1. update ticket
      // 2. add comment explaining the changes made by admin. only comment the changes that occured
      // 3. example
      //    3.A. [Admin] has made the following changes on the ticket
      //         [Old Title] -> [New Title]
      //         [Old Description] -> [New Description]
      //    3.B. [Admin] has made the following changes on the ticket
      //         [Old Description] -> [New Description]
      console.log(data);
    } catch (error) {
      console.log(error);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setAllowFormEdit(false);
      setShowTicketActionSection(false);
    }
  };

  return (
    <Stack spacing={16}>
      <Group position="apart">
        <Group spacing={8}>
          <Text weight={600}>Request Details</Text>
          {allowFormEdit && (
            <Text size="xs" color="blue">
              (Edit Mode)
            </Text>
          )}
        </Group>
        {canUserEditResponse &&
          ticketStatus === "PENDING" &&
          (allowFormEdit ? (
            <Button
              sx={{ alignSelf: "flex-end" }}
              w={100}
              size="sm"
              variant="default"
              onClick={() => {
                setAllowFormEdit(false);
                setShowTicketActionSection(true);
              }}
            >
              Cancel
            </Button>
          ) : (
            <Button
              sx={{ alignSelf: "flex-end" }}
              w={100}
              size="sm"
              color="orange"
              onClick={() => {
                setAllowFormEdit(true);
                setShowTicketActionSection(false);
              }}
            >
              Override
            </Button>
          ))}
      </Group>

      {allowFormEdit ? (
        <form onSubmit={handleSubmit(handleEditResponse)}>
          <Stack>
            <TextInput
              sx={{ flex: 1 }}
              label="Title"
              {...register("title", {
                required: "This field is required",
              })}
              error={errors.title?.message}
              readOnly={!allowFormEdit}
            />

            <Textarea
              label="Description"
              {...register("description", {
                required: "This field is required",
              })}
              error={errors.description?.message}
              readOnly={!allowFormEdit}
            />
            {allowFormEdit ? (
              <Button type="submit" size="md">
                Save Changes
              </Button>
            ) : null}
          </Stack>
        </form>
      ) : (
        <Stack>
          <Box>
            <Text size={14} weight={600}>
              Title
            </Text>
            <Text>{title}</Text>
          </Box>

          <Box>
            <Text size={14} weight={600}>
              Description
            </Text>
            <Text>{description}</Text>
          </Box>
        </Stack>
      )}
    </Stack>
  );
};

export default TicketResponseSection;
