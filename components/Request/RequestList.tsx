import { GetTeamRequestList } from "@/utils/queries-new";
import {
  Badge,
  Box,
  Center,
  Checkbox,
  Flex,
  Grid,
  Modal,
  Pagination,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";
import RequestFilter from "./RequestFilter";
import RequestItem from "./RequestItem";

// replace with context data
const tempData = [
  {
    form_fact_id: 2001,
    form_fact_user_id: "c227b796-b16c-437c-b553-14aaebd9d92f",
    form_fact_team_id: "915da775-861c-42f3-b473-6b775d7ec4b6",
    form_fact_field_id: 1,
    form_fact_response_id: 1999,
    form_fact_order_id: 1,
    form_fact_request_id: 1000,
    form_fact_form_id: 1,
    form_fact_request_status_id: "pending",
    user_id: "c227b796-b16c-437c-b553-14aaebd9d92f",
    user_created_at: "2023-01-09T02:40:32.094602+00:00",
    username: "dev+2",
    user_first_name: "dev+2",
    user_last_name: "",
    user_avatar_filepath: null,
    user_email: "dev+2@dodeca.com.ph",
    team_id: "915da775-861c-42f3-b473-6b775d7ec4b6",
    team_name: "default",
    team_logo_filepath: null,
    order_id: 1,
    order_field_id_list: [1, 2],
    order_last_updated: null,
    form_id: 1,
    form_name: "Request for Payment",
    form_created_at: "2023-01-09T02:40:32.094602+00:00",
    field_id: 1,
    field_name: "Mark things",
    request_field_type: "multiple",
    field_options: ["Option Sample 1", "Option Sample 2"],
    field_tooltip: "",
    field_is_required: false,
    response_id: 1999,
    response_value: "Option Sample 1",
    request_id: 1000,
    request_date_created: "2023-01-09T02:40:32.094602+00:00",
    request_title: "Request 1000",
    request_description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas blandit erat tortor, id elementum sem tempus et. Sed egestas eleifend tortor, sed pellentesque sem posuere non. Quisque elementum eros eget molestie finibus.",
    request_on_behalf_of: null,
    request_is_draft: false,
    request_attachment_filepath_list: ["1673403877641-Mobile View.png"],
    request_is_disabled: false,
    request_status_id: "pending",
  },
  {
    form_fact_id: 2000,
    form_fact_user_id: "c227b796-b16c-437c-b553-14aaebd9d92f",
    form_fact_team_id: "915da775-861c-42f3-b473-6b775d7ec4b6",
    form_fact_field_id: 2,
    form_fact_response_id: 1998,
    form_fact_order_id: 1,
    form_fact_request_id: 999,
    form_fact_form_id: 1,
    form_fact_request_status_id: "pending",
    user_id: "c227b796-b16c-437c-b553-14aaebd9d92f",
    user_created_at: "2023-01-09T02:40:32.094602+00:00",
    username: "dev+2",
    user_first_name: "dev+2",
    user_last_name: "",
    user_avatar_filepath: null,
    user_email: "dev+2@dodeca.com.ph",
    team_id: "915da775-861c-42f3-b473-6b775d7ec4b6",
    team_name: "default",
    team_logo_filepath: null,
    order_id: 1,
    order_field_id_list: [1, 2],
    order_last_updated: null,
    form_id: 1,
    form_name: "Request for Payment",
    form_created_at: "2023-01-09T02:40:32.094602+00:00",
    field_id: 2,
    field_name: "Mark things you want to buy",
    request_field_type: "multiple",
    field_options: ["Option Sample 1", "Option Sample 2"],
    field_tooltip: "",
    field_is_required: false,
    response_id: 1998,
    response_value: "Option Sample 2",
    request_id: 999,
    request_date_created: "2023-01-09T02:40:32.094602+00:00",
    request_title: "Request 999",
    request_description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas blandit erat tortor, id elementum sem tempus et. Sed egestas eleifend tortor, sed pellentesque sem posuere non. Quisque elementum eros eget molestie finibus.",
    request_on_behalf_of: null,
    request_is_draft: false,
    request_attachment_filepath_list: ["1673403877641-Mobile View.png"],
    request_is_disabled: false,
    request_status_id: "pending",
  },
  {
    form_fact_id: 1997,
    form_fact_user_id: "c227b796-b16c-437c-b553-14aaebd9d92f",
    form_fact_team_id: "915da775-861c-42f3-b473-6b775d7ec4b6",
    form_fact_field_id: 1,
    form_fact_response_id: 1995,
    form_fact_order_id: 1,
    form_fact_request_id: 998,
    form_fact_form_id: 1,
    form_fact_request_status_id: "pending",
    user_id: "c227b796-b16c-437c-b553-14aaebd9d92f",
    user_created_at: "2023-01-09T02:40:32.094602+00:00",
    username: "dev+2",
    user_first_name: "dev+2",
    user_last_name: "",
    user_avatar_filepath: null,
    user_email: "dev+2@dodeca.com.ph",
    team_id: "915da775-861c-42f3-b473-6b775d7ec4b6",
    team_name: "default",
    team_logo_filepath: null,
    order_id: 1,
    order_field_id_list: [1, 2],
    order_last_updated: null,
    form_id: 1,
    form_name: "Request for Payment",
    form_created_at: "2023-01-09T02:40:32.094602+00:00",
    field_id: 1,
    field_name: "Mark things",
    request_field_type: "multiple",
    field_options: ["Option Sample 1", "Option Sample 2"],
    field_tooltip: "",
    field_is_required: false,
    response_id: 1995,
    response_value: "Option Sample 1",
    request_id: 998,
    request_date_created: "2023-01-09T02:40:32.094602+00:00",
    request_title: "Request 998",
    request_description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas blandit erat tortor, id elementum sem tempus et. Sed egestas eleifend tortor, sed pellentesque sem posuere non. Quisque elementum eros eget molestie finibus.",
    request_on_behalf_of: null,
    request_is_draft: false,
    request_attachment_filepath_list: ["1673403877641-Mobile View.png"],
    request_is_disabled: false,
    request_status_id: "pending",
  },
];

const RequestList = () => {
  const [checked, setChecked] = useState<string[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<
    GetTeamRequestList[0] | null
  >(null);
  // pagination
  const [activePage, setActivePage] = useState(1);
  // show request
  const isMobile = useMediaQuery("(max-width: 700px)");

  return (
    <Box>
      <RequestFilter />
      <Grid mt="sm">
        <Grid.Col span="auto" p="0">
          <Paper shadow="xs" p="sm">
            <Checkbox.Group value={checked} onChange={setChecked}>
              <Stack spacing="xs" w="100%">
                {/* replace with context data */}
                {tempData.map((data) => (
                  <Box
                    key={data.request_id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderBottom: "1px solid #E9E9E9",
                    }}
                    pb="sm"
                  >
                    <Flex gap="sm">
                      <Checkbox value={data.request_title} />
                      <Box
                        onClick={() => {
                          setSelectedRequest(data as GetTeamRequestList[0]);
                        }}
                      >
                        <Text fw={500}>{data.request_title}</Text>
                        <Text c="dimmed" lineClamp={1}>
                          {data.request_description}
                        </Text>
                        <Text c="dimmed" fz="xs">
                          {data.request_date_created.slice(0, 10)}
                        </Text>
                      </Box>
                    </Flex>
                    <Badge
                      size="sm"
                      variant="filled"
                      color="blue"
                      w="100%"
                      maw="80px"
                    >
                      {data.request_status_id}
                    </Badge>
                  </Box>
                ))}
              </Stack>
            </Checkbox.Group>
            {/* change the total to the correct number of pages */}
            <Center>
              <Pagination
                page={activePage}
                onChange={setActivePage}
                total={tempData.length}
                mt="sm"
                size="sm"
              />
            </Center>
          </Paper>
        </Grid.Col>
        {selectedRequest ? (
          isMobile ? (
            <Modal
              opened={isMobile}
              withCloseButton={false}
              fullScreen
              padding={0}
              onClose={() => setSelectedRequest(null)}
            >
              <Box p="md">
                <RequestItem
                  request={selectedRequest}
                  setSelectedRequest={setSelectedRequest}
                />
              </Box>
            </Modal>
          ) : (
            <Grid.Col span={6} pt="0">
              <Paper shadow="xs" p="md">
                <RequestItem
                  request={selectedRequest}
                  setSelectedRequest={setSelectedRequest}
                />
              </Paper>
            </Grid.Col>
          )
        ) : null}
      </Grid>
    </Box>
  );
};

export default RequestList;
