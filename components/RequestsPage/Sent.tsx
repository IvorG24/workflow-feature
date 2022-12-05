import { Search } from "@/components/Icon";
import type { Database } from "@/utils/types";
import { FormTable, UserProfile } from "@/utils/types";
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
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { ceil } from "lodash";
import { useEffect, useState } from "react";
import RequestTable from "./RequestTable";
import styles from "./Sent.module.scss";

// TODO current user
const currentUser = {
  id: "d0eceb39-8c1b-4e84-b7d7-9fdeddf53f8f",
  name: "Albert Linao",
  email: "albertlinao@email.com",
};

const tempStatus = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "revision", label: "Revision" },
  { value: "stale", label: "Stale" },
  { value: "cancelled", label: "Cancelled" },
];

const REQUEST_PER_PAGE = 8;

type RequestType = FormTable & {
  owner: UserProfile;
} & { approver: UserProfile };

const Sent = () => {
  const supabase = useSupabaseClient<Database>();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [requestList, setRequestList] = useState<RequestType[]>([]);
  const [activePage, setActivePage] = useState(1);
  const [requestCount, setRequestCount] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<RequestType | null>(
    null
  );
  const [isApprover, setIsApprover] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forms, setForms] = useState<{ value: string; label: string }[]>([]);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);

  const fetchRequests = async (isSearch: boolean) => {
    setSelectedRequest(null);
    setIsLoading(true);
    const start = (activePage - 1) * REQUEST_PER_PAGE;
    let query = supabase
      .from("form_table")
      .select("*, owner:response_owner(*), approver:approver_id(*)")
      .neq("approval_status", "null")
      .eq("response_owner", currentUser.id)
      .range(start, start + REQUEST_PER_PAGE - 1);
    let countQuery = supabase
      .from("form_table")
      .select("*", { count: "exact" })
      .eq("response_owner", currentUser.id)
      .neq("approval_status", "null");
    if (selectedForm) {
      query = query.eq("form_name_id", selectedForm);
      countQuery = countQuery.eq("form_name_id", selectedForm);
    }
    if (status) {
      query = query.eq("approval_status", status);
      countQuery = countQuery.eq("approval_status", status);
    }
    if (isSearch && search) {
      query = query.or(
        `or(request_description.ilike.%${search}%,request_title.ilike.%${search}%)`
      );
      countQuery = countQuery.or(
        `or(request_description.ilike.%${search}%,request_title.ilike.%${search}%)`
      );
    }
    const { data, error } = await query;
    const { count } = await countQuery;

    if (error) {
      showNotification({
        title: "Failed to Fetch Request!",
        message: error.message,
        color: "red",
      });
    }
    if (data && count) {
      const newData = data as RequestType[];
      setRequestList(newData);
      setRequestCount(count);
    } else {
      setRequestCount(0);
      setRequestList([]);
    }
    setIsLoading(false);
  };

  const fetchForms = async () => {
    const { data } = await supabase.from("form_name_table").select("*");
    const forms = data?.map((form) => {
      return { value: `${form.form_name_id}`, label: `${form.form_name}` };
    });
    if (forms !== undefined) {
      setForms(forms);
    }
  };

  // first load
  useEffect(() => {
    fetchRequests(false);
    fetchForms();
  }, [supabase]);

  // filter
  useEffect(() => {
    setActivePage(1);
    fetchRequests(false);
  }, [selectedForm, status]);

  // change page
  useEffect(() => {
    fetchRequests(false);
  }, [activePage]);

  useEffect(() => {
    setIsApprover(false);
    if (selectedRequest) {
      if (
        (selectedRequest.approval_status === "stale" ||
          selectedRequest.approval_status === "pending") &&
        selectedRequest.approver.user_id === currentUser.id
      ) {
        setIsApprover(true);
      }
    }
  }, [selectedRequest]);

  const handleApprove = async () => {
    setIsLoading(true);
    const { error } = await supabase
      .from("form_table")
      .update({ approval_status: "approved" })
      .eq("request_id", Number(`${selectedRequest?.request_id}`));

    if (error) {
      showNotification({
        title: "Error!",
        message: `Failed to approve ${selectedRequest?.request_title}`,
        color: "red",
      });
      setIsLoading(false);
    } else {
      setRequestList((prev) =>
        prev.map((request) => {
          if (request.request_id === selectedRequest?.request_id) {
            return {
              ...request,
              approval_status: "approved",
            };
          } else {
            return request;
          }
        })
      );
      setSelectedRequest(null);
      setIsLoading(false);
      showNotification({
        title: "Success!",
        message: `You approved ${selectedRequest?.request_title}`,
        color: "green",
      });
    }
  };

  const handleSendToRevision = async () => {
    setIsLoading(true);
    const { error } = await supabase
      .from("form_table")
      .update({ approval_status: "revision" })
      .eq("request_id", Number(`${selectedRequest?.request_id}`));

    if (error) {
      showNotification({
        title: "Error!",
        message: `Failed to send to revision the ${selectedRequest?.request_title}`,
        color: "red",
      });
      setIsLoading(false);
    } else {
      setRequestList((prev) =>
        prev.map((request) => {
          if (request.request_id === selectedRequest?.request_id) {
            return {
              ...request,
              approval_status: "revision",
            };
          } else {
            return request;
          }
        })
      );
      setSelectedRequest(null);
      setIsLoading(false);
      showNotification({
        title: "Success!",
        message: `You send to revision the ${selectedRequest?.request_title}`,
        color: "green",
      });
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    const { error } = await supabase
      .from("form_table")
      .update({ approval_status: "rejected" })
      .eq("request_id", Number(`${selectedRequest?.request_id}`));

    if (error) {
      showNotification({
        title: "Error!",
        message: `Failed to reject ${selectedRequest?.request_title}`,
        color: "red",
      });
      setIsLoading(false);
    } else {
      setRequestList((prev) =>
        prev.map((request) => {
          if (request.request_id === selectedRequest?.request_id) {
            return {
              ...request,
              approval_status: "rejected",
            };
          } else {
            return request;
          }
        })
      );
      setSelectedRequest(null);
      setIsLoading(false);
      showNotification({
        title: "Success!",
        message: `You reject ${selectedRequest?.request_title}`,
        color: "green",
      });
    }
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
            <ActionIcon onClick={() => fetchRequests(true)}>
              <Search />
            </ActionIcon>
          }
        />
        <Select
          clearable
          placeholder="Form Type"
          data={forms}
          value={selectedForm}
          onChange={setSelectedForm}
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
        requestList={requestList}
        selectedRequest={selectedRequest}
        setSelectedRequest={setSelectedRequest}
        isApprover={isApprover}
        handleApprove={handleApprove}
        handleSendToRevision={handleSendToRevision}
        handleReject={handleReject}
      />
      {requestCount / REQUEST_PER_PAGE > 1 ? (
        <Pagination
          className={styles.pagination}
          page={activePage}
          onChange={setActivePage}
          total={ceil(requestCount / REQUEST_PER_PAGE)}
        />
      ) : null}
    </Stack>
  );
};

export default Sent;
