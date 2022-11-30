import { Search } from "@/components/Icon";
import {
  ActionIcon,
  Group,
  LoadingOverlay,
  Pagination,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { ceil, toLower } from "lodash";
import { useEffect, useState } from "react";
import styles from "./All.module.scss";
import RequestTable from "./RequestTable";

type RequestType = {
  id: number;
  ref: string;
  formType: string;
  requestTitle: string;
  status: string;
  lastUpdated: string;
  requestedBy: string;
  description: string;
  approvers: {
    name: string;
    status: string;
  }[];
};

const currentUser = "Lance Juat";

const tempFormType = [
  { value: "approvalRequest", label: "Approval Request" },
  { value: "it", label: "IT" },
  { value: "purchaseOrder", label: "Purchase Order" },
  { value: "ptrf", label: "PTRF" },
  { value: "requisitionForm", label: "Requisition Form" },
  { value: "requestforPayment", label: "Request for Payment" },
  { value: "releaseOrder", label: "Release Order" },
];

const tempStatus = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "forRevision", label: "For Revision" },
  { value: "stale", label: "Stale" },
  { value: "cancelled", label: "Cancelled" },
];

const tempRequests: RequestType[] = [];

const REQUEST_PER_PAGE = 8;

const All = () => {
  const [search, setSearch] = useState("");
  const [formType, setFormType] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [requestList, setRequestList] = useState<RequestType[]>(tempRequests);
  const [activePage, setPage] = useState(1);
  const [visibleRequests, setVisibleRequests] = useState(
    tempRequests.slice(0, REQUEST_PER_PAGE)
  );
  const [selectedRequest, setSelectedRequest] = useState<RequestType | null>(
    null
  );

  const [isApprover, setIsApprover] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filterPage = (page: number, requestList: RequestType[]) => {
    setSelectedRequest(null);
    setPage(page);
    setVisibleRequests(
      requestList.slice(
        (page - 1) * REQUEST_PER_PAGE,
        (page - 1) * REQUEST_PER_PAGE + REQUEST_PER_PAGE
      )
    );
  };

  useEffect(() => {
    setIsApprover(false);
    if (selectedRequest) {
      if (
        selectedRequest.status === "stale" ||
        selectedRequest.status === "pending"
      ) {
        selectedRequest.approvers.map((approver) => {
          if (approver.name === currentUser && approver.status === "pending") {
            setIsApprover(true);
          }
        });
      }
    }
  }, [selectedRequest]);

  useEffect(() => {
    let newRequestList: RequestType[] = tempRequests;
    if (formType) {
      newRequestList = newRequestList.filter(
        (request) => request.formType === formType
      );
    }
    if (status) {
      newRequestList = newRequestList.filter(
        (request) => request.status === status
      );
    }
    if (search) {
      newRequestList = newRequestList.filter((request) =>
        toLower(request.requestTitle).includes(toLower(search))
      );
    }

    console.log;
    setRequestList(newRequestList);
    filterPage(1, newRequestList);
  }, [search, formType, status]);

  const handleApprove = () => {
    setIsLoading(true);
    showNotification({
      title: "Success!",
      message: `You approved ${selectedRequest?.requestTitle}`,
      color: "green",
    });
    setSelectedRequest(null);
    setIsLoading(false);
  };

  const handleSendToRevision = () => {
    setIsLoading(true);
    showNotification({
      title: "Success!",
      message: `${selectedRequest?.requestTitle} is Sent to Revision`,
      color: "green",
    });
    setSelectedRequest(null);
    setIsLoading(false);
  };

  const handleReject = () => {
    setIsLoading(true);
    showNotification({
      title: "Success!",
      message: `You rejected ${selectedRequest?.requestTitle}`,
      color: "green",
    });
    setSelectedRequest(null);
    setIsLoading(false);
  };

  // todo: add eslint to show error for `mt={"xl"}`
  return (
    <Stack>
      <LoadingOverlay visible={isLoading} overlayBlur={2} />
      <Group mt="xl">
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          rightSection={
            <ActionIcon>
              <Search />
            </ActionIcon>
          }
        />
        <Select
          clearable
          placeholder="Form Type"
          data={tempFormType}
          value={formType}
          onChange={setFormType}
        />
        <Select
          clearable
          placeholder="Status"
          data={tempStatus}
          value={status}
          onChange={setStatus}
        />
      </Group>
      <RequestTable
        visibleRequests={visibleRequests}
        selectedRequest={selectedRequest}
        setSelectedRequest={setSelectedRequest}
        isApprover={isApprover}
        handleApprove={handleApprove}
        handleSendToRevision={handleSendToRevision}
        handleReject={handleReject}
      />
      {requestList.length / REQUEST_PER_PAGE > 1 ? (
        <Pagination
          className={styles.pagination}
          page={activePage}
          onChange={(page) => filterPage(page, requestList)}
          total={ceil(requestList.length / REQUEST_PER_PAGE)}
        />
      ) : null}
    </Stack>
  );
};

export default All;
