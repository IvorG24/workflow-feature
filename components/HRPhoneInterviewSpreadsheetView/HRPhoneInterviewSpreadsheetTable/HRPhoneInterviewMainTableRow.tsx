import { useActiveTeam } from "@/stores/useTeamStore";
import { formatDate, formatTime } from "@/utils/constant";
import { safeParse } from "@/utils/functions";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { getStatusToColor, mobileNumberFormatter } from "@/utils/styling";
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
        <Text>{`Are you sure this applicant is ${
          action === "QUALIFIED" ? "qualified" : "unqualified"
        }?`}</Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      centered: true,
      confirmProps: { color: action === "QUALIFIED" ? "green" : "red" },
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
      {!hiddenColumnList.includes("application_information_full_name") && (
        <td>
          <Text sx={{ whiteSpace: "nowrap" }}>
            {item.application_information_full_name}
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
      {!hiddenColumnList.includes("hr_phone_interview_schedule") && (
        <td>
          {item.hr_phone_interview_schedule ? (
            <>
              <Text sx={{ whiteSpace: "nowrap" }}>
                Date: {formatDate(new Date(item.hr_phone_interview_schedule))}
              </Text>
              <Text sx={{ whiteSpace: "nowrap" }}>
                Time: {formatTime(new Date(item.hr_phone_interview_schedule))}
              </Text>
            </>
          ) : (
            ""
          )}
        </td>
      )}
      <td>
        {item.hr_phone_interview_status === "PENDING" && (
          <Flex align="center" justify="center" gap="xs" wrap="wrap">
            <Button
              color="green"
              w={130}
              leftIcon={<IconCheck size={16} />}
              onClick={() => openModel("QUALIFIED")}
            >
              Qualified
            </Button>
            <Button
              color="red"
              w={130}
              leftIcon={<IconX size={16} />}
              onClick={() => openModel("UNQUALIFIED")}
            >
              Unqualified
            </Button>
          </Flex>
        )}
      </td>
    </tr>
  );
};

export default HRPhoneInterviewMainTableRow;
