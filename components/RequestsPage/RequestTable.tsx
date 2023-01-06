import RequestListContext from "@/contexts/RequestListContext";
import { setBadgeColor } from "@/utils/request";
import { Avatar, Badge, Group, Paper, ScrollArea, Table } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { startCase } from "lodash";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import Request from "../Request/Request";
import styles from "./RequestTable.module.scss";

const RequestTable = () => {
  const { width } = useViewportSize();
  const router = useRouter();
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null
  );
  const requestListContext = useContext(RequestListContext);

  const { requestIdList, requestList, requestApproverList } =
    requestListContext || {};

  const handleSetSelectedRequest = async (requestId: number) => {
    if (!requestList) {
      showNotification({
        title: "Error!",
        message: "No data in request list.",
        color: "red",
      });
      return;
    }

    // const request = requestList.filter(
    //   (request) => request.request_id === requestId
    // );

    if (width < 1200) {
      router.push(`/t/${router.query.tid}/requests/${requestId}`);
    } else {
      setSelectedRequestId(requestId);
    }
  };

  // Loop per requestIdList and get request data from requestList.
  const rows =
    requestIdList &&
    requestIdList.map((requestId) => {
      const request =
        requestList &&
        requestList.find((request) => request.request_id === requestId);

      if (!request) return null;

      // Get request requestApproverList.
      const approverList = requestApproverList?.filter(
        (requestApprover) => requestApprover.request_id === request.request_id
      );

      const approver = approverList?.find((approver) => approver.is_approver);
      // const purchaser = approverList?.find((approver) => approver.is_purchaser);

      const status = request.form_fact_request_status_id;

      return (
        <tr
          key={request.request_id}
          className={styles.row}
          onClick={() => handleSetSelectedRequest(request.request_id as number)}
        >
          <td>{request.request_id}</td>
          <td>{request.request_title}</td>
          <td>
            <Badge color={setBadgeColor(status as string)}>
              {startCase(`${status}`)}
            </Badge>
          </td>
          <td>{request.request_date_created?.slice(0, 10)}</td>
          <td>
            <Group>
              <Avatar radius={100} />
              {request.username}
            </Group>
          </td>
          <td>
            <Group>
              <Avatar radius={100} />
              {approver?.username}
            </Group>
          </td>
        </tr>
      );
    });

  return (
    <Group align="flex-start">
      <ScrollArea type="scroll">
        <Table
          mt="xl"
          striped
          highlightOnHover
          className={styles.tableContainer}
        >
          <thead>
            <tr>
              <th>REF</th>
              <th>Request Title</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Requested By</th>
              <th>Approvers</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </ScrollArea>
      {/* todo: convert into a component and move outside request table*/}
      {selectedRequestId ? (
        <Paper shadow="xl" className={styles.requestContainer}>
          <Request
            view="split"
            selectedRequestId={selectedRequestId}
            setSelectedRequestId={setSelectedRequestId}
          />
        </Paper>
      ) : null}
    </Group>
  );
};

export default RequestTable;
