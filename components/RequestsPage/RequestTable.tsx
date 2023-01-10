import ActiveTeamContext from "@/contexts/ActiveTeamContext";
import FileUrlListContext from "@/contexts/FileUrlListContext";
import RequestListContext from "@/contexts/RequestListContext";
import { setBadgeColor } from "@/utils/request";
import { TeamMemberRole } from "@/utils/types-new";
import { Avatar, Badge, Group, Paper, ScrollArea, Table } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { startCase } from "lodash";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import Request from "../Request/Request";
import { REQUEST_PER_PAGE } from "./RequestList";
import styles from "./RequestTable.module.scss";

const RequestTable = () => {
  const { width } = useViewportSize();
  const router = useRouter();
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null
  );
  const requestListContext = useContext(RequestListContext);
  const activeTeamContext = useContext(ActiveTeamContext);
  const fileUrlListContext = useContext(FileUrlListContext);
  const userIdRoleDictionary = activeTeamContext.reduce(
    (acc, member) => ({
      ...acc,
      [`${member.user_id}`]: member.member_role_id,
    }),
    {}
  ) as { [key: string]: TeamMemberRole };

  //   🚀 ~ file: RequestTable.tsx:28 ~ RequestTable ~ userIdRoleDictionary {
  //   "34b93dce-ee49-4b42-b7d1-0ef1158b859c": "member",
  //   "32c35aeb-403d-4278-874b-596d7454c731": "purchaser",
  //   "3815e094-ede6-476d-aa5f-ab9fd8ede98f": "member",
  //   "182e6b49-fed7-42f7-a864-fafe439e4bf6": "admin",
  //   "c227b796-b16c-437c-b553-14aaebd9d92f": "member",
  //   "87354241-1f44-40d4-b6f9-b394022a897b": "member",
  //   "9326cd10-b413-4362-b7a0-b5d37efafdc5": "member",
  //   "00320854-19c6-49da-845f-133886c04f94": "member",
  //   "45cde79e-053b-4d63-b107-e4fd890e2a17": "member",
  //   "3f340858-08a7-4c8a-9984-3f575aed3c41": "member"
  // }

  const { requestList, requestWithApproverList } = requestListContext;
  const page = router.query.page ? Number(router.query.page) : 1;
  const limit = REQUEST_PER_PAGE;
  const requestListToDisplay = requestList.slice(
    (page - 1) * limit,
    page * limit
  );

  const handleSetSelectedRequest = async (requestId: number) => {
    if (width < 1200) {
      router.push(`/t/${router.query.tid}/requests/${requestId}`);
    } else {
      setSelectedRequestId(requestId);
    }
  };

  // Loop per requestIdList and get request data from requestList.
  const rows = requestListToDisplay.map((request) => {
    const approverList = requestWithApproverList[request.request_id as number];
    const approverIdWithStatus = approverList.find((approver) => {
      const isApprover =
        userIdRoleDictionary[approver.approver_id] === "owner" ||
        userIdRoleDictionary[approver.approver_id] === "admin";
      return isApprover;
    });
    const approver = activeTeamContext.find(
      (member) => member.user_id === approverIdWithStatus?.approver_id
    );

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
            <Avatar
              radius={100}
              src={fileUrlListContext?.avatarUrlList[request.user_id as string]}
            />
            {request.username}
          </Group>
        </td>
        {approver && (
          <td>
            <Group>
              <Avatar
                radius={100}
                src={
                  fileUrlListContext?.avatarUrlList[approver.user_id as string]
                }
              />
              {approver.username}
            </Group>
          </td>
        )}
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
