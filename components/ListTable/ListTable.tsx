import { createStyles } from "@mantine/core";
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
    "&& th": { color: "white", backgroundColor: theme.colors.blue[5] },
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
