import { TICKET_CATEGORY_LIST } from "@/utils/constant";
import { getAvatarColor } from "@/utils/styling";
import { CreateTicketPageOnLoad } from "@/utils/types";
import {
  Avatar,
  Box,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  Paper,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import moment from "moment";
import { useState } from "react";
import TicketRequestCustomCSIForm from "../TicketRequestCustomCSIForm/TicketRequestCustomCSIForm";
import TicketForm from "./TicketForm";

type Props = {
  member: CreateTicketPageOnLoad["member"];
};

const CreateTicketPage = ({ member }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState<string | null>(null);

  const getTicketForm = () => {
    switch (category) {
      case "Request Custom CSI":
        return <TicketRequestCustomCSIForm setIsLoading={setIsLoading} />;
      default:
        return (
          <TicketForm
            category={category}
            memberId={`${member?.team_member_id}`}
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
              <Text>{moment().format("YYYY-MM-DD")}</Text>
            </Stack>
          </Group>
          <Divider />
          <Box pos="relative">
            <LoadingOverlay visible={isLoading} overlayBlur={2} />

            <Select
              placeholder="Select a ticket type"
              value={category}
              onChange={setCategory}
              data={TICKET_CATEGORY_LIST.map(
                (category) => category.categoryName
              )}
              required={true}
              readOnly={isLoading}
            />

            {getTicketForm()}
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default CreateTicketPage;
