import { formatDate } from "@/utils/constant";
import { safeParse } from "@/utils/functions";
import { HRScreeningSpreadsheetData } from "@/utils/types";
import { createStyles, Text } from "@mantine/core";

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
};

const HRScreeningMainTableRow = ({ item, hiddenColumnList }: Props) => {
  const { classes } = useStyles();

  return (
    <tr className={classes.row}>
      {!hiddenColumnList.includes("position") && (
        <td>
          <Text>{safeParse(item.position)}</Text>
        </td>
      )}
      {!hiddenColumnList.includes("application_information_request_id") && (
        <td>
          <Text>{item.application_information_request_id}</Text>
        </td>
      )}
      {!hiddenColumnList.includes("online_application_request_id") && (
        <td>
          <Text>{item.online_application_request_id}</Text>
        </td>
      )}
      {!hiddenColumnList.includes("online_application_score") && (
        <td>
          <Text>{item.online_application_score}</Text>
        </td>
      )}
      {!hiddenColumnList.includes("online_assessment_request_id") && (
        <td>
          <Text>{item.online_assessment_request_id}</Text>
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
    </tr>
  );
};

export default HRScreeningMainTableRow;
