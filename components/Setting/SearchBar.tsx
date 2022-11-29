import { Search } from "@/components/Icon";
import { Flex, TextInput } from "@mantine/core";
import { InputHTMLAttributes, MouseEventHandler } from "react";
import styles from "./SearchBar.module.scss";

type Props = {
  onClear: MouseEventHandler<HTMLButtonElement>;
  numberOfMembers: number;
} & InputHTMLAttributes<HTMLInputElement>;

const SearchBar = ({ onClear, numberOfMembers, ...inputProps }: Props) => {
  return (
    <Flex
      gap="sm"
      direction={{ base: "column", lg: "row-reverse" }}
      align={{ base: "flex-start", lg: "center" }}
      justify={{ lg: "flex-start" }}
      mb="sm"
    >
      <TextInput placeholder="Search members" rightSection={<Search />} />
      <small>{numberOfMembers} members</small>
      {inputProps.value && (
        <button
          onClick={onClear}
          aria-label="Clear search"
          className={styles.clear}
        ></button>
      )}
    </Flex>
  );
};

export default SearchBar;
