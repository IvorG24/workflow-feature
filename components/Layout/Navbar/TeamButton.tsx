import {
  Avatar,
  Group,
  Select,
  SelectItem,
  Text,
  Tooltip,
} from "@mantine/core";
import { useRouter } from "next/router";
import { forwardRef, useEffect, useState } from "react";

export type TeamButtonProps = {
  teamList: TeamButtonItem[];
};

// https://mantine.dev/core/select/
interface TeamButtonItem extends React.ComponentPropsWithoutRef<"div"> {
  image: string;
  name: string;
  description: string;
}

const SelectItem = forwardRef<HTMLDivElement, TeamButtonItem>(
  ({ image, name, description, ...others }: TeamButtonItem, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar src={image} size="xs" />

        <div>
          <Text size="sm" truncate>
            {name}
          </Text>
          <Text size="xs" opacity={0.65} truncate>
            {description}
          </Text>
        </div>
      </Group>
    </div>
  )
);

function TeamButton({ teamList }: TeamButtonProps) {
  const router = useRouter();
  const [activeTeam, setActiveTeam] = useState(teamList[0]);

  useEffect(() => {
    if (!router.isReady) return;
    setActiveTeam(
      () =>
        teamList.find((team) => team.name === router.query.teamName) ||
        teamList[0]
    );
  }, [router.query.teamName]);

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
      image: team.image,
      label: team.name,
      description: team.description,
      value: team.name,
    };
  });

  const handleChangeTeam = (teamName: string) => {
    const team = teamList.find((team) => team.name === teamName);
    if (team) {
      // setActiveTeam(team);
      router.push(`/teams/${team.name}`);
    }
  };

  return (
    <Tooltip label="Choose Team">
      <Select
        itemComponent={SelectItem}
        data={data}
        maxDropdownHeight={400}
        nothingFound="No team"
        value={activeTeam.name}
        mb="sm"
        icon={<Avatar src={activeTeam.image} size="sm" />}
        size="md"
        onChange={handleChangeTeam}
      />
    </Tooltip>
  );
}

export default TeamButton;
