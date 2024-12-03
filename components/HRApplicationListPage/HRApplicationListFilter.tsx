import { useUserTeamMember } from "@/stores/useUserStore";
import { ApplicationListFilterValues } from "@/utils/types";
import { ActionIcon, Button, Divider, Flex, TextInput } from "@mantine/core";
import { IconPlus, IconReload, IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useFormContext } from "react-hook-form";

type Props = {
  handleFilterForms: () => void;
  isFetchingApplicationList: boolean;
};

const HRApplicationListFilter = ({
  handleFilterForms,
  isFetchingApplicationList,
}: Props) => {
  const router = useRouter();
  const teamMember = useUserTeamMember();
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
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={async () => {
            if (!teamMember) return;
            await router.push({
              pathname: `/public-form/16ae1f62-c553-4b0e-909a-003d92828036/create`,
              query: { hrTeamMemberId: teamMember.team_member_id },
            });
          }}
          ml="auto"
        >
          Create Application
        </Button>
      </Flex>
      <Divider my="md" />
    </>
  );
};

export default HRApplicationListFilter;
