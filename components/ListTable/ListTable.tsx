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
    borderRadius: theme.radius.sm,
    "&& th": {
      color: "white",
      backgroundColor: theme.colors.blue[5],
      transition: "background-color 0.3s ease",
      '& svg': {
          fill: 'white',
          color: 'white'
        },
      "&:hover": {
        backgroundColor: '#0042ab !important',
        color: 'white !important',
        '& svg': {
          fill: 'white',
          color: 'white'
        },
      },
    },
    "&& td": {
      borderBottom: '1px solid #CDD1D6'
    }
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
      minHeight={390}
      {...props}
    />
  );
};

export default ListTable;
