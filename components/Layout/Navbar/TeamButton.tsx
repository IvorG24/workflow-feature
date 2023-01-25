import { GetUserTeamList } from "@/utils/queries";
import {
  Avatar,
  Group,
  Select,
  SelectItem,
  Text,
  Tooltip,
} from "@mantine/core";
import { forwardRef } from "react";

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
        <Avatar src={image} size="xs" />

        <div>
          <Text size="sm" truncate>
            {label}
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
      label: team.team_name || "",
      value: team.team_name || "",
    };
  });

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
            src={teamList[activeTeamIndex]?.team_logo_filepath || ""}
            size="sm"
          />
        }
        size="md"
        onChange={handleChangeTeam}
      />
    </Tooltip>
  );
}

export default TeamButton;
