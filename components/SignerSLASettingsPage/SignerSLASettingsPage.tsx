import { getTeamFormSLAList } from "@/backend/api/get";
import { updateSLAHours } from "@/backend/api/update";
import { useActiveTeam } from "@/stores/useTeamStore";
import { ROW_PER_PAGE, formatDate, formatTime } from "@/utils/constant";
import { Database } from "@/utils/database";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { FormSLAWithForm } from "@/utils/types";
import {
  ActionIcon,
  Anchor,
  Breadcrumbs,
  Button,
  Container,
  Divider,
  Flex,
  Group,
  LoadingOverlay,
  Menu,
  NumberInput,
  Paper,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import {
  IconDotsVertical,
  IconEdit,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { DataTable, DataTableColumn } from "mantine-datatable";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";

type Props = {
  slaFormList: FormSLAWithForm[];
  slaFormListCount: number;
};

const SignerSLASettingsPage = ({
  slaFormList: initialSlaFormList,
  slaFormListCount: initialSlaFormListCount,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const activeTeam = useActiveTeam();
  const router = useRouter();

  const breadCrumbitems = [
    {
      title: "SLA",
      href: `/${formatTeamNameToUrlKey(activeTeam.team_name ?? "")}/sla`,
      active: false,
    },
    {
      title: "Approver",
      href: `/${formatTeamNameToUrlKey(
        activeTeam.team_name ?? ""
      )}/sla/approver`,
      active: false,
    },
    {
      title: "Settings",
      href: "#",
      active: true,
    },
  ].map((item, index) => (
    <Anchor
      onClick={async () => await router.push(item.href)}
      color={item.active ? "dimmed" : "blue"}
      key={index}
    >
      {item.title}
    </Anchor>
  ));

  const [isUpdatingSLAForm, setIsUpdatingSLAForm] = useState(false);
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
  const [slaResolutionTime, setSlaResolutionTime] = useState<number | "">(0);

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
      render: ({ form_sla_date_updated }) => {
        if (!form_sla_date_updated) return <></>;
        return (
          <Text>
            {`${formatDate(new Date(form_sla_date_updated))} ${formatTime(
              new Date(form_sla_date_updated)
            )}`}
          </Text>
        );
      },
    },
    {
      accessor: "edit",
      title: "",
      render: ({ form_sla_id }) => (
        <Menu withArrow>
          <Menu.Target>
            <ActionIcon maw={50}>
              <IconDotsVertical size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              px="md"
              icon={<IconEdit size={14} />}
              onClick={() => {
                handleColumnClick(form_sla_id);
              }}
            >
              Edit
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];

  const handleSearch = async (isEmpty?: boolean) => {
    if (activePage !== 1) {
      setActivePage(1);
    }
    handleFetch(isEmpty ? "" : search, 1);
  };

  const handleFetch = async (search: string, page: number) => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleColumnClick = (formId: string) => {
    const selectedForm = slaFormList.find(
      (form) => form.form_sla_id === formId
    );
    setSelectedSlaForm(selectedForm || null);
    setSlaResolutionTime(selectedForm?.form_sla_hours || 0);
  };

  const handleCancelEdit = () => {
    setSlaResolutionTime(0);
    setSelectedSlaForm(null);
  };
  const handleSaveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (typeof slaResolutionTime !== "number" && !selectedSlaForm) {
      return;
    }
    try {
      setIsUpdatingSLAForm(true);
      await updateSLAHours(supabaseClient, {
        form_sla_id: `${selectedSlaForm?.form_sla_id}`,
        form_sla_hours: Number(slaResolutionTime),
      });

      await handleFetch(search, activePage);
    } catch {
      notifications.show({
        message: "Error on SLA Form update",
        color: "red",
      });
    } finally {
      setIsUpdatingSLAForm(false);
      setSelectedSlaForm(null);
      setSlaResolutionTime(0);
    }
  };

  return (
    <Container p={0}>
      <Title order={2}>Signer SLA Settings</Title>

      <Breadcrumbs separator=">" mt="xs">
        {breadCrumbitems}
      </Breadcrumbs>
      <Container p={0}>
        {selectedSlaForm ? (
          <Paper shadow="md" p="md" mt="md" pos="relative">
            <LoadingOverlay
              visible={isUpdatingSLAForm}
              overlayBlur={2}
              transitionDuration={500}
            />

            <Flex justify="space-between">
              <Title order={3}>{selectedSlaForm.form_table.form_name}</Title>
              <ActionIcon maw={50} onClick={handleCancelEdit}>
                <IconX size={16} />
              </ActionIcon>
            </Flex>
            <Divider mt="md" />
            <Paper shadow="md" p="md" mt="md">
              <Title order={4}>Edit SLA Resolution Time</Title>
              <Divider mt="md" />
              <form onSubmit={handleSaveEdit}>
                <NumberInput
                  value={slaResolutionTime}
                  onChange={setSlaResolutionTime}
                  min={1}
                  mt="md"
                />

                <Group spacing="xl" mt="md">
                  <Button
                    type="submit"
                    miw={100}
                    disabled={
                      typeof slaResolutionTime !== "number" ||
                      slaResolutionTime < 1
                    }
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    miw={100}
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                </Group>
              </form>
            </Paper>
          </Paper>
        ) : (
          <Paper shadow="md" p="md" mt="md">
            <Flex justify="flex-start" gap="xl" wrap="wrap">
              <Title order={3}>SLA Resolution Time</Title>
              <TextInput
                maw={250}
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
            </Flex>
            <DataTable
              mt="md"
              withBorder
              fw="bolder"
              c="dimmed"
              minHeight={390}
              highlightOnHover
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
        )}
      </Container>
    </Container>
  );
};

export default SignerSLASettingsPage;
