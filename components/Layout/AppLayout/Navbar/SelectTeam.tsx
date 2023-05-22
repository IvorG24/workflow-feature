import { getFormList } from "@/backend/api/get";
import { Database } from "@/utils/database";
import { useStore } from "@/utils/store";
import { getAvatarColor } from "@/utils/styling";
import { TeamTableRow } from "@/utils/types";
import { Avatar, Group, Loader, Select, Text } from "@mantine/core";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { isEmpty, startCase } from "lodash";
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
  const store = useStore();
  const supabaseClient = createBrowserSupabaseClient<Database>();

  const formatTeamOptions = () => {
    const teamOptions = store.teamList.map((team) => {
      return {
        value: team.team_id,
        label: team.team_name,
        team: team,
      };
    });
    return teamOptions;
  };

  const handleOnChange = async (value: string | null) => {
    const activeTeam = store.teamList.find((team) => {
      if (team.team_id === value) {
        return team;
      }
    });
    activeTeam && store.setActiveTeam(activeTeam);

    const formList = await getFormList(supabaseClient, {
      teamId: `${value}`,
      app: store.activeApp,
    });
    console.log(value, store.activeApp);
    console.log(formList);
    store.setFormList(formList);
  };

  if (isEmpty(store.activeTeam)) {
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
      value={store.activeTeam.team_id}
      onChange={handleOnChange}
      searchable
      maxDropdownHeight={400}
      nothingFound="Team not found"
      icon={
        <Avatar
          size="sm"
          src={store.activeTeam.team_logo}
          color={getAvatarColor(
            Number(`${store.activeTeam.team_id.charCodeAt(1)}`)
          )}
        >
          {startCase(store.activeTeam.team_name[0])}
          {startCase(store.activeTeam.team_name[1])}
        </Avatar>
      }
    />
  );
};

export default SelectTeam;
SelectItem.displayName = "SelectItem";
