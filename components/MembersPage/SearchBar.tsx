import { Search } from "@/components/Icon";
import { Flex, Text, TextInput } from "@mantine/core";
import { Dispatch, InputHTMLAttributes, SetStateAction } from "react";

type Props = {
  // onClear: MouseEventHandler<HTMLButtonElement>;
  numberOfMembers: number;
  setSearchBarValue: Dispatch<SetStateAction<string>>;
} & InputHTMLAttributes<HTMLInputElement>;

const SearchBar = ({ numberOfMembers, value, setSearchBarValue }: Props) => {
  return (
    <Flex
      gap="sm"
      direction={{ base: "column", md: "row-reverse" }}
      align={{ base: "flex-start", md: "center" }}
      justify={{ lg: "flex-start" }}
      mb={{ base: "sm", md: "0" }}
    >
      <TextInput
        w={{ base: "100%", md: "auto", xl: "400px" }}
        maw="400px"
        placeholder="Search members"
        value={value}
        onChange={(e) => setSearchBarValue(e.target.value)}
        rightSection={<Search />}
      />
      <Text fw={700}>{numberOfMembers} members</Text>
      {/* {inputProps.value && (
        // todo: use Mantine Button
        <button
          onClick={onClear}
          aria-label="Clear search"
          className={styles.clear}
        ></button>
      )} */}
    </Flex>
  );
};

export default SearchBar;
