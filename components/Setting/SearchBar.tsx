import { Search } from "@/components/Icon";
import { TextInput } from "@mantine/core";
import { InputHTMLAttributes, MouseEventHandler } from "react";
import styles from "./SearchBar.module.scss";

type Props = {
  onClear: MouseEventHandler<HTMLButtonElement>;
  numberOfMembers: number;
} & InputHTMLAttributes<HTMLInputElement>;

const SearchBar = ({ onClear, numberOfMembers, ...inputProps }: Props) => {
  return (
    <div className={styles.searchMembers}>
      <p>{numberOfMembers} members</p>
      <TextInput
        placeholder="Search via member name"
        name="search"
        className={styles.inputSearch}
        aria-label="Search via member name"
        rightSection={<Search />}
      />
      {inputProps.value && (
        <button
          onClick={onClear}
          aria-label="Clear search"
          className={styles.clear}
        ></button>
      )}
    </div>
  );
};

export default SearchBar;
