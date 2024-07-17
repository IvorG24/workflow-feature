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
};

const ListTable = (props: DataTableProps) => {
  return (
    <DataTable
      fontSize={16}
      withBorder={true}
      sx={{
        thead: {
          tr: {
            backgroundColor: "transparent",
          },
        },
      }}
      styles={(theme) => ({
        header: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[5]
              : theme.colors.gray[1],
        },
      })}
      minHeight={390}
      {...props}
    />
  );
};

export default ListTable;
