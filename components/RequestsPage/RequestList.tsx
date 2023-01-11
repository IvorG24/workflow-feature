import ActiveTeamContext from "@/contexts/ActiveTeamContext";
import ActiveTeamFormListContext from "@/contexts/ActiveTeamFormListContext";
import RequestListContext from "@/contexts/RequestListContext";
import { RequestStatus, TeamMemberRole } from "@/utils/types-new";
import {
  ActionIcon,
  Group,
  Pagination,
  Select,
  SelectItem,
  Stack,
  TextInput,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconDownload } from "@tabler/icons";
import { parse } from "json2csv";
import { ceil, startCase } from "lodash";
import { useRouter } from "next/router";
import { useCallback, useContext, useState } from "react";
import SvgSearch from "../Icon/Search";
import RequestTable from "./RequestTable";

const statusOptions: {
  value: RequestStatus;
  label: string;
}[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "purchased", label: "Purchased" },
  { value: "stale", label: "Stale" },
];

export const REQUEST_PER_PAGE = 7;

const RequestList = () => {
  const router = useRouter();
  const requestListContext = useContext(RequestListContext);
  const { requestList, requestWithApproverList } = requestListContext;
  const requestListCount = requestList.length;

  const activeTeamFormList = useContext(ActiveTeamFormListContext);
  const formList = activeTeamFormList
    ? activeTeamFormList.map((form) => ({
        value: `${form.form_id}`,
        label: `${form.form_name}`,
      }))
    : [];

  const [search, setSearch] = useState<string>(
    router.query.search_query ? `${router.query.search_query}` : ""
  );
  const [status, setStatus] = useState<string | null>(`${router.query.status}`);
  const [activePage, setActivePage] = useState(1);

  const [selectedForm, setSelectedForm] = useState<string | null>(
    router.query.form ? `${router.query.form}` : null
  );

  const { teamMemberList } = useContext(ActiveTeamContext);
  const userIdRoleDictionary = teamMemberList.reduce(
    (acc, member) => ({
      ...acc,
      [`${member.user_id}`]: member.member_role_id,
    }),
    {}
  ) as { [key: string]: TeamMemberRole };

  const handleSearch = useCallback(
    (search: string) => {
      setSearch(search);
      router.push(
        { query: { ...router.query, search_query: search } },
        undefined,
        { shallow: true }
      );
    },
    [router]
  );

  // !!! need to test if this will work on a mobile phone
  const handleSearchOnKeyUp = (e: {
    key: string;
    currentTarget: { value: string };
  }) => {
    const search = e.currentTarget.value;
    handleSearch(search);

    // if (e.key === "Enter") {
    //   handleSearch(search);
    // }

    if (e.key === "Backspace" && search === "") {
      setSearch("");
      handleSearch(search);
    }
  };

  const handleFilterBySelectedForm = useCallback(
    (selectedForm: string | null) => {
      setSelectedForm(selectedForm);
      if (selectedForm) {
        router.push(
          { query: { ...router.query, form: selectedForm } },
          undefined,
          { shallow: true }
        );
      } else {
        router.push(
          `/t/${router.query.tid}/requests?active_tab=all&page=${activePage}`,
          undefined,
          { shallow: true }
        );
      }
    },
    [router, activePage]
  );

  const handleFilterByStatus = (status: string | null) => {
    setStatus(status);
    if (status) {
      router.push({ query: { ...router.query, status: status } }, undefined, {
        shallow: true,
      });
    } else {
      router.push(
        `/t/${router.query.tid}/requests?active_tab=${router.query.active_tab}&page=${activePage}`,
        undefined,
        { shallow: true }
      );
    }
  };

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

  // todo: add eslint to show error for `mt={"xl"}`
  return (
    <Stack>
      <Group mt="xl">
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder="Search"
          rightSection={
            <ActionIcon onClick={() => handleSearch(search)}>
              <SvgSearch />
            </ActionIcon>
          }
          onKeyUp={handleSearchOnKeyUp}
        />
        <Select
          clearable
          placeholder="Form Type"
          data={formList as (string | SelectItem)[]}
          value={selectedForm}
          onChange={handleFilterBySelectedForm}
        />
        <Select
          clearable
          placeholder="Status"
          data={statusOptions}
          value={status}
          onChange={handleFilterByStatus}
          data-cy="request-select-status"
        />
        <ActionIcon
          variant="transparent"
          title="Export to CSV"
          aria-label="Export to CSV"
          onClick={handleExportRequestListToCSV}
        >
          <IconDownload size={16} />
        </ActionIcon>
      </Group>
      <RequestTable />

      {ceil((requestListCount as number) / REQUEST_PER_PAGE) >= 1 ? (
        <Pagination
          sx={{ alignSelf: "flex-end" }}
          page={activePage}
          onChange={handlePagination}
          total={ceil((requestListCount as number) / REQUEST_PER_PAGE)}
        />
      ) : null}
    </Stack>
  );
};
export default RequestList;
