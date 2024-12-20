import { ApplicationListFilterValues } from "@/utils/types";
import { ActionIcon, Button, Divider, Flex, TextInput } from "@mantine/core";
import { IconReload, IconSearch } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";

type Props = {
  handleFilterForms: () => void;
  isFetchingApplicationList: boolean;
};

const UserApplicationListFilter = ({
  handleFilterForms,

  isFetchingApplicationList,
}: Props) => {
  const { register } = useFormContext<ApplicationListFilterValues>();

  return (
    <>
      <Flex gap="sm" wrap="wrap" align="center" direction="row">
        <TextInput
          placeholder="Search by application id"
          rightSection={
            <ActionIcon
              disabled={isFetchingApplicationList}
              size="xs"
              type="submit"
            >
              <IconSearch />
            </ActionIcon>
          }
          {...register("search")}
          sx={{ flex: 2 }}
          miw={250}
          maw={320}
        />
        <Button
          variant="light"
          leftIcon={<IconReload size={16} />}
          onClick={() => {
            handleFilterForms();
          }}
          disabled={isFetchingApplicationList}
        >
          Refresh
        </Button>
      </Flex>
      <Divider my="md" />
    </>
  );
};

export default UserApplicationListFilter;
