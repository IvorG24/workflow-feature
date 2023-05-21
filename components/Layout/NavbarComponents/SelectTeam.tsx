import { Avatar, Group, Select, Text } from "@mantine/core";
import { forwardRef, useState } from "react";

const teams = [
  {
    image: "https://img.icons8.com/clouds/256/000000/futurama-bender.png",
    label: "Bender Bending Rodríguez",
    value: "Bender Bending Rodríguez",
    description: "Fascinated with cooking",
  },

  {
    image: "https://img.icons8.com/clouds/256/000000/futurama-mom.png",
    label: "Carol Miller",
    value: "Carol Miller",
    description: "One of the richest people on Earth",
  },
  {
    image: "https://img.icons8.com/clouds/256/000000/homer-simpson.png",
    label: "Homer Simpson",
    value: "Homer Simpson",
    description: "Overweight, lazy, and often ignorant",
  },
  {
    image: "https://img.icons8.com/clouds/256/000000/spongebob-squarepants.png",
    label: "Spongebob Squarepants",
    value: "Spongebob Squarepants",
    description: "Not just a sponge",
  },
];

export type TeamSelectItem = {
  image: string;
  label: string;
  value: string;
  description: string;
} & React.ComponentPropsWithoutRef<"div">;

const SelectItem = forwardRef<HTMLDivElement, TeamSelectItem>(
  ({ image, label, description, ...others }: TeamSelectItem, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar src={image} />

        <div>
          <Text size="sm">{label}</Text>
          <Text size="xs" opacity={0.65}>
            {description}
          </Text>
        </div>
      </Group>
    </div>
  )
);

function SelectTeam() {
  const defaultActiveTeam = teams[0].value;
  const [activeTeam, setActiveTeam] = useState<string | null>(
    defaultActiveTeam
  );

  return (
    <Select
      label={
        <Text size="xs" weight={400}>
          Switch Team
        </Text>
      }
      itemComponent={SelectItem}
      data={teams}
      value={activeTeam}
      onChange={setActiveTeam}
      searchable
      maxDropdownHeight={400}
      nothingFound="Team not found"
    />
  );
}

export default SelectTeam;
SelectItem.displayName = "SelectItem";
