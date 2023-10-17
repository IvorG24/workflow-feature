import { editTicketResponse } from "@/backend/api/update";
import { Database } from "@/utils/database";
import { CreateTicketPageOnLoad, TicketType } from "@/utils/types";
import {
  Box,
  Button,
  Flex,
  Group,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";

type Props = {
  title: string;
  description: string;
  ticketStatus: string;
  setTicket: Dispatch<SetStateAction<TicketType>>;
  user: CreateTicketPageOnLoad["member"];
  isApprover: boolean;
  setIsEditingResponse: Dispatch<SetStateAction<boolean>>;
  isEditingResponse: boolean;
};

type TicketResponseFormValues = {
  title: string;
  description: string;
};

const TicketResponseSection = ({
  title,
  description,
  ticketStatus,
  user,
  isApprover,
  setTicket,
  isEditingResponse,
  setIsEditingResponse,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();
  const canUserEditResponse =
    ["ADMIN", "OWNER"].includes(user.team_member_role || "") && isApprover;

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<TicketResponseFormValues>({
    defaultValues: { title, description },
  });

  const handleEditResponse = async (data: TicketResponseFormValues) => {
    try {
      await editTicketResponse(supabaseClient, {
        ...data,
        ticketId: `${router.query.ticketId}`,
      });
      setTicket((ticket) => ({
        ...ticket,
        ticket_title: data.title,
        ticket_description: data.description,
      }));

      // 1. update ticket (done)
      // 2. add comment explaining the changes made by admin. only comment the changes that occured
      // 3. example
      //    3.A. [Admin] has made the following changes on the ticket
      //         [Old Title] -> [New Title]
      //         [Old Description] -> [New Description]
      //    3.B. [Admin] has made the following changes on the ticket
      //         [Old Description] -> [New Description]
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsEditingResponse(false);
    }
  };

  return (
    <Stack spacing={16}>
      <Group position="apart">
        <Group spacing={8}>
          <Text weight={600}>Request Details</Text>
          {isEditingResponse && (
            <Text size="xs" color="blue">
              (Edit Mode)
            </Text>
          )}
        </Group>
        {canUserEditResponse &&
          ticketStatus === "UNDER REVIEW" &&
          (isEditingResponse ? (
            <Button
              sx={{ alignSelf: "flex-end" }}
              w={100}
              size="sm"
              variant="default"
              onClick={() => {
                setIsEditingResponse(false);
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
                setIsEditingResponse(true);
              }}
            >
              Override
            </Button>
          ))}
      </Group>

      {isEditingResponse ? (
        <form onSubmit={handleSubmit(handleEditResponse)}>
          <Stack>
            <TextInput
              sx={{ flex: 1 }}
              label="Title"
              {...register("title", {
                required: "This field is required",
              })}
              error={errors.title?.message}
              readOnly={!isEditingResponse}
            />

            <Textarea
              label="Description"
              {...register("description", {
                required: "This field is required",
              })}
              error={errors.description?.message}
              readOnly={!isEditingResponse}
            />
            {isEditingResponse ? (
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

            <Flex direction="column">
              {description.split("\n").map((line, id) => (
                <Text key={id}>{line}</Text>
              ))}
            </Flex>
          </Box>
        </Stack>
      )}
    </Stack>
  );
};

export default TicketResponseSection;
