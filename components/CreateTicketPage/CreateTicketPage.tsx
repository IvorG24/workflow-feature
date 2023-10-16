import { getAvatarColor } from "@/utils/styling";
import { TeamMemberType } from "@/utils/types";
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
import moment from "moment";
import { Controller, useForm } from "react-hook-form";
import { TEMP_DEFAULT_TICKET_CATEGORY_LIST } from "../TicketListPage/TicketListPage";

type Props = {
  teamMemberData: TeamMemberType;
};

type CreateTicketFormValues = {
  title: string;
  category: string;
  description: string;
};

const CreateTicketPage = ({ teamMemberData }: Props) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
    control,
  } = useForm<CreateTicketFormValues>();

  const handleCreateTicket = (data: CreateTicketFormValues) => {
    console.log(data);
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
                  src={teamMemberData.team_member_user.user_avatar}
                  color={getAvatarColor(
                    Number(`${teamMemberData.team_member_id.charCodeAt(0)}`)
                  )}
                  radius="xl"
                >
                  {(
                    teamMemberData.team_member_user.user_first_name[0] +
                    teamMemberData.team_member_user.user_last_name[0]
                  ).toUpperCase()}
                </Avatar>
                <Text>
                  {`${teamMemberData.team_member_user.user_first_name} ${teamMemberData.team_member_user.user_last_name}`}
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
              />
              <Textarea
                label="Description"
                minRows={6}
                autosize={true}
                {...register("description", {
                  required: "This field is required",
                })}
                error={errors.description?.message}
              />
              <Button type="submit" size="md">
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
