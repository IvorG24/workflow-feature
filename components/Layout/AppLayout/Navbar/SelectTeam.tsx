import { getFormList } from "@/backend/api/get";
import { updateUserActiveTeam } from "@/backend/api/update";
import { useFormActions } from "@/stores/useFormStore";
import {
  useActiveApp,
  useActiveTeam,
  useTeamActions,
  useTeamList,
} from "@/stores/useTeamStore";
import { Database } from "@/utils/database";
import { TEMP_USER_ID } from "@/utils/dummyData";
import { getAvatarColor } from "@/utils/styling";
import { TeamTableRow } from "@/utils/types";
import { Avatar, Group, Loader, Select, Text } from "@mantine/core";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { isEmpty, lowerCase, startCase } from "lodash";
import { useRouter } from "next/router";
import { forwardRef } from "react";

export type TeamSelectItem = {
  team: TeamTableRow;
  label: string;
  value: string;
} & React.ComponentPropsWithoutRef<"div">;

const SelectItem = forwardRef<HTMLDivElement, TeamSelectItem>(
  ({ team, label, value, ...others }: TeamSelectItem, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar
          size="xs"
          src={team.team_logo}
          color={getAvatarColor(Number(`${value.charCodeAt(1)}`))}
        >
          {startCase(label[0])}
          {startCase(label[1])}
        </Avatar>

        <div>
          <Text size="sm">{label}</Text>
        </div>
      </Group>
    </div>
  )
);

const SelectTeam = () => {
  const supabaseClient = createBrowserSupabaseClient<Database>();
  const router = useRouter();

  const teamList = useTeamList();
  const activeApp = useActiveApp();
  const activeTeam = useActiveTeam();
  const { setActiveTeam } = useTeamActions();
  const { setFormList } = useFormActions();

  const formatTeamOptions = () => {
    const teamOptions = teamList.map((team) => {
      return {
        value: team.team_id,
        label: team.team_name,
        team: team,
      };
    });
    return teamOptions;
  };

  const handleOnChange = async (value: string | null) => {
    const activeTeam = teamList.find((team) => {
      if (team.team_id === value) {
        return team;
      }
    });
    if (activeTeam) {
      setActiveTeam(activeTeam);
      await updateUserActiveTeam(supabaseClient, {
        userId: TEMP_USER_ID,
        teamId: activeTeam?.team_id,
      });
    }

    const formList = await getFormList(supabaseClient, {
      teamId: `${value}`,
      app: activeApp,
    });
    setFormList(formList);
    router.push(`/team-${lowerCase(activeApp)}s/${lowerCase(activeApp)}s`);
  };

  if (isEmpty(activeTeam)) {
    return (
      <Select
        label={
          <Text size="xs" weight={400}>
            Switch Team
          </Text>
        }
        data={[]}
        placeholder="Loading ...."
        icon={<Loader size={16} />}
      />
    );
  }

  return (
    <Select
      label={
        <Text size="xs" weight={400}>
          Switch Team
        </Text>
      }
      itemComponent={SelectItem}
      data={formatTeamOptions()}
      value={activeTeam.team_id}
      onChange={handleOnChange}
      searchable
      maxDropdownHeight={400}
      nothingFound="Team not found"
      icon={
        <Avatar
          size="sm"
          src={activeTeam.team_logo}
          color={getAvatarColor(Number(`${activeTeam.team_id.charCodeAt(1)}`))}
        >
          {startCase(activeTeam.team_name[0])}
          {startCase(activeTeam.team_name[1])}
        </Avatar>
      }
    />
  );
};

export default SelectTeam;
SelectItem.displayName = "SelectItem";
