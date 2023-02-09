import { GetTeamRequestList } from "@/utils/queries";
import moment from "moment";

import { Badge, Box, createStyles, Flex, Group, Text } from "@mantine/core";
import { useRouter } from "next/router";

export type RequestListProps = {
  requestList: GetTeamRequestList;
};

const useStyles = createStyles((theme) => ({
  card: {
    // if screen is sm or up, width is 400.

    [theme.fn.largerThan("sm")]: {
      width: 400,
    },
  },
}));

function RequestListArchived({ requestList }: RequestListProps) {
  const router = useRouter();
  const { classes } = useStyles();

  return (
    <>
      <Text size="xl" mb="xl" weight="bolder">
        Requests
      </Text>
      {/* <Flex direction="column" align="center"> */}
      <Group position="center">
        {requestList.map((request) => (
          <Box
            className={classes.card}
            component="a"
            key={request.request_id}
            // mt="md"
            // mb="md"
            p="md"
            h="185px"
            style={{ border: "1px solid #ccc", boxShadow: "2px 2px 5px #ccc" }}
            onClick={() =>
              router.push(
                `/teams/${router.query.teamName}/requests/${request.request_id}`
              )
            }
            styles={{
              "&:hover": {
                cursor: "pointer",
                boxShadow: "2px 2px 5px #666",
              },
            }}
          >
            {request.request_is_cancelled && (
              <Badge color="gray">Cancelled</Badge>
            )}

            <Text size="lg" weight="bold" m={0}>
              {request.form_name as string}
            </Text>
            <Text size="lg" weight="bold" m={0}>
              {request.request_title}
            </Text>
            <Text size="md" mt="sm" mb="sm">
              {request.request_description}
            </Text>
            <Flex justify="space-between" wrap="wrap" color="#666">
              <Text mr="sm">Created by: {request.username}</Text>
              <Text mr="sm">
                {moment(request.request_date_created as string).fromNow()}
              </Text>
              {request.form_fact_request_status_id === "pending" && (
                <Badge>Pending</Badge>
              )}
              {request.form_fact_request_status_id === "approved" && (
                <Badge color="green">Approved</Badge>
              )}
              {request.form_fact_request_status_id === "rejected" && (
                <Badge color="red">Rejected</Badge>
              )}
            </Flex>
          </Box>
        ))}
      </Group>
    </>
  );
}

export default RequestListArchived;
