import { GetUserTeamList } from "@/utils/queries";
import { getRandomColor } from "@/utils/styling";
import {
  Avatar,
  Group,
  Select,
  SelectItem,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { IconBuildingCommunity, IconCirclePlus } from "@tabler/icons";
import { startCase, toUpper } from "lodash";
import { forwardRef, useCallback } from "react";

export type TeamButtonProps = {
  teamList: GetUserTeamList;
  activeTeamIndex: number;
  handleChangeTeam: (teamName: string) => void;
};

// https://mantine.dev/core/select/
interface TeamButtonItem extends React.ComponentPropsWithoutRef<"div"> {
  image: string;
  label: string;
  // description: string;
}

const SelectItem = forwardRef<HTMLDivElement, TeamButtonItem>(
  ({ image, label, ...others }: TeamButtonItem, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        {image === "MANAGE TEAM" && (
          // <Avatar
          //   src="https://img.icons8.com/clouds/256/000000/add.png"
          //   size="xs"
          // />
          <IconBuildingCommunity size={14} />
        )}
        {image === "CREATE TEAM" && (
          // <Avatar
          //   src="https://img.icons8.com/clouds/256/000000/add.png"
          //   size="xs"
          // />
          <IconCirclePlus size={14} />
        )}
        {!image && (
          <Avatar
            // src={image}
            size="xs"
          >
            {startCase(label[0])}
            {startCase(label[1])}
          </Avatar>
        )}

        <div>
          <Text size="sm" truncate>
            {toUpper(label)}
          </Text>
          {/* <Text size="xs" opacity={0.65} truncate>
            {description}
          </Text> */}
        </div>
      </Group>
    </div>
  )
);

function TeamButton({
  teamList,
  activeTeamIndex,
  handleChangeTeam,
}: TeamButtonProps) {
  const theme = useMantineTheme();

  // const [data, setData] = useState<SelectItem[]>(
  //   teamList.map((team) => {
  //     return {
  //       image: team.image,
  //       label: team.name,
  //       description: team.description,
  //       value: team.name,
  //     };
  //   })
  // );

  const data: SelectItem[] = teamList.map((team) => {
    return {
      image: team.team_logo_filepath || "",
      label: toUpper(team.team_name as string) || "",
      value: (team.team_name as string) || "",
    };
  });

  data.push(
    {
      image: "MANAGE TEAM",
      label: "MANAGE TEAM",
      value: "manage team",
    },
    {
      image: "CREATE TEAM",
      label: "CREATE TEAM",
      value: "create team",
    }
  );

  const memoizedCallback = useCallback(() => {
    return getRandomColor(theme);
  }, []);

  return (
    <Tooltip label="Choose Team">
      <Select
        itemComponent={SelectItem}
        data={data}
        maxDropdownHeight={400}
        nothingFound="No team"
        value={teamList[activeTeamIndex]?.team_name || ""}
        mb="sm"
        icon={
          <Avatar
            // src={teamList[activeTeamIndex]?.team_logo_filepath || ""}
            size="sm"
            color={memoizedCallback()}
          >
            {startCase(teamList[activeTeamIndex]?.team_name?.[0])}
            {startCase(teamList[activeTeamIndex]?.team_name?.[1])}
          </Avatar>
        }
        size="md"
        onChange={handleChangeTeam}
      />
    </Tooltip>
  );
}

export default TeamButton;
