import ActiveTeamContext from "@/contexts/ActiveTeamContext";
import RequestListContext from "@/contexts/RequestListContext";
import { TeamMemberRole } from "@/utils/types-new";
import { ActionIcon } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconDownload } from "@tabler/icons";
import { parse } from "json2csv";
import { startCase } from "lodash";
import { useContext } from "react";

const ExportToCsv = () => {
  const requestListContext = useContext(RequestListContext);
  const { requestList, requestWithApproverList } = requestListContext;
  const { teamMemberList } = useContext(ActiveTeamContext);
  const userIdRoleDictionary = teamMemberList.reduce(
    (acc, member) => ({
      ...acc,
      [`${member.user_id}`]: member.member_role_id,
    }),
    {}
  ) as { [key: string]: TeamMemberRole };

  // Prerequisite: requestList must be an array of objects.
  const handleExportRequestListToCSV = async () => {
    const data = requestList.map((request) => {
      const approverList =
        requestWithApproverList[request.request_id as number];
      const approverIdWithStatus = approverList.find((approver) => {
        const isApprover =
          userIdRoleDictionary[approver.approver_id] === "owner" ||
          userIdRoleDictionary[approver.approver_id] === "admin";
        return isApprover;
      });
      const approver = teamMemberList.find(
        (member) => member.user_id === approverIdWithStatus?.approver_id
      )?.user_email;
      const purchaserIdWithStatus = approverList.find((approver) => {
        const isPurchaser =
          userIdRoleDictionary[approver.approver_id] === "purchaser";
        return isPurchaser;
      });
      const purchaser = teamMemberList.find(
        (member) => member.user_id === purchaserIdWithStatus?.approver_id
      )?.user_email;

      const id = request.request_id;
      const title = request.request_title;
      const description = request.request_description;
      const data_created = request.request_date_created?.slice(0, 10);
      const status = startCase(request.form_fact_request_status_id || "");
      const team = request.team_name;

      return {
        id,
        team,
        title,
        description,
        data_created,
        status,
        approver,
        purchaser,
      };
    });

    if (data.length === 0) {
      showNotification({
        title: "Error!",
        message: "No data to export.",
        color: "red",
      });
      return;
    }
    const team = teamMemberList[0].team_name;
    const fields = Object.keys(data[0]);
    const opts = { fields };
    const csv = parse(data, opts);
    window.URL = window.webkitURL || window.URL;
    const contentType = "text/csv";
    const csvFile = new Blob([csv], { type: contentType });
    const a = document.createElement("a");
    const currentDate = new Date().toISOString().slice(0, 10);
    const filename = `${currentDate}_${team}_requests.csv`;
    a.download = filename;
    a.href = window.URL.createObjectURL(csvFile);
    a.dataset.downloadurl = [contentType, a.download, a.href].join(":");
    document.body.appendChild(a);
    a.click();
  };

  return (
    <ActionIcon
      variant="transparent"
      title="Export to CSV"
      aria-label="Export to CSV"
      onClick={handleExportRequestListToCSV}
    >
      <IconDownload size={16} />
    </ActionIcon>
  );
};

export default ExportToCsv;
