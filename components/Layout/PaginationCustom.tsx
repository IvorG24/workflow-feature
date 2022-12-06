import {
  GroupPosition,
  Pagination,
  useMantineColorScheme,
} from "@mantine/core";
import styles from "./PaginationCustom.module.scss";

type Props = {
  total: number;
  position?: GroupPosition;
  page?: number | undefined;
  onChange?: ((page: number) => void) | undefined;
};

const PaginationCustom = ({ total, position, page, onChange }: Props) => {
  const { colorScheme } = useMantineColorScheme();
  return (
    <Pagination
      total={total}
      position={position}
      page={page}
      onChange={onChange}
      className={`${styles.pagination} ${
        colorScheme === "dark" ? styles.dark : ""
      }`}
    />
  );
};

export default PaginationCustom;
