import { useActiveTeam } from "@/stores/useTeamStore";
import { formatDate } from "@/utils/constant";
import { safeParse } from "@/utils/functions";
import { capitalizeEachWord, formatTeamNameToUrlKey } from "@/utils/string";
import { getStatusToColor, mobileNumberFormatter } from "@/utils/styling";
import { BackgroundCheckSpreadsheetData } from "@/utils/types";
import { Anchor, Badge, Button, createStyles, Flex, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { Dispatch, SetStateAction } from "react";

const useStyles = createStyles((theme) => ({
  row: {
    "& td": {
      backgroundColor: theme.colors.blue[0],
    },
  },
}));

type Props = {
  item: BackgroundCheckSpreadsheetData;
  hiddenColumnList: string[];
  handleUpdateBackgroundCheckStatus: (
    status: string,
    data: BackgroundCheckSpreadsheetData
  ) => void;
  setData: Dispatch<SetStateAction<BackgroundCheckSpreadsheetData[]>>;
};

const BackgroundCheckMainTableRow = ({
  item,
  hiddenColumnList,
  handleUpdateBackgroundCheckStatus,
}: Props) => {
  const { classes } = useStyles();
  const team = useActiveTeam();

  const statusColor: Record<string, string> = {
    QUALIFIED: "green",
    UNQUALIFIED: "red",
    UNRESPONSIVE: "gray",
  };

  const openModal = (action: string) =>
    modals.openConfirmModal({
      title: <Text>Please confirm your action.</Text>,
      children: (
        <Text>{`Are you sure this applicant is ${action.toLocaleLowerCase()}?`}</Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      centered: true,
      confirmProps: { color: statusColor[action] },
      onConfirm: async () => handleUpdateBackgroundCheckStatus(action, item),
    });

  if (!team.team_name) return null;
  return (
    <tr className={classes.row}>
      {!hiddenColumnList.includes("position") && (
        <td>
          <Text>{safeParse(item.position)}</Text>
        </td>
      )}
      {!hiddenColumnList.includes("application_information_full_name") && (
        <td>
          <Text sx={{ whiteSpace: "nowrap" }}>
            {capitalizeEachWord(item.application_information_full_name)}
          </Text>
        </td>
      )}
      {!hiddenColumnList.includes("application_information_contact_number") && (
        <td>
          <Text sx={{ whiteSpace: "nowrap" }}>
            {mobileNumberFormatter(item.application_information_contact_number)}
          </Text>
        </td>
      )}
      {!hiddenColumnList.includes("application_information_email") && (
        <td>
          <Text>{item.application_information_email}</Text>
        </td>
      )}
      {!hiddenColumnList.includes("application_information_request_id") && (
        <td>
          <Anchor
            target="_blank"
            href={`/${formatTeamNameToUrlKey(team.team_name)}/requests/${
              item.application_information_request_id
            }`}
          >
            {item.application_information_request_id}
          </Anchor>
        </td>
      )}
      {!hiddenColumnList.includes("application_information_score") && (
        <td>
          <Text>{item.application_information_score}</Text>
        </td>
      )}
      {!hiddenColumnList.includes("general_assessment_request_id") && (
        <td>
          <Anchor
            target="_blank"
            href={`/${formatTeamNameToUrlKey(team.team_name)}/requests/${
              item.general_assessment_request_id
            }`}
          >
            {item.general_assessment_request_id}
          </Anchor>
        </td>
      )}
      {!hiddenColumnList.includes("general_assessment_score") && (
        <td>
          <Text>{item.general_assessment_score}</Text>
        </td>
      )}
      {!hiddenColumnList.includes("technical_assessment_request_id") && (
        <td>
          <Anchor
            target="_blank"
            href={`/${formatTeamNameToUrlKey(team.team_name)}/requests/${
              item.technical_assessment_request_id
            }`}
          >
            {item.technical_assessment_request_id}
          </Anchor>
        </td>
      )}
      {!hiddenColumnList.includes("technical_assessment_score") && (
        <td>
          <Text>{item.technical_assessment_score}</Text>
        </td>
      )}
      {!hiddenColumnList.includes("background_check_date_created") && (
        <td>
          <Text sx={{ whiteSpace: "nowrap" }}>
            {formatDate(new Date(item.background_check_date_created))}
          </Text>
        </td>
      )}
      {!hiddenColumnList.includes("background_check_status") && (
        <td>
          <Badge
            variant="filled"
            color={getStatusToColor(item.background_check_status)}
          >
            {item.background_check_status}
          </Badge>
        </td>
      )}
      <td>
        {item.background_check_status === "PENDING" && (
          <Flex align="center" justify="center" gap="xs" wrap="wrap">
            <Button
              color="green"
              w={130}
              onClick={() => openModal("QUALIFIED")}
            >
              Qualified
            </Button>
            <Button
              color="red"
              w={130}
              onClick={() => openModal("UNQUALIFIED")}
            >
              Unqualified
            </Button>
          </Flex>
        )}
      </td>
    </tr>
  );
};

export default BackgroundCheckMainTableRow;
