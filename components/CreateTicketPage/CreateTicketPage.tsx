import { getTicketForm } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { formatDate } from "@/utils/constant";
import { Database } from "@/utils/database";
import { getAvatarColor } from "@/utils/styling";
import { CreateTicketFormValues, CreateTicketPageOnLoad } from "@/utils/types";
import {
  Avatar,
  Box,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  Paper,
  Select,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import TicketRequestCustomCSIForm from "../TicketRequestCustomCSIForm/TicketRequestCustomCSIForm";
import TicketRequestItemCSIForm from "../TicketRequestItemCSIForm/TicketRequestItemCSIForm";
import TicketForm from "./TicketForm";

type Props = {
  member: CreateTicketPageOnLoad["member"];
  categorylist: CreateTicketPageOnLoad["categoryList"];
};

const CreateTicketPage = ({ member, categorylist }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const activeTeam = useActiveTeam();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingForm, setIsFetchingForm] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [ticketForm, setTicketForm] = useState<CreateTicketFormValues | null>(
    null
  );

  const categoryOptions = categorylist.map(
    ({ ticket_category }) => ticket_category
  );

  const handleCategoryChange = async (category: string | null) => {
    try {
      setIsFetchingForm(true);
      if (!category) return;
      const ticketFormData = await getTicketForm(supabaseClient, {
        category,
        teamId: activeTeam.team_id,
      });
      setTicketForm(ticketFormData);
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingForm(false);
    }
  };

  const renderTicketForm = () => {
    switch (category) {
      case "Request Custom CSI":
        return (
          <TicketRequestCustomCSIForm
            category={category}
            ticketForm={ticketForm}
            setIsLoading={setIsLoading}
          />
        );
      case "Request Item CSI":
        return (
          <TicketRequestItemCSIForm
            category={category}
            ticketForm={ticketForm}
            setIsLoading={setIsLoading}
          />
        );
      default:
        return (
          <TicketForm
            category={category}
            ticketForm={ticketForm}
            setIsLoading={setIsLoading}
          />
        );
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
              <Text>{formatDate(new Date())}</Text>
            </Stack>
          </Group>
          <Divider />
          <Box pos="relative">
            <LoadingOverlay visible={isLoading} overlayBlur={2} />

            <Select
              placeholder="Select a ticket category"
              value={category}
              onChange={(value) => {
                setCategory(value);
                if (value) handleCategoryChange(value);
              }}
              data={categoryOptions}
              required={true}
              readOnly={isLoading}
            />

            {!isFetchingForm ? (
              renderTicketForm()
            ) : (
              <Box>
                <Skeleton height={14} mt="md" w="40%" radius="xs" />
                <Skeleton height={32} mt={6} radius="xs" />
                <Skeleton height={14} mt="md" w="40%" radius="xs" />
                <Skeleton height={200} mt={6} radius="xs" />

                <Skeleton height={32} mt="md" radius="xs" />
              </Box>
            )}
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default CreateTicketPage;
