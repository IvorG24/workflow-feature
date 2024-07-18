import { createStyles } from "@mantine/core";
import { IconCaretDown, IconCaretUp } from "@tabler/icons-react";
import { DataTable, DataTableColumn } from "mantine-datatable";

type DataTableProps<T = Record<string, unknown>> = {
  idAccessor?: string;
  records?: T[];
  fetching: boolean;
  page: number;
  onPageChange: (page: number) => void;
  totalRecords: number | undefined;
  columns: DataTableColumn<T>[];
  recordsPerPage: number;
  sortStatus: {
    columnAccessor: string;
    direction: "asc" | "desc";
  };
  onSortStatusChange?: (sortStatus: {
    columnAccessor: string;
    direction: "asc" | "desc";
  }) => void;
};

const useStyles = createStyles((theme) => ({
  root: {
    border: `1px dashed ${theme.colors.black}`,
    borderRadius: theme.radius.md,
  },
  header: {
    "&& th": {
      color: "white",
      backgroundColor: theme.colors.blue[5],
      transition: "background-color 0.3s ease",
      "&:hover": {
        backgroundColor: theme.colors.blue[9],
      },
    },
  },
}));

const ListTable = (props: DataTableProps) => {
  const { classes } = useStyles();
  return (
    <DataTable
      classNames={classes}
      withColumnBorders
      borderColor={"#CDD1D6"}
      rowBorderColor={"#CDD1D6"}
      highlightOnHover
      fontSize={16}
      withBorder
      textSelectionDisabled
      sortIcons={{
        sorted: <IconCaretUp size={14} fill="black" color="black" />,
        unsorted: <IconCaretDown size={14} fill="black" color="black" />,
      }}
      styles={(theme) => ({
        header: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[5]
              : theme.colors.gray[1],
          color: "red",
        },
      })}
      minHeight={390}
      {...props}
    />
  );
};

export default ListTable;
