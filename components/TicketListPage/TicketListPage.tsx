import { TicketListItemType } from "@/pages/team-requests/tickets";
import { TeamMemberWithUserType } from "@/utils/types";
import {
  Alert,
  Box,
  Container,
  Divider,
  Flex,
  Grid,
  Loader,
  LoadingOverlay,
  Pagination,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import TicketListFilter from "./TicketListFilter";
import TicketListItem from "./TicketListItem";

export type FilterFormValues = {
  search: string;
  requesterList: string[];
  approverList: string[];
  categoryList: string[];
  status: string[];
  isAscendingSort: boolean;
};

type Props = {
  ticketList: TicketListItemType[];
  teamMemberList: TeamMemberWithUserType[];
};

const TEMP_DEFAULT_TICKET_LIST_LIMIT = 13;
export const TEMP_DEFAULT_TICKET_CATEGORY_LIST = ["Item Request", "General"];

const TicketListPage = ({
  ticketList: inititalTicketList,
  teamMemberList,
}: Props) => {
  const [activePage, setActivePage] = useState(1);
  const [isFetchingTicketList, setIsFetchingTicketList] = useState(false);
  const [ticketList, setTicketList] = useState(inititalTicketList);

  const filterFormMethods = useForm<FilterFormValues>({
    defaultValues: {
      search: "",
      requesterList: [],
      approverList: [],
      categoryList: [],
      status: [],
      isAscendingSort: false,
    },
    mode: "onChange",
  });

  const { handleSubmit, getValues } = filterFormMethods;

  const handleFilterTicketList = async (
    {
      search,
      requesterList,
      approverList,
      categoryList,
      status,
      isAscendingSort,
    }: FilterFormValues = getValues()
  ) => {
    try {
      setIsFetchingTicketList(true);
      console.log(
        search,
        requesterList,
        approverList,
        categoryList,
        status,
        isAscendingSort
      );

      setTicketList(ticketList);
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingTicketList(false);
    }
  };

  return (
    <Container maw={1300} h="100%">
      <Flex align="center" gap="xl" wrap="wrap">
        <Box>
          <Title order={4}>Ticket List Page</Title>
          <Text> Manage your team requests here.</Text>
        </Box>
      </Flex>
      <Box my="sm">
        <FormProvider {...filterFormMethods}>
          <form onSubmit={handleSubmit(handleFilterTicketList)}>
            <TicketListFilter
              categoryList={TEMP_DEFAULT_TICKET_CATEGORY_LIST}
              handleFilterTicketList={handleFilterTicketList}
              teamMemberList={teamMemberList}
            />
          </form>
        </FormProvider>
      </Box>
      <Box h="fit-content" pos="relative">
        <LoadingOverlay
          visible={isFetchingTicketList}
          overlayBlur={0}
          overlayOpacity={0.2}
          loader={<Loader variant="dots" />}
        />
        {ticketList.length > 0 ? (
          <Paper withBorder>
            <ScrollArea h="fit-content" type="auto">
              <Stack spacing={0} miw={1074}>
                <Box
                  sx={(theme) => ({
                    backgroundColor:
                      theme.colorScheme === "dark"
                        ? theme.colors.dark[5]
                        : theme.colors.gray[1],
                  })}
                >
                  <Grid m={0} px="sm" justify="space-between">
                    <Grid.Col span={2}>
                      <Text weight={600}>Ticket ID</Text>
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <Text weight={600}>Title</Text>
                    </Grid.Col>
                    <Grid.Col span="auto">
                      <Text weight={600}>Category</Text>
                    </Grid.Col>
                    <Grid.Col span={1}>
                      <Text weight={600}>Status</Text>
                    </Grid.Col>

                    <Grid.Col span="auto" offset={0.5}>
                      <Text weight={600} pl={8}>
                        Requester
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={1}>
                      <Text weight={600}>Approver</Text>
                    </Grid.Col>
                    <Grid.Col span="content">
                      <Text weight={600}>Date Created</Text>
                    </Grid.Col>
                    <Grid.Col span="content">
                      <Text weight={600}>View</Text>
                    </Grid.Col>
                  </Grid>
                  <Divider />
                </Box>
                {ticketList.map((ticket, idx) => (
                  <Box key={ticket.ticket_id}>
                    <TicketListItem ticket={ticket} />
                    {idx + 1 < TEMP_DEFAULT_TICKET_LIST_LIMIT ? (
                      <Divider />
                    ) : null}
                  </Box>
                ))}
              </Stack>
            </ScrollArea>
          </Paper>
        ) : (
          <Text align="center" size={24} weight="bolder" color="dimmed">
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              color="orange"
              mt="xs"
            >
              No tickets found.
            </Alert>
          </Text>
        )}
      </Box>

      <Flex justify="flex-end">
        <Pagination
          value={activePage}
          onChange={setActivePage}
          total={Math.ceil(ticketList.length / TEMP_DEFAULT_TICKET_LIST_LIMIT)}
          mt="xl"
        />
      </Flex>
    </Container>
  );
};

export default TicketListPage;
