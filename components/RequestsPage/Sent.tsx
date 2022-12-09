import { Search } from "@/components/Icon";
import type { Database, RequestType } from "@/utils/types";
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
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { ceil } from "lodash";
import { useEffect, useState } from "react";
import styles from "./All.module.scss";
import RequestTable from "./RequestTable";

const statusOptions: {
  value: Database["public"]["Enums"]["request_status"];
  label: string;
}[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "revision", label: "Revision" },
  { value: "stale", label: "Stale" },
  { value: "cancelled", label: "Cancelled" },
];

const REQUEST_PER_PAGE = 8;

const Sent = () => {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();

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
    try {
      setSelectedRequest(null);
      setIsLoading(true);
      // todo team_id
      const start = (activePage - 1) * REQUEST_PER_PAGE;
      let query = supabase
        .from("request_table")
        .select(
          "*, form: form_table_id(*), approver: approver_id(*), owner: requested_by(*)"
        )
        .eq("is_draft", false)
        .eq("form.team_id", null)
        .eq("requested_by", user?.id)
        .range(start, start + REQUEST_PER_PAGE - 1);
      let countQuery = supabase
        .from("request_table")
        .select("*")
        .eq("is_draft", false)
        .eq("form.team_id", null)
        .eq("requested_by", user?.id);

      if (selectedForm) {
        query = query.eq("form_table_id", selectedForm);
        countQuery = countQuery.eq("form_table_id", selectedForm);
      }
      if (status) {
        query = query.eq("request_status", status);
        countQuery = countQuery.eq("request_status", status);
      }
      if (isSearch && search) {
        query = query.or(
          `or(request_description.ilike.%${search}%,request_title.ilike.%${search}%)`
        );
        countQuery = countQuery.or(
          `or(request_description.ilike.%${search}%,request_title.ilike.%${search}%)`
        );
      }
      const { data: requestList, error: requestListError } = await query;
      const { count: requestCount, error: requestCountError } =
        await countQuery;

      if (requestListError || requestCountError) throw requestListError;

      if (requestList && requestCount) {
        const newRequestList = requestList as RequestType[];
        setRequestList(newRequestList);
        setRequestCount(requestCount);
      } else {
        setRequestCount(0);
        setRequestList([]);
      }
      setIsLoading(false);
    } catch {
      showNotification({
        title: "Error!",
        message: "Faield to fetch Request List",
        color: "red",
      });
    }
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
        (selectedRequest.request_status === "stale" ||
          selectedRequest.request_status === "pending") &&
        selectedRequest.approver_id === user?.id
      ) {
        setIsApprover(true);
      }
    }
  }, [selectedRequest, user]);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("request_table")
        .update({ request_status: "approved" })
        .eq("request_id", Number(`${selectedRequest?.request_id}`));

      if (error) throw error;

      setRequestList((prev) =>
        prev.map((request) => {
          if (request.request_id === selectedRequest?.request_id) {
            return {
              ...request,
              request_status: "approved",
            };
          } else {
            return request;
          }
        })
      );
      setSelectedRequest(null);
      showNotification({
        title: "Success!",
        message: `You approved ${selectedRequest?.request_title}`,
        color: "green",
      });
    } catch {
      showNotification({
        title: "Error!",
        message: `Failed to approve ${selectedRequest?.request_title}`,
        color: "red",
      });
    }
    setIsLoading(false);
  };

  const handleSendToRevision = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("request_table")
        .update({ request_status: "revision" })
        .eq("request_id", Number(`${selectedRequest?.request_id}`));

      if (error) throw error;

      setRequestList((prev) =>
        prev.map((request) => {
          if (request.request_id === selectedRequest?.request_id) {
            return {
              ...request,
              request_status: "revision",
            };
          } else {
            return request;
          }
        })
      );
      setSelectedRequest(null);
      showNotification({
        title: "Success!",
        message: `${selectedRequest?.request_title} is sent to revision`,
        color: "green",
      });
    } catch {
      showNotification({
        title: "Error!",
        message: `${selectedRequest?.request_title} has failed to send to revision `,
        color: "red",
      });
    }
    setIsLoading(false);
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("request_table")
        .update({ request_status: "rejected" })
        .eq("request_id", Number(`${selectedRequest?.request_id}`));

      if (error) throw error;

      setRequestList((prev) =>
        prev.map((request) => {
          if (request.request_id === selectedRequest?.request_id) {
            return {
              ...request,
              request_status: "rejected",
            };
          } else {
            return request;
          }
        })
      );
      setSelectedRequest(null);
      showNotification({
        title: "Success!",
        message: `You rejected ${selectedRequest?.request_title}`,
        color: "green",
      });
    } catch {
      showNotification({
        title: "Error!",
        message: `Failed to reject ${selectedRequest?.request_title}`,
        color: "red",
      });
    }
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
          data={statusOptions}
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
