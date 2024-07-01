import { useActiveTeam } from "@/stores/useTeamStore";
import { addCommaToNumber, formatTeamNameToUrlKey } from "@/utils/string";
import { getStatusToColor } from "@/utils/styling";
import {
  Anchor,
  Badge,
  Center,
  Popover,
  Text,
  createStyles,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ResultType } from "./ItemAnalyticsPage";

const useStyles = createStyles((theme) => ({
  preTag: {
    margin: 0,
    padding: 0,
    whiteSpace: "pre-wrap",
  },
  popOverDropdown: {
    backgroundColor:
      theme.colorScheme === "light"
        ? theme.colors.gray[9]
        : theme.colors.gray[2],
    color: theme.colorScheme === "light" ? "white" : "black",
    pointerEvents: "none",
  },
}));

type Props = {
  result: ResultType;
};

const ItemRow = ({ result }: Props) => {
  const { classes } = useStyles();
  const activeTeam = useActiveTeam();
  const [
    descriptionOpened,
    { close: descrpitionClose, open: descriptionOpen },
  ] = useDisclosure(false);

  const formatDescription = (
    item_description: {
      field_name: string;
      request_response: string;
    }[]
  ) => {
    let description = "";
    item_description
      .sort((a, b) => a.field_name.localeCompare(b.field_name))
      .forEach((field) => {
        description += `${field.field_name}: ${JSON.parse(
          field.request_response
        )}, `;
      });
    return description.slice(0, -2);
  };

  const formatDescriptionTooltip = (
    item_description: {
      field_name: string;
      request_response: string;
    }[]
  ) => {
    let description = "";
    item_description
      .sort((a, b) => a.field_name.localeCompare(b.field_name))
      .forEach((field) => {
        description += `${field.field_name}: ${JSON.parse(
          field.request_response
        )}\n`;
      });
    return description.slice(0, -1);
  };

  return (
    <tr>
      <td>
        <Anchor
          href={`/${formatTeamNameToUrlKey(
            activeTeam.team_name ?? ""
          )}/requests/${result.request_id}`}
          target="_blank"
        >
          {result.request_formsly_id}
        </Anchor>
      </td>
      <td>
        <Popover
          position="top"
          withArrow
          shadow="xl"
          opened={descriptionOpened}
        >
          <Popover.Target>
            <Text
              truncate
              maw={300}
              onMouseEnter={descriptionOpen}
              onMouseLeave={descrpitionClose}
            >
              {formatDescription(result.item_description)}
            </Text>
          </Popover.Target>
          <Popover.Dropdown className={classes.popOverDropdown}>
            <pre className={classes.preTag}>
              <Text>{formatDescriptionTooltip(result.item_description)}</Text>
            </pre>
          </Popover.Dropdown>
        </Popover>
      </td>
      <td>{addCommaToNumber(Number(result.quantity))}</td>
      <td>{JSON.parse(result.unit_of_measurement)}</td>
      <td>
        <Center>
          <Badge
            variant="filled"
            color={getStatusToColor(result.request_status)}
          >
            {result.request_status}
          </Badge>
        </Center>
      </td>
    </tr>
  );
};

export default ItemRow;
