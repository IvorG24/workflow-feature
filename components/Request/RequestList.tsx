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
import { useEffect, useState } from "react";
import RequestFilter from "./RequestFilter";
import RequestItem from "./RequestItem";

// replace with context data
const dataWithResponse = [
  {
    form_fact_id: 3012,
    form_fact_user_id: "2bab63b7-1115-4ca5-aa08-f8f2fc49ef4e",
    form_fact_team_id: "6caef095-ff7e-419d-b27e-4b7c5ba22880",
    form_fact_field_id: 4,
    form_fact_response_id: 3004,
    form_fact_order_id: 2,
    form_fact_request_id: 1002,
    form_fact_form_id: 2,
    form_fact_request_status_id: "pending",
    user_id: "2bab63b7-1115-4ca5-aa08-f8f2fc49ef4e",
    user_created_at: "2023-01-11T02:22:59.380108+00:00",
    username: "sejidi1552",
    user_first_name: "sejidi1552",
    user_last_name: "",
    user_avatar_filepath: null,
    user_email: "sejidi1552@irebah.com",
    user_signature_filepath: "/image/dummy-folder/fake-signature.png",
    team_id: "6caef095-ff7e-419d-b27e-4b7c5ba22880",
    team_name: "default",
    team_logo_filepath: null,
    order_id: 2,
    order_field_id_list: [4, 5, 6, 7, 8],
    order_last_updated: null,
    form_id: 2,
    form_name: "TEST",
    form_created_at: "2023-01-11T13:34:41.418329+00:00",
    field_id: 4,
    field_name: "TEST",
    request_field_type: "section",
    field_options: [],
    field_tooltip: "",
    field_is_required: false,
    response_id: 3004,
    response_value: "",
    request_id: 1002,
    request_date_created: "2023-01-11T13:37:39.543438+00:00",
    request_title: "TEST 2",
    request_description:
      "Aenean lacinia purus non ante pellentesque suscipit. In augue mi, pretium vitae massa vitae, lobortis vehicula felis. Aliquam sit amet nibh at purus eleifend feugiat.",
    request_on_behalf_of: "",
    request_is_draft: false,
    request_attachment_filepath_list: ["1673444257171-Team Page.png"],
    request_is_disabled: false,
    request_status_id: "pending",
  },
  {
    user_signature_filepath: "/image/dummy-folder/fake-signature.png",
    form_fact_id: 3013,
    form_fact_user_id: "2bab63b7-1115-4ca5-aa08-f8f2fc49ef4e",
    form_fact_team_id: "6caef095-ff7e-419d-b27e-4b7c5ba22880",
    form_fact_field_id: 5,
    form_fact_response_id: 3005,
    form_fact_order_id: 2,
    form_fact_request_id: 1002,
    form_fact_form_id: 2,
    form_fact_request_status_id: "pending",
    user_id: "2bab63b7-1115-4ca5-aa08-f8f2fc49ef4e",
    user_created_at: "2023-01-11T02:22:59.380108+00:00",
    username: "sejidi1552",
    user_first_name: "sejidi1552",
    user_last_name: "",
    user_avatar_filepath: null,
    user_email: "sejidi1552@irebah.com",
    team_id: "6caef095-ff7e-419d-b27e-4b7c5ba22880",
    team_name: "default",
    team_logo_filepath: null,
    order_id: 2,
    order_field_id_list: [4, 5, 6, 7, 8],
    order_last_updated: null,
    form_id: 2,
    form_name: "TEST",
    form_created_at: "2023-01-11T13:34:41.418329+00:00",
    field_id: 5,
    field_name: "TEXT",
    request_field_type: "text",
    field_options: [],
    field_tooltip: "",
    field_is_required: false,
    response_id: 3005,
    response_value: "asds",
    request_id: 1002,
    request_date_created: "2023-01-11T13:37:39.543438+00:00",
    request_title: "TEST 2",
    request_description:
      "Aenean lacinia purus non ante pellentesque suscipit. In augue mi, pretium vitae massa vitae, lobortis vehicula felis. Aliquam sit amet nibh at purus eleifend feugiat.",
    request_on_behalf_of: "",
    request_is_draft: false,
    request_attachment_filepath_list: ["1673444257171-Team Page.png"],
    request_is_disabled: false,
    request_status_id: "pending",
  },
  {
    user_signature_filepath: "/image/dummy-folder/fake-signature.png",
    form_fact_id: 3014,
    form_fact_user_id: "2bab63b7-1115-4ca5-aa08-f8f2fc49ef4e",
    form_fact_team_id: "6caef095-ff7e-419d-b27e-4b7c5ba22880",
    form_fact_field_id: 6,
    form_fact_response_id: 3006,
    form_fact_order_id: 2,
    form_fact_request_id: 1002,
    form_fact_form_id: 2,
    form_fact_request_status_id: "pending",
    user_id: "2bab63b7-1115-4ca5-aa08-f8f2fc49ef4e",
    user_created_at: "2023-01-11T02:22:59.380108+00:00",
    username: "sejidi1552",
    user_first_name: "sejidi1552",
    user_last_name: "",
    user_avatar_filepath: null,
    user_email: "sejidi1552@irebah.com",
    team_id: "6caef095-ff7e-419d-b27e-4b7c5ba22880",
    team_name: "default",
    team_logo_filepath: null,
    order_id: 2,
    order_field_id_list: [4, 5, 6, 7, 8],
    order_last_updated: null,
    form_id: 2,
    form_name: "TEST",
    form_created_at: "2023-01-11T13:34:41.418329+00:00",
    field_id: 6,
    field_name: "NUMBER",
    request_field_type: "number",
    field_options: [],
    field_tooltip: "",
    field_is_required: false,
    response_id: 3006,
    response_value: "2",
    request_id: 1002,
    request_date_created: "2023-01-11T13:37:39.543438+00:00",
    request_title: "TEST 2",
    request_description:
      "Aenean lacinia purus non ante pellentesque suscipit. In augue mi, pretium vitae massa vitae, lobortis vehicula felis. Aliquam sit amet nibh at purus eleifend feugiat.",
    request_on_behalf_of: "",
    request_is_draft: false,
    request_attachment_filepath_list: ["1673444257171-Team Page.png"],
    request_is_disabled: false,
    request_status_id: "pending",
  },
  {
    user_signature_filepath: "/image/dummy-folder/fake-signature.png",
    form_fact_id: 3015,
    form_fact_user_id: "2bab63b7-1115-4ca5-aa08-f8f2fc49ef4e",
    form_fact_team_id: "6caef095-ff7e-419d-b27e-4b7c5ba22880",
    form_fact_field_id: 7,
    form_fact_response_id: 3007,
    form_fact_order_id: 2,
    form_fact_request_id: 1002,
    form_fact_form_id: 2,
    form_fact_request_status_id: "pending",
    user_id: "2bab63b7-1115-4ca5-aa08-f8f2fc49ef4e",
    user_created_at: "2023-01-11T02:22:59.380108+00:00",
    username: "sejidi1552",
    user_first_name: "sejidi1552",
    user_last_name: "",
    user_avatar_filepath: null,
    user_email: "sejidi1552@irebah.com",
    team_id: "6caef095-ff7e-419d-b27e-4b7c5ba22880",
    team_name: "default",
    team_logo_filepath: null,
    order_id: 2,
    order_field_id_list: [4, 5, 6, 7, 8],
    order_last_updated: null,
    form_id: 2,
    form_name: "TEST",
    form_created_at: "2023-01-11T13:34:41.418329+00:00",
    field_id: 7,
    field_name: "EMAIl",
    request_field_type: "email",
    field_options: [],
    field_tooltip: "",
    field_is_required: false,
    response_id: 3007,
    response_value: "daratis905@corylan.com",
    request_id: 1002,
    request_date_created: "2023-01-11T13:37:39.543438+00:00",
    request_title: "TEST 2",
    request_description:
      "Aenean lacinia purus non ante pellentesque suscipit. In augue mi, pretium vitae massa vitae, lobortis vehicula felis. Aliquam sit amet nibh at purus eleifend feugiat.",
    request_on_behalf_of: "",
    request_is_draft: false,
    request_attachment_filepath_list: ["1673444257171-Team Page.png"],
    request_is_disabled: false,
    request_status_id: "pending",
  },
  {
    user_signature_filepath: "/image/dummy-folder/fake-signature.png",
    form_fact_id: 3016,
    form_fact_user_id: "2bab63b7-1115-4ca5-aa08-f8f2fc49ef4e",
    form_fact_team_id: "6caef095-ff7e-419d-b27e-4b7c5ba22880",
    form_fact_field_id: 8,
    form_fact_response_id: 3008,
    form_fact_order_id: 2,
    form_fact_request_id: 1002,
    form_fact_form_id: 2,
    form_fact_request_status_id: "pending",
    user_id: "2bab63b7-1115-4ca5-aa08-f8f2fc49ef4e",
    user_created_at: "2023-01-11T02:22:59.380108+00:00",
    username: "sejidi1552",
    user_first_name: "sejidi1552",
    user_last_name: "",
    user_avatar_filepath: null,
    user_email: "sejidi1552@irebah.com",
    team_id: "6caef095-ff7e-419d-b27e-4b7c5ba22880",
    team_name: "default",
    team_logo_filepath: null,
    order_id: 2,
    order_field_id_list: [4, 5, 6, 7, 8],
    order_last_updated: null,
    form_id: 2,
    form_name: "TEST",
    form_created_at: "2023-01-11T13:34:41.418329+00:00",
    field_id: 8,
    field_name: "SLIDER",
    request_field_type: "slider",
    field_options: [],
    field_tooltip: "",
    field_is_required: false,
    response_id: 3008,
    response_value: "3",
    request_id: 1002,
    request_date_created: "2023-01-11T13:37:39.543438+00:00",
    request_title: "TEST 2",
    request_description:
      "Aenean lacinia purus non ante pellentesque suscipit. In augue mi, pretium vitae massa vitae, lobortis vehicula felis. Aliquam sit amet nibh at purus eleifend feugiat.",
    request_on_behalf_of: "",
    request_is_draft: false,
    request_attachment_filepath_list: ["1673444257171-Team Page.png"],
    request_is_disabled: false,
    request_status_id: "pending",
  },
];

export type ReducedRequestFieldType = {
  label: string;
  value: string;
  type: string;
};

export type ReducedRequestType = GetTeamRequestList[0] & {
  user_signature_filepath: string;
} & {
  fields: ReducedRequestFieldType[];
};

const RequestList = () => {
  const [checked, setChecked] = useState<string[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<
    GetTeamRequestList[0] | null
  >(null);
  const [requestList, setRequestList] = useState<ReducedRequestType[] | null>(
    null
  );
  // pagination
  const [activePage, setActivePage] = useState(1);
  // show request
  const isMobile = useMediaQuery("(max-width: 700px)");

  // reduce the requests array by request_id and add fields prop
  useEffect(() => {
    const initialFields: { label: string; value: string; type: string }[] = [];
    const initialValue = [{ ...dataWithResponse[0], fields: initialFields }];
    const reducedRequests = dataWithResponse.reduce((acc, next) => {
      const match = acc.find((a) => a.request_id === next.request_id);
      const nextFields = {
        label: next.field_name,
        value: next.response_value,
        type: next.request_field_type,
      };

      if (match) {
        match.fields.push(nextFields);
      } else {
        acc.push({ ...next, fields: [nextFields] });
      }

      return acc;
    }, initialValue);
    setRequestList(reducedRequests as ReducedRequestType[]);
  }, []);

  return (
    <Box>
      <RequestFilter />
      <Grid mt="sm">
        <Grid.Col span="auto" p="0">
          <Paper shadow="xs" p="sm">
            <Checkbox.Group value={checked} onChange={setChecked}>
              <Stack spacing="xs" w="100%">
                {/* replace with context data */}
                {requestList &&
                  requestList.map((data) => (
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
                        <Checkbox value={data.request_title as string} />
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
                            {data.request_date_created?.slice(0, 10)}
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
                total={dataWithResponse.length}
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
                  request={selectedRequest as ReducedRequestType}
                  setSelectedRequest={setSelectedRequest}
                />
              </Box>
            </Modal>
          ) : (
            <Grid.Col span={6} pt="0">
              <Paper shadow="xs" p="md">
                <RequestItem
                  request={selectedRequest as ReducedRequestType}
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
