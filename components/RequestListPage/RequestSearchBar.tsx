import { TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

const RequestSearchBar = () => {
  return (
    <TextInput
      maw={300}
      radius="xl"
      size="xs"
      placeholder="Search by request id"
      icon={<IconSearch size={14} />}
    />
  );
};

export default RequestSearchBar;
