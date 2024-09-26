import {
  ApplicationInformationFieldObjectType,
  ApplicationInformationSpreadsheetData,
  SectionWithFieldType,
} from "@/utils/types";
import {
  ActionIcon,
  Box,
  Button,
  Center,
  createStyles,
  Flex,
  LoadingOverlay,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import {
  IconArrowDown,
  IconArrowsSort,
  IconArrowUp,
  IconChevronDown,
} from "@tabler/icons-react";

import { Dispatch, SetStateAction } from "react";
import ApplicationInformationMainTableRow, {
  duplicatableFieldIdList,
} from "./ApplicationInformationMainTableRow";

const unsortableFieldList = [
  "Approver",
  "Contact Number",
  "Email Address",
  "SSS ID Number",
  "Philhealth Number",
  "Pag-IBIG Number",
  "TIN",
];

export const requestColumnList = [
  {
    field_id: "request_formsly_id",
    field_name: "Request ID",
    field_type: "TEXT",
  },
  {
    field_id: "request_date_created",
    field_name: "Date Created",
    field_type: "DATE",
  },
  {
    field_id: "request_status",
    field_name: "Status",
    field_type: "TEXT",
  },
  {
    field_id: "request_status_date_updated",
    field_name: "Date Updated",
    field_type: "DATE",
  },
  {
    field_id: "Approver",
    field_name: "Approver",
    field_type: "Approver",
  },
];

export type ClassNameType =
  | "Header"
  | "Personal Information"
  | "Contact Information"
  | "ID Number"
  | "Educational Background"
  | "Work Information"
  | "Resume";

const useStyles = createStyles((theme) => ({
  parentTable: {
    "& td": {
      minWidth: 130,
      width: "100%",
    },
  },
  Request: {
    backgroundColor: theme.colors.blue[3],
  },
  Header: {
    backgroundColor: theme.colors.cyan[3],
  },
  "Personal Information": {
    backgroundColor: theme.colors.teal[3],
  },
  "Contact Information": {
    backgroundColor: theme.colors.green[3],
  },
  "ID Number": {
    backgroundColor: theme.colors.red[3],
  },
  "Educational Background": {
    backgroundColor: theme.colors.grape[3],
  },
  "Work Information": {
    backgroundColor: theme.colors.violet[3],
  },
  Resume: {
    backgroundColor: theme.colors.indigo[3],
  },
}));

type Props = {
  data: ApplicationInformationSpreadsheetData[];
  sectionList: SectionWithFieldType[];
  isLoading: boolean;
  page: number;
  handlePagination: (page: number) => void;
  sort: { field: string; order: string; dataType: string };
  setSort: Dispatch<
    SetStateAction<{ field: string; order: string; dataType: string }>
  >;
  isMax: boolean;
  hiddenColumnList: string[];
};

const ApplicationInformationSpreadsheetTable = ({
  data,
  sectionList,
  isLoading,
  page,
  handlePagination,
  sort,
  setSort,
  isMax,
  hiddenColumnList,
}: Props) => {
  const { classes } = useStyles();

  const fieldObject: ApplicationInformationFieldObjectType = {};
  sectionList.forEach((section) => {
    section.section_field.forEach((field) => {
      fieldObject[field.field_id] = {
        ...field,
        field_section: section,
      };
    });
  });

  const handleSortClick = (field: string, dataType: string) => {
    setSort((prev) => {
      if (prev.field === field) {
        return {
          field,
          order: prev.order === "ASC" ? "DESC" : "ASC",
          dataType,
        };
      } else {
        return {
          field,
          order: "DESC",
          dataType,
        };
      }
    });
  };

  const sortButtons = (field: {
    field_id: string;
    field_type: string;
    field_name: string;
  }) => {
    return (
      <ActionIcon
        onClick={() => {
          handleSortClick(field.field_id, field.field_type);
        }}
        color={sort.field !== field.field_id ? "dark" : "blue"}
        variant={sort.field !== field.field_id ? "subtle" : "light"}
      >
        {sort.field !== field.field_id && <IconArrowsSort size={14} />}
        {sort.field === field.field_id && sort.order === "ASC" && (
          <IconArrowUp size={14} />
        )}
        {sort.field === field.field_id && sort.order === "DESC" && (
          <IconArrowDown size={14} />
        )}
      </ActionIcon>
    );
  };

  const renderRequestFieldList = () => {
    return requestColumnList
      .filter((field) => !hiddenColumnList.includes(field.field_name))
      .map((field, index) => (
        <th key={index} className={classes["Request"]}>
          <Flex gap="xs" align="center" justify="center" wrap="wrap">
            <Text>{field.field_name}</Text>
            {!unsortableFieldList.includes(field.field_name) &&
              sortButtons(field)}
          </Flex>
        </th>
      ));
  };

  const renderFieldList = () => {
    const fieldList: {
      field_name: string;
      field_id: string;
      field_type: string;
      section_name: string;
    }[] = [];
    sectionList.forEach((section) => {
      if (section.section_name !== "Most Recent Work Experience") {
        section.section_field.forEach((field) => {
          fieldList.push({
            field_id: field.field_id,
            field_name: field.field_name,
            field_type: field.field_type,
            section_name: section.section_name,
          });
        });
      }
    });

    return fieldList
      .filter((field) => !hiddenColumnList.includes(field.field_id))
      .map((field, index) => (
        <th
          key={index}
          className={classes[field.section_name as ClassNameType]}
        >
          <Flex gap="xs" align="center" justify="center" wrap="wrap">
            <Text>{field.field_name}</Text>
            {!unsortableFieldList.includes(field.field_name) &&
              sortButtons(field)}
          </Flex>
        </th>
      ));
  };

  return (
    <Stack>
      <Paper p="xs" pos="relative">
        <ScrollArea type="auto" scrollbarSize={10}>
          <LoadingOverlay
            visible={isLoading}
            overlayBlur={0}
            overlayOpacity={0}
          />
          <Table withBorder withColumnBorders className={classes.parentTable}>
            <thead>
              <tr>
                {renderRequestFieldList()}
                {renderFieldList()}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <ApplicationInformationMainTableRow
                  key={item.request_id}
                  item={item}
                  fieldObject={fieldObject}
                  hiddenColumnList={hiddenColumnList}
                />
              ))}
              <tr>
                {Array.from(
                  {
                    length:
                      Object.keys(fieldObject).length +
                      requestColumnList.length -
                      duplicatableFieldIdList.length -
                      hiddenColumnList.length,
                  },
                  (_, index) => index
                ).map((index) => (
                  <td style={{ padding: 0, borderTop: "0" }} key={index}>
                    <Box
                      h="xs"
                      sx={(theme) => ({
                        backgroundColor: theme.colors.blue[0],
                      })}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </Table>
        </ScrollArea>
        {!isMax && (
          <Center mt="md">
            <Button
              leftIcon={<IconChevronDown size={16} />}
              onClick={() => handlePagination(page + 1)}
              disabled={isLoading}
              variant="subtle"
            >
              {isLoading ? "Loading..." : "Load More"}
            </Button>
          </Center>
        )}
      </Paper>
    </Stack>
  );
};

export default ApplicationInformationSpreadsheetTable;
