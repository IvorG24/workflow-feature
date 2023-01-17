import RequestListContext from "@/contexts/RequestListContext";
import { GetTeamRequestList } from "@/utils/queries-new";
import { setBadgeColor } from "@/utils/request";
import {
  Badge,
  Box,
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
import { ceil } from "lodash";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

import RequestFilter from "./RequestFilter";
import RequestItem from "./RequestItem";

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

export const REQUEST_PER_PAGE = 7;

const RequestList = () => {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 700px)");
  const requestListContext = useContext(RequestListContext);
  const { requestList } = requestListContext;
  const [checked, setChecked] = useState<string[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null
  );
  const [activePage, setActivePage] = useState(1);
  const [requestListToDisplay, setRequestListToDisplay] = useState<
    ReducedRequestType[] | null
  >(null);

  useEffect(() => {
    const slicedRequest = requestList.slice(
      (activePage - 1) * REQUEST_PER_PAGE,
      activePage * REQUEST_PER_PAGE
    );
    // reduce requestList by request_id and add fields prop
    const initialFields: { label: string; value: string; type: string }[] = [];
    const initialValue = [{ ...slicedRequest[0], fields: initialFields }];

    const reducedRequestList = slicedRequest.reduce((acc, next) => {
      const match = acc.find((a) => a.request_id === next.request_id);
      const nextFields: ReducedRequestFieldType = {
        label: next.field_name as string,
        value: next.response_value as string,
        type: next.request_field_type as string,
      };

      if (match) {
        match.fields.push(nextFields as ReducedRequestFieldType);
      } else {
        acc.push({ ...next, fields: [nextFields] });
      }
      return acc;
    }, initialValue);
    setRequestListToDisplay(reducedRequestList as ReducedRequestType[]);
  }, [activePage, requestList]);

  useEffect(() => {
    setActivePage(router.query.page ? Number(router.query.page) : 1);
  }, [router.query.page]);

  const handlePagination = (activePage: number) => {
    setActivePage(activePage);
    router.push(
      {
        query: { ...router.query, page: activePage },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <Box>
      <RequestFilter />
      <Grid mt="sm">
        <Grid.Col span="auto" p="0">
          <Stack p="sm">
            <Checkbox.Group value={checked} onChange={setChecked}>
              <Stack spacing="xs" w="100%">
                {requestListToDisplay ? (
                  requestListToDisplay?.map((data) => (
                    <Box
                      key={data.request_id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #E9E9E9",
                      }}
                      pb="sm"
                    >
                      <Flex gap="sm" w="100%">
                        <Checkbox value={data.request_title as string} />
                        <Box
                          w="100%"
                          onClick={() => {
                            setSelectedRequestId(data.request_id as number);
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
                        variant="light"
                        color={setBadgeColor(data.request_status_id as string)}
                        w="100%"
                        maw="80px"
                      >
                        {data.request_status_id}
                      </Badge>
                    </Box>
                  ))
                ) : (
                  <Box>No results found.</Box>
                )}
              </Stack>
            </Checkbox.Group>
            {ceil((requestList.length as number) / REQUEST_PER_PAGE) >= 1 ? (
              <Pagination
                sx={{ alignSelf: "flex-end" }}
                size="sm"
                page={activePage}
                onChange={handlePagination}
                total={ceil((requestList.length as number) / REQUEST_PER_PAGE)}
              />
            ) : null}
          </Stack>
        </Grid.Col>
        {selectedRequestId ? (
          isMobile ? (
            <Modal
              opened={isMobile}
              withCloseButton={false}
              fullScreen
              padding={0}
              onClose={() => {
                setSelectedRequestId(null);
              }}
            >
              <Box p="xs">
                <RequestItem
                  selectedRequestId={selectedRequestId}
                  setSelectedRequestId={setSelectedRequestId}
                />
              </Box>
            </Modal>
          ) : (
            <Grid.Col span={6} pt="0">
              <Paper shadow="xs" p="md">
                <RequestItem
                  selectedRequestId={selectedRequestId}
                  setSelectedRequestId={setSelectedRequestId}
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
