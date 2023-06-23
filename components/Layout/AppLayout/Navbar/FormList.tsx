import { useFormList } from "@/stores/useFormStore";
import { useActiveApp } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { GROUP_CONNECTION } from "@/utils/constant";
import { FormTableRow, TeamGroupForFormType } from "@/utils/types";
import {
  Anchor,
  Autocomplete,
  Box,
  Button,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { lowerCase } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const FormList = () => {
  const router = useRouter();

  const forms = useFormList();
  const activeApp = useActiveApp();
  const teamMember = useUserTeamMember();

  const [formList, setFormList] = useState<FormTableRow[]>([]);

  useEffect(() => {
    setFormList(forms);
  }, [forms]);

  const handleSearchForm = (value: string) => {
    if (!value) {
      return setFormList(forms);
    }
    const filteredFormList = forms.filter((form) =>
      form.form_name.toLowerCase().includes(value.toLowerCase())
    );
    setFormList(filteredFormList);
  };

  return (
    <Box h="fit-content">
      {teamMember?.team_member_role === "ADMIN" ||
      teamMember?.team_member_role === "OWNER" ? (
        <Group mb="sm" position="apart">
          <Text mb={4} size="xs" weight={400}>
            <Anchor
              onClick={() =>
                router.push(`/team-${lowerCase(activeApp)}s/forms`)
              }
            >
              View All ({forms.length})
            </Anchor>
          </Text>
          <Button
            variant="light"
            size="xs"
            onClick={() =>
              router.push(`/team-${lowerCase(activeApp)}s/forms/build`)
            }
          >
            Build Form
          </Button>
        </Group>
      ) : null}
      <Autocomplete
        placeholder="Search forms"
        size="xs"
        icon={<IconSearch size={12} stroke={1.5} />}
        rightSectionWidth={70}
        styles={{ rightSection: { pointerEvents: "none" } }}
        onChange={handleSearchForm}
        data={formList?.map((form) => form.form_name) as string[]}
      />
      <ScrollArea h={{ base: 400, sm: 500 }} mt="xs" scrollbarSize={5}>
        <Stack mt="sm" spacing={0}>
          {formList.map((form) => {
            const isGroupMember =
              form.form_is_formsly_form &&
              GROUP_CONNECTION[form.form_name as TeamGroupForFormType]
                ? teamMember?.team_member_group_list.includes(
                    GROUP_CONNECTION[form.form_name as TeamGroupForFormType]
                  )
                : true;

            return !form.form_is_hidden && isGroupMember ? (
              <NavLink
                key={form.form_id}
                label={form.form_name}
                rightSection={<IconPlus size={14} />}
                onClick={() =>
                  router.push(
                    `/team-${lowerCase(activeApp)}s/forms/${
                      form.form_id
                    }/create`
                  )
                }
              />
            ) : null;
          })}
        </Stack>
      </ScrollArea>
    </Box>
  );
};

export default FormList;
