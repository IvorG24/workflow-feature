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
} from "@/utils/constant";
import {
  OptionType,
  PreferredPositionFormType,
  PreferredPositionType,
} from "@/utils/types";
import {
  Accordion,
  Container,
  Flex,
  LoadingOverlay,
  Pagination,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import PreferredPositionForm from "./PreferredPositionForm";
import PrefferedPositionFilter from "./PrefferedPositionFilter";

type FormValues = {
  selectedPositions: { [key: string]: string[] };
  search: string;
};

type Props = {
  groupMembers: PreferredPositionType[];
  totalCount: number;
};
const PreferredPositionPage = ({ groupMembers, totalCount }: Props) => {
  const supabaseClient = useSupabaseClient();
  const activeTeam = useActiveTeam();

  const [positionOptions, setPositionOptions] = useState<OptionType[]>([]);
  const [positionList, setPositionList] = useState<{ [key: string]: string[] }>(
    {}
  );
  const [activePage, setActivePage] = useState(1);
  const [memberCount, setMemberCount] = useState(totalCount);
  const [memberList, setMemberList] =
    useState<PreferredPositionType[]>(groupMembers);
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const totalPages = Math.ceil(memberCount / 10);
  const methods = useForm<FormValues>({
    defaultValues: {
      selectedPositions: {},
      search: "",
    },
  });

  const { watch, setValue, getValues } = methods;
  const selectedPositions = watch("selectedPositions");

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

  const handleAddPosition = (memberId: string, value: string) => {
    const currentPositions = selectedPositions[memberId] || [];

    if (currentPositions.includes(value)) return;

    const label = positionOptions.find(
      (option) => option.value === value
    )?.label;

    if (!label) return;

    setPositionList((prev) => ({
      ...prev,
      [memberId]: [...(prev[memberId] || []), label],
    }));

    if (!currentPositions.includes(value)) {
      setValue(`selectedPositions.${memberId}`, [...currentPositions, value]);
    }
  };

  const handleDeletePosition = (memberId: string, position: string) => {
    const valueToRemove = positionOptions.find(
      (option) => option.label === position
    )?.value;

    if (!valueToRemove) return;

    setValue(
      `selectedPositions.${memberId}`,
      selectedPositions[memberId]?.filter((value) => value !== valueToRemove) ||
        []
    );
    const labelToRemove = positionOptions.find(
      (option) => option.label === position
    )?.label;

    if (labelToRemove) {
      setPositionList((prev) => {
        const updatedList = (prev[memberId] || []).filter(
          (label) => label !== position
        );

        return { ...prev, [memberId]: updatedList };
      });
    }
  };

  const handleSubmitPosition = async (
    data: PreferredPositionFormType,
    memberId: string
  ) => {
    try {
      setIsLoading(true);
      const memberPositions = data.selectedPositions[memberId] || [];

      await insertUpdateHrPreferredPosition(supabaseClient, {
        memberId: memberId,
        positionData: memberPositions,
      });

      notifications.show({
        message: "Position updated successfully",
        color: "green",
      });
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
    if (!openAccordions.has(memberId)) {
      setOpenAccordions((prev) => new Set([...prev, memberId]));

      try {
        setIsLoading(true);
        const { positionAlias, positionId } = await fetchPreferredHrPosition(
          supabaseClient,
          { memberId }
        );

        setPositionList((prev) => ({
          ...prev,
          [memberId]: positionAlias,
        }));

        setValue(`selectedPositions.${memberId}`, positionId);
      } catch (e) {
        notifications.show({
          message: "Failed to fetch HR preferred positions.",
          color: "red",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setOpenAccordions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(memberId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    handlePagination(activePage);
  }, [activePage]);

  return (
    <Container maw={3840} h="100%">
      <LoadingOverlay visible={isLoading} />
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
            <Accordion multiple variant="separated">
              {memberList.map((member, index) => (
                <Accordion.Item value={member.group_member_id} key={index}>
                  <Accordion.Control
                    onClick={() =>
                      handleFetchHrPreferredPosition(member.group_member_id)
                    }
                  >
                    <Text fw={500}>{member.group_member_name}</Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <FormProvider {...methods}>
                      <PreferredPositionForm
                        member={member}
                        positionOptions={positionOptions}
                        positionList={positionList}
                        handleAddPosition={handleAddPosition}
                        handleDeletePosition={handleDeletePosition}
                        handleSubmitPosition={handleSubmitPosition}
                      />
                    </FormProvider>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
            <Pagination
              size="sm"
              position="center"
              total={totalPages}
              onChange={setActivePage}
            />
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default PreferredPositionPage;
