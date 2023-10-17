import { createTicket } from "@/backend/api/post";
import { Database } from "@/utils/database";
import { getAvatarColor } from "@/utils/styling";
import { CreateTicketPageOnLoad } from "@/utils/types";
import {
  Avatar,
  Button,
  Container,
  Divider,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import moment from "moment";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { TEMP_DEFAULT_TICKET_CATEGORY_LIST } from "../TicketListPage/TicketListPage";

type CreateTicketFormValues = {
  title: string;
  category: string;
  description: string;
};

type Props = {
  member: CreateTicketPageOnLoad["member"];
};

const CreateTicketPage = ({ member }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
    control,
  } = useForm<CreateTicketFormValues>();

  const handleCreateTicket = async (data: CreateTicketFormValues) => {
    try {
      setIsLoading(true);

      const ticket = await createTicket(supabaseClient, {
        ...data,
        requester: `${member?.team_member_id}`,
      });
      console.log(ticket);

      notifications.show({
        message: "Request created.",
        color: "green",
      });
      router.push(`/team-requests/tickets/${ticket.ticket_id}`);
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
    <Container>
      <Title order={3} color="dimmed">
        Create Ticket Page
      </Title>
      <Paper mt="md" p="md" withBorder>
        <Stack>
          <Group position="apart">
            <Stack spacing={4}>
              <Title order={5}>Requester</Title>
              <Group spacing={8}>
                <Avatar
                  size="sm"
                  src={member?.team_member_user?.user_avatar || ""}
                  color={getAvatarColor(
                    Number(`${member.team_member_id.charCodeAt(0)}`)
                  )}
                  radius="xl"
                >
                  {(
                    member.team_member_user.user_first_name[0] +
                    member.team_member_user.user_last_name[0]
                  ).toUpperCase()}
                </Avatar>
                <Text>
                  {`${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`}
                </Text>
              </Group>
            </Stack>
            <Stack spacing={4}>
              <Title order={5}>Date</Title>
              <Text>{moment().format("MMM DD, YYYY")}</Text>
            </Stack>
          </Group>
          <Divider />
          <form onSubmit={handleSubmit(handleCreateTicket)}>
            <Stack>
              <Controller
                control={control}
                name={"category"}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <Select
                    value={value as string}
                    onChange={(value) => onChange(value as string)}
                    data={TEMP_DEFAULT_TICKET_CATEGORY_LIST}
                    clearable
                    error={error?.message}
                    readOnly={isLoading}
                  />
                )}
                rules={{ required: "This field is required" }}
              />
              <TextInput
                label="Title"
                {...register("title", {
                  required: "This field is required",
                })}
                error={errors.title?.message}
                readOnly={isLoading}
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
              />
              <Button type="submit" size="md" loading={isLoading}>
                Submit
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
};

export default CreateTicketPage;
