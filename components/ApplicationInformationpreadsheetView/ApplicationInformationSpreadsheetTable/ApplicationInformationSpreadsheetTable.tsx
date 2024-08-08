import {
  ApplicationInformationFieldObjectType,
  ApplicationInformationSpreadsheetData,
  SectionWithFieldType,
} from "@/utils/types";
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
import ApplicationInformationMainTableRow from "./ApplicationInformationMainTableRow";

const useStyles = createStyles((theme) => ({
  parentTable: {
    "& th": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.blue[6]
          : theme.colors.blue[3],
      height: 48,
    },
    "& tbody": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.blue[9]
          : theme.colors.blue[0],
    },
    "& td": {
      minWidth: 130,
      width: "100%",
    },
  },
}));

type Props = {
  data: ApplicationInformationSpreadsheetData[];
  sectionList: SectionWithFieldType[];
  loading: boolean;
  page: number;
  handlePagination: (page: number) => void;
};

const ApplicationInformationSpreadsheetTable = ({
  data,
  sectionList,
  loading,
  page,
  handlePagination,
}: Props) => {
  const { classes } = useStyles();

  const fieldObject: ApplicationInformationFieldObjectType = {};
  sectionList.map((section) => {
    section.section_field.map((field) => {
      fieldObject[field.field_id] = {
        ...field,
        field_section: section,
      };
    });
  });

  const renderFieldList = () => {
    const fieldList: string[] = [];
    sectionList.forEach((section) => {
      section.section_field.forEach((field) => {
        fieldList.push(field.field_name);
      });
    });

    return fieldList.map((field, index) => <th key={index}>{field}</th>);
  };

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
                <th>Date Created</th>
                <th>Status</th>
                <th>Date Updated</th>
                <th>Approver</th>
                {renderFieldList()}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <ApplicationInformationMainTableRow
                  key={item.request_id}
                  item={item}
                  fieldObject={fieldObject}
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

export default ApplicationInformationSpreadsheetTable;
