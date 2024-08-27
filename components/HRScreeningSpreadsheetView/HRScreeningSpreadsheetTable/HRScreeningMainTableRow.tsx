import { useActiveTeam } from "@/stores/useTeamStore";
import { formatDate } from "@/utils/constant";
import { safeParse } from "@/utils/functions";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { getStatusToColor } from "@/utils/styling";
import { HRScreeningSpreadsheetData } from "@/utils/types";
import { Anchor, Badge, Button, createStyles, Flex, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconCheck, IconX } from "@tabler/icons-react";

const useStyles = createStyles((theme) => ({
  row: {
    "& td": {
      backgroundColor: theme.colors.blue[0],
    },
  },
}));

type Props = {
  item: HRScreeningSpreadsheetData;
  hiddenColumnList: string[];
  handleUpdateHRScreeningStatus: (
    applicationinformationRqeuestId: string,
    status: string
  ) => void;
};

const HRScreeningMainTableRow = ({
  item,
  hiddenColumnList,
  handleUpdateHRScreeningStatus,
}: Props) => {
  const { classes } = useStyles();
  const team = useActiveTeam();

  const openModel = (action: string) =>
    modals.openConfirmModal({
      title: <Text>Please confirm your action.</Text>,
      children: (
        <Text>{`Are you sure you want to ${
          action === "APPORVED" ? "approve" : "reject"
        } this screening?`}</Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      centered: true,
      confirmProps: { color: action === "APPROVED" ? "green" : "red" },
      onConfirm: async () =>
        handleUpdateHRScreeningStatus(item.hr_request_reference_id, action),
    });

  if (!team.team_name) return null;

  return (
    <tr className={classes.row}>
      {!hiddenColumnList.includes("position") && (
        <td>
          <Text>{safeParse(item.position)}</Text>
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
      {!hiddenColumnList.includes("online_application_request_id") && (
        <td>
          <Anchor
            target="_blank"
            href={`/${formatTeamNameToUrlKey(team.team_name)}/requests/${
              item.online_application_request_id
            }`}
          >
            {item.online_application_request_id}
          </Anchor>
        </td>
      )}
      {!hiddenColumnList.includes("online_application_score") && (
        <td>
          <Text>{item.online_application_score}</Text>
        </td>
      )}
      {!hiddenColumnList.includes("online_assessment_request_id") && (
        <td>
          <Anchor
            target="_blank"
            href={`/${formatTeamNameToUrlKey(team.team_name)}/requests/${
              item.online_assessment_request_id
            }`}
          >
            {item.online_assessment_request_id}
          </Anchor>
        </td>
      )}
      {!hiddenColumnList.includes("online_assessment_score") && (
        <td>
          <Text>{item.online_assessment_score}</Text>
        </td>
      )}
      {!hiddenColumnList.includes("online_assessment_date") && (
        <td>
          <Text>{formatDate(new Date(item.online_assessment_date))}</Text>
        </td>
      )}
      {!hiddenColumnList.includes("hr_screening_status") && (
        <td>
          <Badge
            variant="filled"
            color={getStatusToColor(item.hr_screening_status)}
          >
            {item.hr_screening_status}
          </Badge>
        </td>
      )}
      <td>
        {item.hr_screening_status === "PENDING" && (
          <Flex align="center" justify="center" gap="xs" wrap="wrap">
            <Button
              color="green"
              w={120}
              leftIcon={<IconCheck size={16} />}
              onClick={() => openModel("APPROVED")}
            >
              Approve
            </Button>
            <Button
              color="red"
              w={120}
              leftIcon={<IconX size={16} />}
              onClick={() => openModel("REJECTED")}
            >
              Reject
            </Button>
          </Flex>
        )}
      </td>
    </tr>
  );
};

export default HRScreeningMainTableRow;
