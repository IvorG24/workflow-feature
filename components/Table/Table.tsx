import { Table, TableProps } from "@mantine/core";
import { ReactNode } from "react";
import styles from "./Table.module.scss";

type Props = {
  children: ReactNode;
} & TableProps;

const CustomTable = ({ children, ...tableProps }: Props) => {
  return (
    <Table
      className={styles.table}
      sx={(theme) => ({
        "& thead": {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.green[1],
        },
      })}
      verticalSpacing="sm"
      {...tableProps}
    >
      {children}
    </Table>
  );
};

export default CustomTable;
