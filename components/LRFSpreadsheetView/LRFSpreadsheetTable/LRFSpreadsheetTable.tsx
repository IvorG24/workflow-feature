import { LRFSpreadsheetData } from "@/utils/types";
import {
  Button,
  Center,
  LoadingOverlay,
  Paper,
  ScrollArea,
  Stack,
  Table,
  createStyles,
} from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import LRFMainTableRow from "./LRFMainTableRow";

const useStyles = createStyles((theme) => ({
  parentTable: {
    "& th": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.blue[6]
          : theme.colors.red[3],
      height: 48,
    },
    "& tbody": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.red[9]
          : theme.colors.red[0],
    },
    "& td": {
      minWidth: 130,
      width: "100%",
    },
  },
}));

type Props = {
  data: LRFSpreadsheetData[];
  loading: boolean;
  page: number;
  handlePagination: (page: number) => void;
};

const LRFSpreadsheetTable = ({
  data,
  loading,
  page,
  handlePagination,
}: Props) => {
  const { classes } = useStyles();
  return (
    <Stack>
      <Paper p="xs" pos="relative">
        <ScrollArea type="auto" scrollbarSize={10}>
          <LoadingOverlay
            visible={loading}
            overlayBlur={0}
            overlayOpacity={0}
          />
          <Table withBorder withColumnBorders className={classes.parentTable}>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Project Code</th>
                <th>Department Code</th>
                <th>Jira ID</th>
                <th>Date Created</th>
                <th>BOQ Request</th>
                <th>Payee</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <LRFMainTableRow
                  key={item.request_id}
                  item={item}
                  index={index}
                />
              ))}
            </tbody>
          </Table>
        </ScrollArea>
        <Center mt="md">
          <Button
            leftIcon={<IconChevronDown size={16} />}
            onClick={() => handlePagination(page + 1)}
            disabled={loading}
            variant="subtle"
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </Center>
      </Paper>
    </Stack>
  );
};

export default LRFSpreadsheetTable;
