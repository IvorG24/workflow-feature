import { useActiveTeam } from "@/stores/useTeamStore";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { Anchor, Card, Divider, Text } from "@mantine/core";

type Props = {
  title: string;
  description: string;
  href: string;
};

const SLAItem = ({ title, description, href }: Props) => {
  const activeTeam = useActiveTeam();
  return (
    <Card shadow="md" maw={250} mih={150}>
      <Card.Section p="md" pb="xs">
        <Anchor
          href={`/${formatTeamNameToUrlKey(activeTeam.team_name ?? "")}${href}`}
        >
          <Text size="xl" fw={500}>
            {title}
          </Text>
        </Anchor>
      </Card.Section>
      <Divider />
      <Card.Section p="md" pt="xs">
        <Text size="xs">{description}</Text>
      </Card.Section>
    </Card>
  );
};

export default SLAItem;
