import { getAllGroups } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { BasicNodeType, NodeAdvanceSettings, OptionType } from "@/utils/types";
import {
  Button,
  Flex,
  LoadingOverlay,
  MultiSelect,
  NumberInput,
  Stack,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

type Props = {
  selectedNode: BasicNodeType;
};

const NodeSignerSection = ({ selectedNode }: Props) => {
  const supabaseClient = useSupabaseClient();
  const activeTeam = useActiveTeam();

  const [isFetchingOptions, setIsFetchingOptions] = useState(true);
  const [groupOptions, setGroupOptions] = useState<OptionType[]>([]);

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<NodeAdvanceSettings>({
    defaultValues: {
      nodeProjectWithSignerList: selectedNode.data.nodeProjectWithSignerList
        .length
        ? selectedNode.data.nodeProjectWithSignerList
        : [{ signerList: [] }],
    },
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsFetchingOptions(true);
        const groups = await getAllGroups(supabaseClient, {
          teamId: activeTeam.team_id,
        });
        const groupOptions = groups.map((group) => ({
          label: group.team_group_name,
          value: group.team_group_id,
        }));

        setGroupOptions(groupOptions);
      } catch {
        notifications.show({
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
      } finally {
        setIsFetchingOptions(false);
      }
    };
    fetchOptions();
  }, [supabaseClient, activeTeam.team_id]);

  const handleApplyChanges = (data: NodeAdvanceSettings) => {
    selectedNode.data.onNodeSignerChange(
      selectedNode.id,
      data.nodeProjectWithSignerList
    );

    notifications.show({
      message: "Signers updated",
      color: "green",
    });
  };

  const watchSignerListCount = watch(
    "nodeProjectWithSignerList.0.signerList"
  ).length;

  return (
    <form onSubmit={handleSubmit(handleApplyChanges)}>
      <Stack spacing="xs" pos="relative">
        <LoadingOverlay visible={isFetchingOptions} overlayBlur={2} />
        <Stack spacing="xs" mt="xs">
          <Flex align="center" key={`divider-${selectedNode.id}-0`}></Flex>

          <Controller
            control={control}
            name="nodeProjectWithSignerList.0.signerList"
            render={({ field: { value, onChange } }) => (
              <MultiSelect
                value={value}
                onChange={onChange}
                data={groupOptions}
                searchable
                nothingFound="Member not found"
                label="Group Signers"
                error={
                  errors.nodeProjectWithSignerList?.[0]?.signerList?.message
                }
                key={`multi-select-${selectedNode.id}-0`}
              />
            )}
            rules={{
              required: {
                value: true,
                message: "Signer list is required",
              },
            }}
          />
          <Controller
            control={control}
            name="nodeProjectWithSignerList.0.signerCount"
            render={({ field: { value, onChange } }) => (
              <NumberInput
                value={value}
                onChange={onChange}
                label="Signer Count to Proceed"
                min={1}
                max={watchSignerListCount}
                error={
                  errors.nodeProjectWithSignerList?.[0]?.signerCount?.message
                }
                key={`number-input-${selectedNode.id}-0`}
              />
            )}
            rules={{
              required: {
                value: true,
                message: "Signer count is required",
              },
              validate: {
                maxCount: (value) => {
                  if (value && value <= watchSignerListCount) return true;
                  return "Invalid signer count";
                },
              },
            }}
          />
        </Stack>

        <Button mt="xs" type="submit">
          Apply Changes
        </Button>
      </Stack>
    </form>
  );
};

export default NodeSignerSection;
