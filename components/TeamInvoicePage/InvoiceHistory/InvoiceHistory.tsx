import { fetchFormslyInvoiceHistoryList } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { ROW_PER_PAGE, formatDate } from "@/utils/constant";
import { capitalizeEachWord, pesoFormatter } from "@/utils/string";
import { getPaymayaStatusColor } from "@/utils/styling";
import supabaseClientTransaction from "@/utils/supabase/transaction";
import { TransactionTableRow } from "@/utils/types";
import { Badge, Paper, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { SupabaseClient } from "@supabase/supabase-js";
import { DataTable } from "mantine-datatable";
import { Database as OneOfficeDatabase } from "oneoffice-api";
import { useEffect, useState } from "react";

const InvoiceHistory = () => {
  const activeTeam = useActiveTeam();
  const [isFetching, setIsFetching] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [invoiceList, setInvoiceList] = useState<TransactionTableRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchInvoice(1);
  }, []);

  const fetchInvoice = async (page: number) => {
    setIsFetching(true);
    try {
      const { data, count } = await fetchFormslyInvoiceHistoryList(
        supabaseClientTransaction as unknown as SupabaseClient<
          OneOfficeDatabase["transaction_schema"]
        >,
        {
          userId: activeTeam.team_user_id,
          page: page,
          limit: 10,
        }
      );
      setInvoiceList(data);
      setTotalCount(count ?? 0);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Paper shadow="md" p="md" mt="md">
      <Title order={3}>Invoice History</Title>
      <DataTable
        mt="md"
        withBorder
        fw="bolder"
        c="dimmed"
        minHeight={390}
        fetching={isFetching}
        records={invoiceList}
        idAccessor="transaction_id"
        columns={[
          {
            accessor: "transaction_date",
            title: "Date Created",
            render: ({ transaction_date }) => (
              <Text sx={{ cursor: "pointer" }}>
                {formatDate(new Date(transaction_date))}
              </Text>
            ),
          },
          {
            accessor: "transaction_payment_channel",
            title: "Payment Channel",
            render: ({ transaction_payment_channel }) => (
              <Text sx={{ cursor: "pointer" }}>
                {transaction_payment_channel}
              </Text>
            ),
          },
          {
            accessor: "transaction_status",
            title: "Status",
            render: ({ transaction_status }) => (
              <Badge
                radius="xl"
                color={getPaymayaStatusColor(transaction_status)}
              >
                {capitalizeEachWord(transaction_status.replaceAll("_", " "))}
              </Badge>
            ),
          },
          {
            accessor: "transaction_total_amount",
            title: "Amount",
            render: ({ transaction_total_amount }) => (
              <Text sx={{ cursor: "pointer" }}>
                {pesoFormatter(`${transaction_total_amount}`)}.00
              </Text>
            ),
          },
        ]}
        totalRecords={totalCount}
        recordsPerPage={ROW_PER_PAGE}
        page={activePage}
        onPageChange={(page: number) => {
          fetchInvoice(page);
          setActivePage(page);
        }}
      />
    </Paper>
  );
};

export default InvoiceHistory;
