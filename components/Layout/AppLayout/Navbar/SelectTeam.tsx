import {
  getAllNotification,
  getFormList,
  getUserTeamMemberData,
} from "@/backend/api/get";
import { updateUserActiveTeam } from "@/backend/api/update";
import { useFormActions } from "@/stores/useFormStore";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useNotificationActions } from "@/stores/useNotificationStore";
import {
  useActiveApp,
  useActiveTeam,
  useTeamActions,
  useTeamList,
} from "@/stores/useTeamStore";
import { useUserActions, useUserProfile } from "@/stores/useUserStore";
import { NOTIFICATION_LIST_LIMIT } from "@/utils/constant";
import { Database } from "@/utils/database";
import { getAvatarColor } from "@/utils/styling";
import { AppType, TeamTableRow } from "@/utils/types";
import { Avatar, Group, Loader, Select, Text } from "@mantine/core";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
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
          color={getAvatarColor(Number(`${value.charCodeAt(0)}`))}
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
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();

  const teamList = useTeamList();
  const activeApp = useActiveApp();
  const activeTeam = useActiveTeam();
  const user = useUserProfile();

  const { setActiveTeam } = useTeamActions();
  const { setFormList } = useFormActions();
  const { setIsLoading } = useLoadingActions();
  const { setNotificationList, setUnreadNotification } =
    useNotificationActions();
  const { setUserTeamMember } = useUserActions();

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
    if (value === activeTeam?.team_id) {
      return;
    }
    setIsLoading(true);
    const newActiveTeam = teamList.find((team) => {
      if (team.team_id === value) {
        return team;
      }
    });
    if (newActiveTeam && user) {
      setActiveTeam(newActiveTeam);
      await updateUserActiveTeam(supabaseClient, {
        userId: user.user_id,
        teamId: newActiveTeam.team_id,
      });

      // fetch user team member id
      const teamMember = await getUserTeamMemberData(supabaseClient, {
        teamId: newActiveTeam.team_id,
        userId: user.user_id,
      });
      // set user team member id
      if (teamMember) {
        setUserTeamMember(teamMember);
      }

      // fetch notification list
      const { data: notificationList, count: unreadNotificationCount } =
        await getAllNotification(supabaseClient, {
          userId: user.user_id,
          app: activeApp as AppType,
          page: 1,
          limit: NOTIFICATION_LIST_LIMIT,
          teamId: newActiveTeam.team_id,
        });

      // set notification
      setNotificationList(notificationList);
      setUnreadNotification(unreadNotificationCount || 0);
    }

    // fetch form list
    const formList = await getFormList(supabaseClient, {
      teamId: `${value}`,
      app: activeApp,
    });

    // set form list
    setFormList(formList);

    await router.push(`/team-${lowerCase(activeApp)}s/dashboard`);

    setIsLoading(false);
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
    <>
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
        maxDropdownHeight={400}
        nothingFound="Team not found"
        icon={
          <Avatar
            size="sm"
            src={activeTeam.team_logo}
            color={getAvatarColor(
              Number(`${activeTeam.team_id.charCodeAt(0)}`)
            )}
          >
            {startCase(activeTeam.team_name[0])}
            {startCase(activeTeam.team_name[1])}
          </Avatar>
        }
      />
    </>
  );
};

export default SelectTeam;
SelectItem.displayName = "SelectItem";
