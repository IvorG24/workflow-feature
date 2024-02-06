import { createTicket } from "@/backend/api/post";
import { useActiveTeam } from "@/stores/useTeamStore";
import { Database } from "@/utils/database";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { Button, TextInput, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";

type Props = {
  category: string | null;
  memberId: string;
};

type CreateTicketDefaultFormValues = {
  category: string;
  title: string;
  description: string;
};

const TicketForm = ({ category, memberId }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const activeTeam = useActiveTeam();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CreateTicketDefaultFormValues>();

  const handleCreateTicket = async (data: CreateTicketDefaultFormValues) => {
    try {
      setIsLoading(true);
      if (!category) {
        notifications.show({
          message: "Ticket type is required.",
          color: "red",
        });
        return;
      }

      const ticket = await createTicket(supabaseClient, {
        ...data,
        category: `${category}`,
        requester: memberId,
      });

      notifications.show({
        message: "Ticket created.",
        color: "green",
      });
      router.push(
        `/${formatTeamNameToUrlKey(activeTeam.team_name)}/tickets/${
          ticket.ticket_id
        }`
      );
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleCreateTicket)}>
        <TextInput
          label="Title"
          {...register("title", {
            required: "This field is required",
          })}
          error={errors.title?.message}
          readOnly={isLoading}
          mt="xs"
        />
        <Textarea
          label="Description"
          minRows={6}
          autosize={true}
          {...register("description", {
            required: "This field is required",
          })}
          error={errors.description?.message}
          readOnly={isLoading}
          mt="xs"
        />

        <Button fullWidth mt="lg" type="submit" size="md" loading={isLoading}>
          Submit
        </Button>
      </form>
    </>
  );
};

export default TicketForm;
