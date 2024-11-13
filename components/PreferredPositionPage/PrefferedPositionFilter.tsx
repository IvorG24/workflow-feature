import { ActionIcon, Flex, TextInput, Title } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";

type Props = {
  handleFilterForms: () => void;
  isLoading: boolean;
};
const PrefferedPositionFilter = ({ handleFilterForms, isLoading }: Props) => {
  const { register } = useFormContext();

  return (
    <Flex justify="space-between" rowGap="xs" wrap="wrap">
      <Title order={3} color="dimmed">
        HUMAN RESOURCES GROUP
      </Title>

      <TextInput
        {...register("search")}
        placeholder="Filter By Name"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            
            handleFilterForms();
          }
        }}
        rightSection={
          <ActionIcon disabled={isLoading} onClick={() => handleFilterForms()}>
            <IconSearch size={16} />
          </ActionIcon>
        }
      />
    </Flex>
  );
};

export default PrefferedPositionFilter;
