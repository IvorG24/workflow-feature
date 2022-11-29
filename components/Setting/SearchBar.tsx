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
      <TextInput
        w="100%"
        maw="400px"
        placeholder="Search members"
        rightSection={<Search />}
      />
      <small>{numberOfMembers} members</small>
      {inputProps.value && (
        // todo: use Mantine Button
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
