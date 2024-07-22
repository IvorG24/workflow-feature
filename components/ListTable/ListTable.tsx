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
    borderRadius: theme.radius.sm,
  },
  header: {
    "&& th": {
      color: "white",
      backgroundColor: theme.colors.blue[5],
      transition: "background-color 0.3s ease",
      "&:hover": {
        backgroundColor: theme.colors.blue[9],
        color: theme.colors.blue[3]
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
      sortIcons={{
        sorted: <IconCaretUp size={14} fill="white" color="white" />,
        unsorted: <IconCaretDown size={14} fill="white" color="white" />,
      }}
      minHeight={390}
      {...props}
    />
  );
};

export default ListTable;
