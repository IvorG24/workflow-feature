import { getTeamFormSLAList } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { ROW_PER_PAGE } from "@/utils/constant";
import { Database } from "@/utils/database";
import { FormSLAWithForm } from "@/utils/types";
import {
  ActionIcon,
  Container,
  LoadingOverlay,
  Paper,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconSearch } from "@tabler/icons-react";
import { DataTable, DataTableColumn } from "mantine-datatable";
import { useState } from "react";

type Props = {
  slaFormList: FormSLAWithForm[];
  slaFormListCount: number;
};

const SignerSLASettingsPage = ({
  slaFormList: initialSlaFormList,
  slaFormListCount: initialSlaFormListCount,
}: Props) => {
  console.log(initialSlaFormList);
  const supabaseClient = createPagesBrowserClient<Database>();
  const activeTeam = useActiveTeam();

  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSlaForm, setSelectedSlaForm] =
    useState<FormSLAWithForm | null>(null);
  const [slaFormList, setSlaFormList] =
    useState<FormSLAWithForm[]>(initialSlaFormList);
  const [slaFormListCount, setSlaFormListCount] = useState(
    initialSlaFormListCount
  );
  const [activePage, setActivePage] = useState(1);

  const columnData: DataTableColumn<FormSLAWithForm>[] = [
    {
      accessor: "form_table.form_name",
      title: "Form",
    },
    {
      accessor: "form_sla_hours",
      title: "Hours",
    },
    {
      accessor: "form_sla_date_updated",
      title: "Date Updated",
    },
  ];

  const handleSearch = async (isEmpty?: boolean) => {
    if (activePage !== 1) {
      setActivePage(1);
    }
    handleFetch(isEmpty ? "" : search, 1);
  };

  const handleFetch = async (search: string, page: number) => {
    setIsLoading(true);
    try {
      const { data: formList, count: formListCount } = await getTeamFormSLAList(
        supabaseClient,
        {
          teamId: activeTeam.team_id,
          search,
          page,
          limit: ROW_PER_PAGE,
        }
      );

      setSlaFormList(formList as FormSLAWithForm[]);
      setSlaFormListCount(Number(formListCount));
    } catch {
      notifications.show({
        message: "Error on SLA Form List",
        color: "red",
      });
    }
    setIsLoading(false);
  };

  return (
    <Container p={0}>
      <Title order={2}>Signer SLA Settings</Title>

      <Container p={0} fluid pos="relative">
        <LoadingOverlay
          visible={false}
          overlayBlur={2}
          transitionDuration={500}
        />
        <Paper shadow="md" p="md" mt="md">
          <Title order={4}>SLA Resolution Time</Title>
          <TextInput
            miw={250}
            placeholder="Form Name"
            rightSection={
              <ActionIcon onClick={() => search && handleSearch()}>
                <IconSearch size={16} />
              </ActionIcon>
            }
            value={search}
            onChange={async (e) => {
              setSearch(e.target.value);
              if (e.target.value === "") {
                handleSearch(true);
              }
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                if (search) {
                  handleSearch();
                }
              }
            }}
            maxLength={4000}
          />
          <DataTable
            mt="xs"
            withBorder
            fw="bolder"
            c="dimmed"
            minHeight={390}
            fetching={isLoading}
            records={slaFormList}
            columns={columnData}
            totalRecords={slaFormListCount}
            recordsPerPage={ROW_PER_PAGE}
            page={activePage}
            onPageChange={(page: number) => {
              setActivePage(page);
              handleFetch(search, page);
            }}
          />
        </Paper>
      </Container>
    </Container>
  );
};

export default SignerSLASettingsPage;
