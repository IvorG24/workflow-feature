import {
  fetchPreferredHrPosition,
  getPositionTypeOptions,
  getPreferredPositionOnLoad,
} from "@/backend/api/get";
import { insertUpdateHrPreferredPosition } from "@/backend/api/post";
import { useActiveTeam } from "@/stores/useTeamStore";
import {
  DEFAULT_TEAM_MEMBER_LIST_LIMIT,
  FETCH_OPTION_LIMIT,
  ROW_PER_PAGE,
} from "@/utils/constant";
import {
  OptionType,
  PreferredPositionFormType,
  PreferredPositionType,
} from "@/utils/types";
import {
  Button,
  Center,
  Container,
  createStyles,
  Flex,
  Group,
  MultiSelect,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { DataTable, DataTableColumn } from "mantine-datatable";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import PrefferedPositionFilter from "./PrefferedPositionFilter";

type FormValues = {
  selectedPositions: { [key: string]: string[] };
  search: string;
};

type Props = {
  groupMembers: PreferredPositionType[];
  totalCount: number;
};

const useStyles = createStyles((theme) => ({
  clickableColumn: {
    "&:hover": {
      color:
        theme.colorScheme === "dark"
          ? theme.colors.gray[7]
          : theme.colors.gray[5],
    },
    cursor: "pointer",
  },
  disabledColumn: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.gray[7]
        : theme.colors.gray[5],
    cursor: "pointer",
  },
}));

const PreferredPositionPage = ({ groupMembers, totalCount }: Props) => {
  const supabaseClient = useSupabaseClient();
  const activeTeam = useActiveTeam();
  const { classes } = useStyles();
  const [positionOptions, setPositionOptions] = useState<OptionType[]>([]);
  const [positionList, setPositionList] = useState<
    {
      position_id: string;
      position_alias: string;
    }[]
  >([]);
  const [activePage, setActivePage] = useState(1);
  const [memberCount, setMemberCount] = useState(totalCount);
  const [memberList, setMemberList] =
    useState<PreferredPositionType[]>(groupMembers);
  const [selectedMember, setSelectedMember] =
    useState<PreferredPositionType | null>(null); // Track selected member
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<FormValues>({
    defaultValues: {
      selectedPositions: {},
      search: "",
    },
  });

  const { setValue, getValues, handleSubmit } = methods;

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        if (!activeTeam.team_id) return;
        const positionOptions = await getPositionTypeOptions(supabaseClient, {
          teamId: activeTeam.team_id,
          limit: FETCH_OPTION_LIMIT,
        });

        setPositionOptions(positionOptions);
      } catch (e) {
        console.log(e);
      }
    };

    fetchPositions();
  }, [activeTeam]);

  const handleFetchHrMembers = async (page: number) => {
    try {
      if (!activeTeam.team_id) return;
      setIsLoading(true);
      const { search } = getValues();

      const { groupMemberData, totalCount } = await getPreferredPositionOnLoad(
        supabaseClient,
        {
          teamId: activeTeam.team_id,
          page: page,
          limit: DEFAULT_TEAM_MEMBER_LIST_LIMIT,
          search,
        }
      );

      setMemberList(groupMemberData);
      setMemberCount(totalCount);
    } catch (e) {
      notifications.show({
        message: "Failed to fetch HR preferred positions.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePagination = async (page: number) => {
    try {
      handleFetchHrMembers(page);
    } catch (e) {}
  };

  const handleFilter = async () => {
    try {
      handleFetchHrMembers(1);
    } catch (e) {}
  };

  const handleSubmitPosition = async (
    data: PreferredPositionFormType,
    memberId?: string
  ) => {
    try {
      setIsLoading(true);

      const memberPositions = data.selectedPositions[memberId ?? ""] || [];

      await insertUpdateHrPreferredPosition(supabaseClient, {
        memberId: memberId ?? "",
        positionData: memberPositions,
      });

      notifications.show({
        message: "Position updated successfully",
        color: "green",
      });
      handleFetchHrPreferredPosition(memberId ?? "");
      modals.close(`addPosition-${memberId}`);
    } catch (e) {
      notifications.show({
        message: "Something went wrong",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchHrPreferredPosition = async (memberId: string) => {
    try {
      setIsLoading(true);
      const { positionData, positionId } = await fetchPreferredHrPosition(
        supabaseClient,
        { memberId }
      );

      setPositionList(positionData);

      setValue(`selectedPositions.${memberId}`, positionId);
      const member =
        memberList.find((m) => m.group_member_id === memberId) || null;
      setSelectedMember(member);
    } catch (e) {
      notifications.show({
        message: "Failed to fetch HR preferred positions.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handlePagination(activePage);
  }, [activePage]);

  const columnData: DataTableColumn<PreferredPositionType>[] = [
    {
      accessor: "Group Member Name",
      title: "HR Member Name",
      width: "80%",
      render: ({ group_member_name, group_member_id }) => (
        <Text
          className={classes.clickableColumn}
          onClick={() => {
            handleFetchHrPreferredPosition(group_member_id);
          }}
        >
          {group_member_name}
        </Text>
      ),
    },
  ];

  const memberColumn: DataTableColumn<{
    position_id: string;
    position_alias: string;
  }>[] = [
    {
      accessor: "position_id",
      title: "Preferred Positions",
      render: ({ position_alias }) => <Text>{position_alias}</Text>,
    },
  ];

  const handleAction = (memberId?: string) => {
    modals.open({
      modalId: `addPosition-${memberId}`,
      w: "xl",
      title: <Text>Add/Update Positions</Text>,
      children: (
        <form
          onSubmit={handleSubmit((data) =>
            handleSubmitPosition(data, memberId)
          )}
        >
          <Controller
            name={`selectedPositions.${memberId}`}
            control={methods.control}
            render={({ field }) => (
              <MultiSelect
                {...field}
                placeholder="Select positions"
                label="Preferred Positions"
                withinPortal
                data={positionOptions}
                value={field.value}
                onChange={field.onChange}
                searchable
                clearable
              />
            )}
          />
          <Flex mt="md" align="center" justify="flex-end" gap="sm">
            <Button
              variant="default"
              color="dimmed"
              onClick={() => modals.close(`addPosition-${memberId}`)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </Flex>
        </form>
      ),
      centered: true,
    });
  };

  return (
    <Container maw={3840} h="100%">
      <Stack>
        <Flex justify="space-between" rowGap="xs" wrap="wrap">
          <Title order={2} color="dimmed">
            Preferred Position Page
          </Title>
        </Flex>
        <Paper p="md" withBorder>
          <Stack>
            <FormProvider {...methods}>
              <PrefferedPositionFilter
                isLoading={isLoading}
                handleFilterForms={handleFilter}
              />
            </FormProvider>
            <DataTable
              idAccessor="group_member_id"
              mt="xs"
              withBorder
              fw="bolder"
              c="dimmed"
              minHeight={390}
              fetching={isLoading}
              records={memberList}
              columns={columnData}
              totalRecords={memberCount}
              recordsPerPage={ROW_PER_PAGE}
              page={activePage}
              onPageChange={(page: number) => {
                setActivePage(page);
                handlePagination(page);
              }}
            />
          </Stack>
        </Paper>
        <Paper p="md" withBorder>
          <Stack>
            <Group position="apart">
              <Title order={3} color="dimmed">
                Preferred Position{" "}
                {selectedMember
                  ? `( ${selectedMember.group_member_name} )`
                  : ""}
              </Title>
              {selectedMember && (
                <Button
                  onClick={() => handleAction(selectedMember?.group_member_id)}
                >
                  {positionList.length > 0 ? "Update Position" : "Add Position"}
                </Button>
              )}
            </Group>

            {selectedMember ? (
              positionList.length > 0 ? (
                <DataTable
                  idAccessor="position_id"
                  mt="xs"
                  withBorder
                  fw="bolder"
                  c="dimmed"
                  minHeight={390}
                  records={positionList}
                  columns={memberColumn}
                  totalRecords={positionList.length}
                  recordsPerPage={positionList.length}
                  page={1}
                  onPageChange={(page: number) => {
                    setActivePage(page);
                  }}
                />
              ) : (
                <Paper p="md" withBorder>
                  <Center>No Position Available</Center>
                </Paper>
              )
            ) : (
              <Paper p="md" withBorder>
                <Center>No selected member yet</Center>
              </Paper>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default PreferredPositionPage;
