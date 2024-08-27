import { useActiveTeam } from "@/stores/useTeamStore";
import { formatDate } from "@/utils/constant";
import { safeParse } from "@/utils/functions";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { getStatusToColor } from "@/utils/styling";
import { HRPhoneInterviewSpreadsheetData } from "@/utils/types";
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
  item: HRPhoneInterviewSpreadsheetData;
  hiddenColumnList: string[];
  handleUpdateHRPhoneInterviewStatus: (
    applicationinformationRqeuestId: string,
    status: string
  ) => void;
};

const HRPhoneInterviewMainTableRow = ({
  item,
  hiddenColumnList,
  handleUpdateHRPhoneInterviewStatus,
}: Props) => {
  const { classes } = useStyles();
  const team = useActiveTeam();

  const openModel = (action: string) =>
    modals.openConfirmModal({
      title: <Text>Please confirm your action.</Text>,
      children: (
        <Text>{`Are you sure you want to ${
          action === "APPORVED" ? "approve" : "reject"
        } this applicant?`}</Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      centered: true,
      confirmProps: { color: action === "APPROVED" ? "green" : "red" },
      onConfirm: async () =>
        handleUpdateHRPhoneInterviewStatus(
          item.hr_request_reference_id,
          action
        ),
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
      {!hiddenColumnList.includes("technical_assessment_date") && (
        <td>
          <Text>{formatDate(new Date(item.technical_assessment_date))}</Text>
        </td>
      )}
      {!hiddenColumnList.includes("hr_phone_interview_status") && (
        <td>
          <Badge
            variant="filled"
            color={getStatusToColor(item.hr_phone_interview_status)}
          >
            {item.hr_phone_interview_status}
          </Badge>
        </td>
      )}
      <td>
        {item.hr_phone_interview_status === "PENDING" && (
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

export default HRPhoneInterviewMainTableRow;
