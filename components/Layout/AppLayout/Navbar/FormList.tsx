import { useFormList } from "@/stores/useFormStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { UNHIDEABLE_FORMLY_FORMS } from "@/utils/constant";
import { formatTeamNameToUrlKey } from "@/utils/string";
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
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const FormList = () => {
  const router = useRouter();

  const forms = useFormList();
  const teamMember = useUserTeamMember();
  const activeTeam = useActiveTeam();

  const isFormslyTeam = forms.some((form) => form.form_is_formsly_form);

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
              onClick={async () =>
                await router.push(
                  `/${formatTeamNameToUrlKey(activeTeam.team_name)}/forms`
                )
              }
            >
              View All (
              {isFormslyTeam
                ? forms.length - UNHIDEABLE_FORMLY_FORMS.length
                : forms.length}
              )
            </Anchor>
          </Text>
          <Button
            variant="light"
            size="xs"
            onClick={async () =>
              await router.push(
                `/${formatTeamNameToUrlKey(activeTeam.team_name)}/forms/build`
              )
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
        data={
          formList
            ?.filter(
              (form) => !UNHIDEABLE_FORMLY_FORMS.includes(form.form_name)
            )
            .map((form) => form.form_name) as string[]
        }
      />
      <Navbar.Section grow component={ScrollArea} mx="-xs" px="xs" mt="sm">
        {formList
          .filter(
            (form) =>
              !(
                form.form_is_formsly_form &&
                UNHIDEABLE_FORMLY_FORMS.includes(form.form_name)
              )
          )
          .map((form) => {
            const isGroupMember = Boolean(form.form_team_group?.length);
            return !form.form_is_hidden &&
              (form.form_is_for_every_member || isGroupMember) ? (
              <NavLink
                key={form.form_id}
                label={form.form_name}
                rightSection={<IconPlus size={14} />}
                onClick={async () =>
                  await router.push(
                    `/${formatTeamNameToUrlKey(activeTeam.team_name)}/forms/${
                      form.form_id
                    }/create`
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
