import { useFormList } from "@/stores/useFormStore";
import { useActiveApp } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { FormTableRow } from "@/utils/types";
import {
  Anchor,
  Autocomplete,
  Button,
  Group,
  NavLink,
  Navbar,
  ScrollArea,
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

  const [formList, setFormList] = useState<
    (FormTableRow & { form_team_group: string[] })[]
  >([]);

  useEffect(() => {
    setFormList(forms as (FormTableRow & { form_team_group: string[] })[]);
  }, [forms]);

  const handleSearchForm = (value: string) => {
    if (!value) {
      return setFormList(
        forms as (FormTableRow & { form_team_group: string[] })[]
      );
    }
    const filteredFormList = forms.filter((form) =>
      form.form_name.toLowerCase().includes(value.toLowerCase())
    );
    setFormList(
      filteredFormList as (FormTableRow & { form_team_group: string[] })[]
    );
  };

  return (
    <>
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
      <Navbar.Section grow component={ScrollArea} mx="-xs" px="xs" mt="sm">
        {formList.map((form) => {
          const isGroupMember = Boolean(form.form_team_group.length);

          return !form.form_is_hidden &&
            (form.form_is_for_every_member || isGroupMember) ? (
            <NavLink
              key={form.form_id}
              label={form.form_name}
              rightSection={<IconPlus size={14} />}
              onClick={() =>
                router.push(
                  `/team-${lowerCase(activeApp)}s/forms/${form.form_id}/create`
                )
              }
            />
          ) : null;
        })}
      </Navbar.Section>
    </>
  );
};

export default FormList;
