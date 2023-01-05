import { setBadgeColor } from "@/utils/request";
import type { RequestType } from "@/utils/types";
import { Avatar, Badge, Group, Paper, ScrollArea, Table } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { startCase } from "lodash";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";
import Request from "../Request/Request";
import styles from "./RequestTable.module.scss";

type Props = {
  requestList: RequestType[];
  selectedRequest: RequestType | null;
  setSelectedRequest: Dispatch<SetStateAction<RequestType | null>>;
  setRequestList?: Dispatch<SetStateAction<RequestType[]>>;
  setIsLoading?: Dispatch<SetStateAction<boolean>>;
};

const RequestTable = ({
  requestList,
  selectedRequest,
  setSelectedRequest,
  setRequestList,
  setIsLoading,
}: Props) => {
  const { width } = useViewportSize();
  const router = useRouter();

  const handleSetSelectedRequest = async (request: RequestType) => {
    if (width < 1200) {
      router.push(`/t/${router.query.tid}/requests/${request.request_id}`);
    } else {
      setSelectedRequest(request);
    }
  };

  const rows = requestList.map((request) => {
    return (
      <tr
        key={request.request_id}
        className={styles.row}
        onClick={() => handleSetSelectedRequest(request)}
      >
        <td>{request.request_id}</td>
        <td>{request.request_title}</td>
        <td data-cy="request-status">
          <Badge color={setBadgeColor(`${request.request_status}`)}>
            {startCase(`${request.request_status}`)}
          </Badge>
        </td>
        <td>{request.request_created_at?.slice(0, 10)}</td>
        <td>
          <Group>
            <Avatar radius={100} />
            {request.owner.full_name}
          </Group>
        </td>
        <td>
          <Group>
            <Avatar radius={100} />
            {request.approver.full_name}
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
      {selectedRequest ? (
        <Paper shadow="xl" className={styles.requestContainer}>
          <Request
            view="split"
            selectedRequest={selectedRequest}
            setSelectedRequest={setSelectedRequest}
            setRequestList={setRequestList}
            setIsLoading={setIsLoading}
          />
        </Paper>
      ) : null}
    </Group>
  );
};

export default RequestTable;
