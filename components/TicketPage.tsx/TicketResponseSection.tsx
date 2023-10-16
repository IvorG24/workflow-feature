import { useUserTeamMember } from "@/stores/useUserStore";
import { Button, Group, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { useState } from "react";
import { useForm } from "react-hook-form";

type Props = {
  title: string;
  description: string;
  ticketStatus: string;
};

type TicketResponseFormValues = {
  title: string;
  description: string;
};

const TicketResponseSection = ({ title, description, ticketStatus }: Props) => {
  const currentUser = useUserTeamMember();
  const canUserEditResponse = ["ADMIN", "OWNER"].includes(
    currentUser?.team_member_role || ""
  );
  const [allowFormEdit, setAllowFormEdit] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<TicketResponseFormValues>({
    defaultValues: { title, description },
  });

  const handleEditResponse = (data: TicketResponseFormValues) => {
    // 1. update ticket
    // 2. add comment explaining the changes made by admin. only comment the changes that occured
    // 3. example
    //    3.A. [Admin] has made the following changes on the ticket
    //         [Old Title] -> [New Title]
    //         [Old Description] -> [New Description]
    //    3.B. [Admin] has made the following changes on the ticket
    //         [Old Description] -> [New Description]

    console.log(data);
    setAllowFormEdit(false);
  };

  return (
    <Stack spacing={4}>
      <Group position="apart">
        <Text weight={600}>Request Details</Text>
        {canUserEditResponse && ticketStatus === "PENDING" && (
          <Button
            sx={{ alignSelf: "flex-end" }}
            w={100}
            size="sm"
            color="orange"
            onClick={() => setAllowFormEdit(true)}
          >
            Override
          </Button>
        )}
      </Group>
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
          {allowFormEdit ? <Button type="submit">Save</Button> : null}
        </Stack>
      </form>
    </Stack>
  );
};

export default TicketResponseSection;
